import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ThreeHeroVisual() {
  const mountRef = useRef(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    let animationFrameId;
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch {
      setHasWebGL(false);
      return;
    }

    // 2. Metallic Materials
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xD4AF37, // Metallic Gold
      metalness: 0.88,
      roughness: 0.22,
      wireframe: false,
    });

    const innerCoreMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFD700, // Brilliant Gold
      metalness: 0.95,
      roughness: 0.15,
    });

    const wireframeGoldMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFF0A6,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    const platinumRingMaterial = new THREE.MeshStandardMaterial({
      color: 0xC5CBD3,
      metalness: 0.6,
      roughness: 0.4,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });

    // 3. Geometries & Meshes
    // Main faceted crystal core (Icosahedron)
    const coreGeometry = new THREE.IcosahedronGeometry(1.35, 1);
    const coreMesh = new THREE.Mesh(coreGeometry, goldMaterial);
    scene.add(coreMesh);

    // Inner bright brilliant gold node (Octahedron)
    const innerGeometry = new THREE.OctahedronGeometry(0.7, 0);
    const innerMesh = new THREE.Mesh(innerGeometry, innerCoreMaterial);
    scene.add(innerMesh);

    // Orbiting wireframe sphere
    const wireSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(1.85, 2), wireframeGoldMaterial);
    scene.add(wireSphere);

    // Outer orbiting gimbal rings
    const ringGeometry1 = new THREE.TorusGeometry(2.3, 0.02, 16, 100);
    const ring1 = new THREE.Mesh(ringGeometry1, platinumRingMaterial);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ringGeometry2 = new THREE.TorusGeometry(2.6, 0.02, 16, 100);
    const ring2 = new THREE.Mesh(ringGeometry2, wireframeGoldMaterial);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // 4. Subtle floating code node particles (syntax nodes)
    const particlesCount = 28;
    const particleGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFC928 });
    const particleGroup = new THREE.Group();

    for (let i = 0; i < particlesCount; i++) {
      const pMesh = new THREE.Mesh(particleGeometry, particleMaterial);
      const angle = (i / particlesCount) * Math.PI * 2;
      const radius = 2.1 + (Math.sin(i * 1.5) * 0.5);
      pMesh.position.set(
        Math.cos(angle) * radius,
        (Math.sin(i * 2.3) * 1.2),
        Math.sin(angle) * radius
      );
      particleGroup.add(pMesh);
    }
    scene.add(particleGroup);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainGoldLight = new THREE.DirectionalLight(0xFFD700, 2.2);
    mainGoldLight.position.set(5, 5, 5);
    scene.add(mainGoldLight);

    const rimBlueLight = new THREE.DirectionalLight(0xC5CBD3, 1.2);
    rimBlueLight.position.set(-5, -3, -2);
    scene.add(rimBlueLight);

    const centerGlow = new THREE.PointLight(0xFFC928, 1.8, 8);
    centerGlow.position.set(0, 0, 0);
    scene.add(centerGlow);

    // Mouse movement parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.4;
      targetY = y * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 6. Animation loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera/mesh parallax
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      coreMesh.rotation.y = elapsedTime * 0.35 + mouseX;
      coreMesh.rotation.x = elapsedTime * 0.2 + mouseY;

      innerMesh.rotation.y = -elapsedTime * 0.5;
      innerMesh.rotation.z = elapsedTime * 0.3;

      wireSphere.rotation.y = -elapsedTime * 0.15;
      wireSphere.rotation.x = elapsedTime * 0.1;

      ring1.rotation.z = elapsedTime * 0.25;
      ring2.rotation.x = -elapsedTime * 0.2;

      particleGroup.rotation.y = elapsedTime * 0.18;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer?.dispose();
    };
  }, []);

  if (!hasWebGL) {
    // Static / CSS fallback visual
    return (
      <div className="relative w-full h-[400px] flex items-center justify-center">
        <div className="w-64 h-64 rounded-full border border-gold-metallic/30 flex items-center justify-center relative animate-pulse">
          <div className="w-48 h-48 rounded-full border border-gold-glow/40 flex items-center justify-center">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-charcoal via-obsidian to-gold-metallic/20 border border-gold-metallic flex items-center justify-center shadow-gold-subtle transform rotate-45">
              <span className="font-mono text-2xl font-bold text-gold-metallic -rotate-45">&lt; / &gt;</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[420px] md:h-[480px] flex items-center justify-center">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-gold-metallic/5 via-transparent to-transparent pointer-events-none rounded-3xl" />
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
        title="Interactive 3D Code Vibe Neural Core"
      />
    </div>
  );
}
