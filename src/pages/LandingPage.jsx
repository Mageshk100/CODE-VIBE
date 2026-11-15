import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, MessageSquare, History, CheckCircle2, Copy, Check } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ThreeHeroVisual from '../components/common/ThreeHeroVisual';

export default function LandingPage() {
  const [copied, setCopied] = useState(false);

  const previewCode = `// Binary Search in Java
public static int binarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`;

  const copyPreview = () => {
    navigator.clipboard.writeText(previewCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const supportedLanguages = [
    { name: 'Python', ext: '.py', tag: 'Fast Prototyping' },
    { name: 'Java', ext: '.java', tag: 'Object-Oriented' },
    { name: 'C', ext: '.c', tag: 'Systems & Memory' },
    { name: 'C++', ext: '.cpp', tag: 'High Performance' },
    { name: 'JavaScript', ext: '.js', tag: 'Web & Logic' },
  ];

  const features = [
    {
      title: 'Clear Code Explanations',
      desc: 'Get structured breakdowns covering high-level purpose, line-by-line mechanics, algorithmic logic, and concrete execution walkthroughs.',
      icon: BookOpen,
      badge: 'Structured Learning'
    },
    {
      title: 'Contextual AI Assistance',
      desc: 'Ask targeted follow-up questions directly within your code session to clarify edge cases, time complexity, and syntax subtleties.',
      icon: MessageSquare,
      badge: 'In-Context Chat'
    },
    {
      title: 'Saved Coding Sessions',
      desc: 'Revisit past code analyses and follow-up discussions anytime. Keep a personal learning log of algorithms and data structures.',
      icon: History,
      badge: 'Local History'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-softwhite dark:bg-obsidian-dark transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gold-metallic/5 dark:bg-gold-metallic/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Hero Text */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold-metallic/30 bg-gold-metallic/5 text-xs font-semibold text-gold-dark dark:text-gold-light">
                  <span className="w-2 h-2 rounded-full bg-gold-metallic animate-ping" />
                  Premium Coding Companion for Students
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-obsidian dark:text-softwhite leading-[1.12]">
                  Understand Code.{' '}
                  <span className="metallic-gold-text">Think Better.</span>{' '}
                  Build Smarter.
                </h1>

                <p className="text-base sm:text-lg text-platinum-500 dark:text-platinum-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                  Your AI-powered coding companion that explains code clearly, breaks down complex logic and helps you understand programming one step at a time.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    to="/workspace"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gold-metallic hover:bg-gold-glow text-obsidian font-semibold text-base transition-all duration-200 shadow-gold-subtle hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-platinum-300 dark:border-charcoal-border hover:border-gold-metallic/50 bg-white dark:bg-obsidian-card text-obsidian dark:text-softwhite font-medium text-base transition-all duration-200 hover:bg-platinum-50 dark:hover:bg-charcoal"
                  >
                    Login
                  </Link>
                </div>
              </div>

              {/* Hero 3D Visual */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-md">
                  <ThreeHeroVisual />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 CORE BENEFITS */}
        <section className="py-16 bg-white dark:bg-obsidian border-y border-platinum-200 dark:border-obsidian-border transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-gold-metallic mb-2 font-mono">
                Core Capabilities
              </h2>
              <p className="text-2xl sm:text-3xl font-bold text-obsidian dark:text-softwhite tracking-tight">
                Designed to bridge code and comprehension
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={i}
                    className="relative p-7 rounded-2xl border border-platinum-200 dark:border-charcoal-border bg-softwhite/50 dark:bg-obsidian-card/60 hover:border-gold-metallic/40 transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-gold-metallic/10 border border-gold-metallic/20 flex items-center justify-center text-gold-metallic mb-5 group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono uppercase text-platinum-400 font-semibold tracking-wider">
                        {feat.badge}
                      </span>
                      <h3 className="text-lg font-bold text-obsidian dark:text-softwhite mt-1 mb-2">
                        {feat.title}
                      </h3>
                      <p className="text-sm text-platinum-500 dark:text-platinum-300 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SUPPORTED PROGRAMMING LANGUAGES */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-gold-metallic mb-2 font-mono">
                Multilingual Engine
              </h2>
              <p className="text-2xl font-bold text-obsidian dark:text-softwhite tracking-tight">
                Supported Programming Languages
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {supportedLanguages.map((lang) => (
                <div
                  key={lang.name}
                  className="p-5 rounded-xl border border-platinum-200 dark:border-charcoal-border bg-white dark:bg-obsidian-card text-center hover:border-gold-metallic/50 transition-colors"
                >
                  <div className="font-mono text-xs text-gold-metallic font-semibold mb-1">
                    {lang.ext}
                  </div>
                  <div className="text-base font-bold text-obsidian dark:text-softwhite">
                    {lang.name}
                  </div>
                  <div className="text-[11px] text-platinum-400 mt-1">
                    {lang.tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EXAMPLE PREVIEW: SIDE-BY-SIDE */}
        <section className="py-16 bg-white dark:bg-obsidian border-y border-platinum-200 dark:border-obsidian-border transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-gold-metallic mb-2 font-mono">
                Live Demonstration
              </h2>
              <p className="text-2xl sm:text-3xl font-bold text-obsidian dark:text-softwhite tracking-tight">
                Code on one side. Clarity on the other.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-2xl border border-platinum-200 dark:border-charcoal-border overflow-hidden bg-platinum-50 dark:bg-charcoal/40 p-4 sm:p-6 shadow-sm">
              {/* Left Side: Code */}
              <div className="rounded-xl border border-platinum-200 dark:border-charcoal-border bg-white dark:bg-obsidian-dark overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-platinum-200 dark:border-charcoal-border bg-platinum-100/50 dark:bg-obsidian-card">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                    <span className="ml-2 font-mono text-xs text-platinum-500">BinarySearch.java</span>
                  </div>
                  <button
                    onClick={copyPreview}
                    className="p-1 rounded text-platinum-400 hover:text-gold-metallic text-xs flex items-center gap-1"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-gold-metallic" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-obsidian dark:text-platinum-200 overflow-x-auto leading-relaxed flex-1">
                  <code>{previewCode}</code>
                </pre>
              </div>

              {/* Right Side: Explanation */}
              <div className="rounded-xl border border-platinum-200 dark:border-charcoal-border bg-white dark:bg-obsidian-dark p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-platinum-200 dark:border-charcoal-border pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gold-metallic" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gold-metallic font-mono">
                        AI Breakdown
                      </span>
                    </div>
                    <span className="text-xs text-platinum-400 font-mono">Java • O(log n)</span>
                  </div>

                  {/* Section 1: Code Overview */}
                  <div className="space-y-1 mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-obsidian dark:text-softwhite">
                      1. Code Overview
                    </h4>
                    <p className="text-xs text-platinum-500 dark:text-platinum-300 leading-relaxed">
                      Implements a binary search algorithm that repeatedly bisects a sorted array to locate the target index in logarithmic time.
                    </p>
                  </div>

                  {/* Section 2: Key Line Breakdown */}
                  <div className="space-y-1 mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-obsidian dark:text-softwhite">
                      2. Logic Breakdown
                    </h4>
                    <ul className="text-xs text-platinum-500 dark:text-platinum-300 space-y-1.5 list-disc list-inside">
                      <li><strong>Midpoint Calculation:</strong> Calculates <code className="bg-platinum-100 dark:bg-charcoal px-1 py-0.5 rounded text-gold-metallic font-mono">low + (high - low) / 2</code> to prevent 32-bit integer overflow.</li>
                      <li><strong>Search Space Reduction:</strong> Drops half of the remaining elements on each comparison.</li>
                    </ul>
                  </div>

                  {/* Section 5: Example Walkthrough */}
                  <div className="p-3 rounded-lg bg-platinum-100/60 dark:bg-charcoal/60 border border-platinum-200 dark:border-charcoal-border">
                    <span className="text-[11px] font-bold text-obsidian dark:text-softwhite uppercase font-mono block mb-1">
                      Example Walkthrough
                    </span>
                    <p className="text-xs font-mono text-platinum-500 dark:text-platinum-300">
                      arr = [2, 5, 8, 12, 16], target = 8 → mid=2 (val=8) → Match! Returns index 2.
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <Link
                    to="/workspace"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-metallic hover:text-gold-glow"
                  >
                    <span>Open in Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-obsidian dark:text-softwhite tracking-tight">
              Your Code Has a Story.{' '}
              <span className="metallic-gold-text">Understand It.</span>
            </h2>
            <p className="text-base text-platinum-500 dark:text-platinum-300 max-w-xl mx-auto">
              Start dissecting complex algorithms and master your coding curriculum with clear, interactive AI explanations.
            </p>
            <div className="pt-4">
              <Link
                to="/workspace"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gold-metallic hover:bg-gold-glow text-obsidian font-bold text-base transition-all duration-200 shadow-gold-subtle hover:scale-105 active:scale-95"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
