import React, { useState } from 'react';

// ── Code block with copy button ────────────────────────────────────────────
const CodeBlock = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <div className="my-2 rounded-xl overflow-hidden border border-white/[0.08]">
      <div className="bg-[#1a1a1a] px-3 py-1.5 flex items-center justify-between">
        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{lang || 'code'}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-white transition-colors">
          {copied ? <span className="text-emerald-400">Copied</span> : <span>Copy</span>}
        </button>
      </div>
      <pre className="bg-[#0d0d0d] px-3.5 py-3 overflow-x-auto text-[11.5px] leading-relaxed font-mono m-0">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// ── Table renderer ───────────────────────────────────────────────────────────
const TableBlock = ({ rows }) => {
  if (rows.length < 2) return null;
  const [header, , ...body] = rows;
  return (
    <div className="my-2 overflow-x-auto rounded-xl border border-white/[0.08]">
      <table className="w-full text-[11.5px] border-collapse">
        <thead className="bg-[#1a1a1a]">
          <tr>
            {header.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left text-gray-300 font-semibold border-b border-white/[0.08] whitespace-nowrap">
                {renderInline(h.trim())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? '' : 'bg-white/[0.02]'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-1.5 text-gray-400 border-b border-white/[0.04]">
                  {renderInline(cell.trim())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Inline renderer — bold, italic, code, images, links, email, phone ───────
const renderInline = (str) =>
  str
    .split(/(!\[[^\]]*\]\([^)\s]+\)|\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|https?:\/\/[^\s)>]+|[\w.+-]+@[\w-]+\.[a-z]{2,}|\+?\d[\d\s-]{7,}\d)/gi)
    .map((part, i) => {
      const img = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(part);
      if (img) {
        return (
          <span key={i} className="block mt-2 mb-1">
            <img
              src={img[2]} alt={img[1] || 'preview'}
              className="rounded-lg w-full max-h-40 object-cover cursor-pointer shadow-sm"
              onClick={() => window.open(img[2], '_blank')}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </span>
        );
      }
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
      if (link) {
        const href = link[2];
        const isWa = href.includes('wa.me');
        const isSpecial = href.startsWith('tel:') || href.startsWith('mailto:') || isWa;
        return (
          <a key={i} href={href} target={isSpecial ? '_self' : '_blank'} rel="noopener noreferrer"
            className={`font-semibold underline underline-offset-2 ${isWa ? 'text-emerald-400 hover:text-emerald-300' : 'text-blue-400 hover:text-blue-300'}`}>
            {link[1]}
          </a>
        );
      }
      if (/^\*\*[^*]+\*\*$/.test(part))
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      if (/^\*[^*\n]+\*$/.test(part))
        return <em key={i} className="italic text-gray-300">{part.slice(1, -1)}</em>;
      if (/^`[^`]+`$/.test(part))
        return <code key={i} className="bg-white/10 text-gray-300 px-1.5 py-0.5 rounded text-[10.5px] font-mono">{part.slice(1, -1)}</code>;
      if (/^https?:\/\//i.test(part))
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-blue-400 hover:text-blue-300 break-all">{part}</a>;
      if (/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(part))
        return <a key={i} href={`mailto:${part}`} className="underline text-blue-400 hover:text-blue-300">{part}</a>;
      if (/^\+?\d[\d\s-]{7,}\d$/.test(part.trim()))
        return <a key={i} href={`tel:${part.replace(/[\s-]/g, '')}`} className="underline text-blue-400 hover:text-blue-300">{part}</a>;
      return <span key={i}>{part}</span>;
    });

// ── Segment renderer (one text block between code fences) ───────────────────
const renderTextSegment = (segment, segKey) => {
  const lines = segment.split('\n');
  const elements = [];
  let tableRows = [];
  let i = 0;

  const flushTable = () => {
    if (tableRows.length >= 2) {
      elements.push(<TableBlock key={`tbl_${segKey}_${i}`} rows={tableRows} />);
    } else if (tableRows.length === 1) {
      elements.push(<p key={`p_${segKey}_tbl_${i}`} className="leading-relaxed">{renderInline(tableRows[0].join(' | '))}</p>);
    }
    tableRows = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    if (/^\|.+\|/.test(line.trim())) {
      tableRows.push(line.trim().split('|').slice(1, -1));
      i++;
      continue;
    }
    if (tableRows.length > 0) flushTable();

    if (!line.trim()) {
      elements.push(<div key={`sp_${segKey}_${i}`} className="h-1" />);
    } else if (/^#{1,3}\s/.test(line)) {
      const level = (line.match(/^(#{1,3})/)?.[1].length ?? 1) - 1;
      const cls = ['text-[13.5px] mt-2', 'text-[12.5px] mt-1.5', 'text-[12px] mt-1'][level];
      elements.push(
        <p key={`h_${segKey}_${i}`} className={`font-semibold text-white ${cls} leading-snug mb-0.5`}>
          {renderInline(line.replace(/^#{1,3}\s/, ''))}
        </p>
      );
    } else if (/^[•*-]\s/.test(line.trim())) {
      elements.push(
        <div key={`li_${segKey}_${i}`} className="flex items-start gap-1.5">
          <span className="text-gray-500 mt-[3px] flex-shrink-0 text-[9px]">▸</span>
          <span className="leading-relaxed">{renderInline(line.trim().replace(/^[•*-]\s/, ''))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line.trim())) {
      const num = line.trim().match(/^(\d+)\./)?.[1] ?? '1';
      elements.push(
        <div key={`ol_${segKey}_${i}`} className="flex items-start gap-1.5">
          <span className="text-gray-500 flex-shrink-0 text-[10px] mt-px min-w-[14px]">{num}.</span>
          <span className="leading-relaxed">{renderInline(line.trim().replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    } else if (/^>\s?/.test(line.trim())) {
      elements.push(
        <div key={`bq_${segKey}_${i}`} className="border-l-2 border-gray-600 pl-2.5 my-0.5 text-gray-400 italic">
          {renderInline(line.trim().replace(/^>\s?/, ''))}
        </div>
      );
    } else if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={`hr_${segKey}_${i}`} className="border-white/10 my-2" />);
    } else {
      elements.push(<p key={`p_${segKey}_${i}`} className="leading-relaxed">{renderInline(line)}</p>);
    }
    i++;
  }

  if (tableRows.length > 0) flushTable();
  return <React.Fragment key={`seg_${segKey}`}>{elements}</React.Fragment>;
};

// ── Main BotMessage export ───────────────────────────────────────────────────
export const BotMessage = ({ text, streaming = false }) => {
  const segments = (text || '').split(/(```[\s\S]*?```|```[\s\S]*$)/g);

  return (
    <div className="space-y-0.5 text-sm">
      {segments.map((seg, idx) => {
        if (seg.startsWith('```')) {
          const langMatch = seg.match(/^```(\w*)/);
          const lang = langMatch?.[1]?.trim() ?? '';
          const code = seg.replace(/^```\w*\n?/, '').replace(/```$/, '');
          return <CodeBlock key={`cb_${idx}`} code={code} lang={lang} />;
        }
        return renderTextSegment(seg, String(idx));
      })}
      {streaming && (
        <span className="inline-block w-[2px] h-[14px] bg-gray-400 ml-0.5 align-text-bottom rounded-full animate-pulse" />
      )}
    </div>
  );
};
