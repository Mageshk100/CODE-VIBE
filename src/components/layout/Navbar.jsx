import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import Logo from '../common/Logo';
import ThemeSelector from '../common/ThemeSelector';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-softwhite/80 dark:bg-obsidian-dark/80 border-b border-platinum-200/70 dark:border-obsidian-border/70 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo size="md" to="/" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-obsidian/80 dark:text-softwhite/80 hover:text-gold-metallic dark:hover:text-gold-light transition-colors"
          >
            Home
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium text-obsidian/80 dark:text-softwhite/80 hover:text-gold-metallic dark:hover:text-gold-light transition-colors"
          >
            Login
          </Link>

          {/* Theme Selector */}
          <div className="w-32">
            <ThemeSelector />
          </div>

          {/* Get Started Button */}
          <Link
            to="/workspace"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gold-metallic hover:bg-gold-glow text-obsidian transition-all duration-200 shadow-gold-subtle hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeSelector compact />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-obsidian dark:text-softwhite hover:bg-platinum-100 dark:hover:bg-charcoal transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-platinum-200 dark:border-charcoal-border bg-softwhite dark:bg-obsidian-card px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-md text-obsidian dark:text-softwhite hover:bg-platinum-100 dark:hover:bg-charcoal"
          >
            Home
          </Link>
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-md text-obsidian dark:text-softwhite hover:bg-platinum-100 dark:hover:bg-charcoal"
          >
            Login
          </Link>
          <Link
            to="/workspace"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-semibold rounded-lg bg-gold-metallic text-obsidian shadow-gold-subtle"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </header>
  );
}
