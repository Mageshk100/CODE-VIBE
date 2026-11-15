import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', to = '/' }) {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  const content = (
    <div className="flex items-center gap-2.5 group select-none">
      {/* Metallic Gold Symbol Icon */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-obsidian via-charcoal to-obsidian border border-gold-metallic/40 shadow-sm group-hover:border-gold-glow transition-all duration-300 ${
        isLg ? 'w-11 h-11' : isSm ? 'w-8 h-8 rounded-lg' : 'w-9 h-9'
      }`}>
        {/* Subtle reflective glow */}
        <div className="absolute inset-0 rounded-xl bg-gold-metallic/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <svg
          className={`${isLg ? 'w-6 h-6' : isSm ? 'w-4 h-4' : 'w-5 h-5'} text-gold-metallic transition-transform duration-300 group-hover:scale-105`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="14" y1="4" x2="10" y2="20" stroke="#FFD700" strokeWidth="2.4" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span className={`font-semibold tracking-tight text-obsidian dark:text-softwhite leading-none ${
          isLg ? 'text-2xl' : isSm ? 'text-base' : 'text-lg'
        }`}>
          Code<span className="text-gold-metallic ml-1 font-bold">Vibe</span>
        </span>
        {!isSm && (
          <span className="text-[10px] uppercase tracking-widest text-platinum-500 dark:text-platinum-400 font-mono mt-0.5">
            AI Workspace
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="inline-block focus:outline-none">{content}</Link>;
  }

  return content;
}
