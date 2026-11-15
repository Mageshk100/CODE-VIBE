import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../services/languageDetection';

export default function LanguageSelector({ currentLanguage, onSelectLanguage, disabled = false }) {
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

  const activeLang = SUPPORTED_LANGUAGES.find(l => l.id === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-platinum-200 dark:border-charcoal-border bg-white dark:bg-obsidian-card text-xs font-semibold text-obsidian dark:text-softwhite hover:border-gold-metallic/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="w-2 h-2 rounded-full bg-gold-metallic" />
        <span>{activeLang.name}</span>
        <span className="font-mono text-[10px] text-platinum-400">({activeLang.extension})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-platinum-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 mt-1 w-44 rounded-xl bg-white dark:bg-obsidian-card shadow-xl border border-platinum-200 dark:border-charcoal-border py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-platinum-400 border-b border-platinum-100 dark:border-charcoal-border mb-1">
            Select Language
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.id === currentLanguage;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => {
                  onSelectLanguage(lang.id);
                  setOpen(false);
                }}
                className={`flex items-center justify-between w-full px-3 py-2 text-xs text-left transition-colors ${
                  isSelected
                    ? 'text-gold-metallic font-semibold bg-gold-metallic/10'
                    : 'text-obsidian dark:text-softwhite hover:bg-platinum-50 dark:hover:bg-charcoal'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.name}</span>
                  <span className="font-mono text-[10px] text-platinum-400">{lang.extension}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-gold-metallic" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
