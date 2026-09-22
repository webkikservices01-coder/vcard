import React from 'react';

// Lightweight markdown renderer for Cardy's replies: bold, italic, inline code,
// links (opened in a new tab), and bullet/numbered lists. Deliberately smaller
// than components/chatbot/markdown.jsx (no code blocks/tables) since this bot
// only ever produces short FAQ-style answers, and uses currentColor so it
// inherits the bubble's light/dark text color instead of hardcoded dark-theme colors.
const renderInline = (str) =>
  str
    .split(/(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g)
    .map((part, i) => {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
      if (link) {
        const href = link[2];
        const isSpecial = href.startsWith('tel:') || href.startsWith('mailto:') || href.includes('wa.me');
        return (
          <a key={i} href={href} target={isSpecial ? '_self' : '_blank'} rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2 text-crimson-700">
            {link[1]}
          </a>
        );
      }
      if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      if (/^\*[^*\n]+\*$/.test(part)) return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      if (/^`[^`]+`$/.test(part)) return <code key={i} className="bg-black/5 px-1.5 py-0.5 rounded text-[0.85em] font-mono">{part.slice(1, -1)}</code>;
      return <span key={i}>{part}</span>;
    });

export const CardyMessage = ({ text }) => {
  const lines = (text || '').split('\n');
  const elements = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={i} className="h-1.5" />);
    } else if (/^[•*-]\s/.test(trimmed)) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
          <span className="leading-relaxed">{renderInline(trimmed.replace(/^[•*-]\s/, ''))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const num = trimmed.match(/^(\d+)\./)?.[1] ?? '1';
      elements.push(
        <div key={i} className="flex items-start gap-1.5">
          <span className="min-w-[14px] shrink-0 text-[0.85em] opacity-60">{num}.</span>
          <span className="leading-relaxed">{renderInline(trimmed.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    } else {
      elements.push(<p key={i} className="leading-relaxed">{renderInline(line)}</p>);
    }
  });

  return <div className="space-y-0.5 text-sm">{elements}</div>;
};
