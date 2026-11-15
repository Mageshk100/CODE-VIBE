import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeSelector({ compact = false }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
  ];

  const CurrentIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Laptop;

  if (compact) {
    return (
      <div className="flex items-center gap-1 p-1 bg-platinum-100 dark:bg-charcoal/80 rounded-lg border border-platinum-200 dark:border-charcoal-border">
        {options.map(opt => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              title={`${opt.label} Theme`}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white dark:bg-obsidian-card text-gold-metallic shadow-xs border border-platinum-200 dark:border-gold-metallic/30'
                  : 'text-platinum-500 hover:text-obsidian dark:hover:text-softwhite'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2.5 px-3 py-2 text-xs font-medium rounded-lg border border-platinum-200 dark:border-charcoal-border bg-white dark:bg-obsidian-card text-obsidian dark:text-softwhite hover:border-gold-metallic/50 transition-colors w-full"
      >
        <div className="flex items-center gap-2">
          <CurrentIcon className="w-3.5 h-3.5 text-gold-metallic" />
          <span className="capitalize">{theme} Theme</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-platinum-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-1 w-36 rounded-lg bg-white dark:bg-obsidian-card shadow-lg border border-platinum-200 dark:border-charcoal-border py-1 z-50">
          {options.map(opt => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setTheme(opt.id);
                  setOpen(false);
                }}
                className={`flex items-center justify-between w-full px-3 py-2 text-xs text-left transition-colors ${
                  isSelected
                    ? 'text-gold-metallic font-semibold bg-gold-metallic/5'
                    : 'text-obsidian dark:text-platinum-200 hover:bg-platinum-50 dark:hover:bg-charcoal'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3 h-3 text-gold-metallic" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
