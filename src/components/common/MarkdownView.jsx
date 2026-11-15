import React from 'react';

/**
 * Lightweight, safe Markdown renderer for structured AI explanations and chat
 * Supports headers (###), bold (**text**), inline code (`code`), lists (- item), and linebreaks.
 */
export default function MarkdownView({ content, className = '' }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className={`space-y-2 text-xs sm:text-sm leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // H3 Header: ### Header
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-xs font-bold uppercase tracking-wider text-gold-metallic dark:text-gold-light mt-3 mb-1 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-metallic shrink-0" />
              <span>{trimmed.replace(/^###\s+/, '')}</span>
            </h4>
          );
        }

        // List item: - item or * item
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-metallic/70 mt-1.5 shrink-0" />
              <span className="flex-1">{formatInline(itemText)}</span>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="leading-relaxed">
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
}

function formatInline(text) {
  // Split by inline code `...`
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, pIdx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeContent = part.slice(1, -1);
      return (
        <code
          key={pIdx}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-platinum-100 dark:bg-charcoal text-gold-dark dark:text-gold-light font-mono text-[11px] border border-platinum-200/80 dark:border-charcoal-border font-medium"
        >
          {codeContent}
        </code>
      );
    }

    // Parse **bold** within normal text
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        return (
          <strong key={`${pIdx}-${bIdx}`} className="font-semibold text-obsidian dark:text-white">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  });
}
