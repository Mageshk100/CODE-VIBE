import React from 'react';
import Logo from '../common/Logo';

export default function Footer() {
  return (
    <footer className="border-t border-platinum-200 dark:border-obsidian-border bg-white dark:bg-obsidian-dark py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo size="sm" to="/" />
        <p className="text-xs text-platinum-500 dark:text-platinum-400 font-mono">
          © {new Date().getFullYear()} Code Vibe. AI-Powered Coding Workspace.
        </p>
        <div className="text-xs text-platinum-500 dark:text-platinum-400">
          Understand Code. Think Better. Build Smarter.
        </div>
      </div>
    </footer>
  );
}
