import { useEffect, useMemo, useRef, useState } from 'react';

// Small SVG charts for the dashboard. One series per chart (its title names it, so no legend),
// one axis, thin marks in the validated chart colour (--color-chart), recessive grid, text in
// text colours. Every chart has a hover tooltip and a table view.

const useWidth = () => {
  const ref = useRef(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
};

// 0, step, 2·step… covering max, with a "nice" step (1, 2, 2.5, 5 × 10ⁿ).
function niceTicks(max, count = 4) {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
  const ticks = [];
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(Math.round(v * 100) / 100);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}

const shortDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export function AreaChart({ data, format = (v) => String(v), label, height = 240 }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const pad = { top: 12, right: 12, bottom: 28, left: 52 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value), 0);
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1] || 1;
  const x = (i) => pad.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v) => pad.top + innerH - (v / top) * innerH;

  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join('');
  const area = `${line}L${x(data.length - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`;
  const labelEvery = Math.ceil(data.length / Math.max(2, Math.floor(innerW / 70)));

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round(((px - pad.left) / innerW) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };
  const total = data.reduce((a, d) => a + d.value, 0);

  return (
    <div ref={ref} className="relative">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={`${label}: ${format(total)} in total over ${data.length} days`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        className="block touch-none"
      >
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-chart)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="var(--color-slate-200)" strokeWidth="1" strokeDasharray={t === 0 ? '' : '3 4'} />
            <text x={pad.left - 10} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill="var(--color-slate-500)" className="tabular-nums">
              {format(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) =>
          // Every few days, plus the last day (dropping the one before it if they'd touch).
          (i % labelEvery === 0 && (i === data.length - 1 || data.length - 1 - i >= labelEvery * 0.7)) || i === data.length - 1 ? (
            <text key={d.date} x={x(i)} y={height - 8} textAnchor="middle" fontSize="11" fill="var(--color-slate-500)">
              {shortDate(d.date)}
            </text>
          ) : null
        )}
        <path d={area} fill="url(#area-fill)" />
        <path d={line} fill="none" stroke="var(--color-chart)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + innerH} stroke="var(--color-slate-400)" strokeWidth="1" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill="var(--color-chart)" stroke="var(--color-surface)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-slate-200 bg-surface px-3 py-2 text-xs shadow-xl"
          style={{ left: Math.min(Math.max(x(hover), 70), width - 70), top: y(data[hover].value) - 10 }}
        >
          <p className="text-slate-500">{new Date(`${data[hover].date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-950 tabular-nums">
            {format(data[hover].value)} <span className="font-normal text-slate-500">{label.toLowerCase()}</span>
          </p>
        </div>
      )}
    </div>
  );
}

// Horizontal bars for amounts by category (one colour; the value and label are text).
export function BarList({ items, format = (v) => String(v), showShare, emptyText = 'Nothing yet.' }) {
  const max = Math.max(...items.map((i) => i.value), 0);
  const total = items.reduce((a, i) => a + i.value, 0);
  if (!items.length || !max) return <p className="py-6 text-center text-sm text-slate-500">{emptyText}</p>;
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.label} className="group" title={`${it.label}: ${format(it.value)}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-slate-700">{it.label}</span>
            <span className="shrink-0 font-semibold text-slate-950 tabular-nums">
              {format(it.value)}
              {showShare && total > 0 && <span className="ml-1.5 text-xs font-normal text-slate-500">{Math.round((it.value / total) * 100)}%</span>}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full transition-[width] duration-500 group-hover:brightness-110" style={{ width: `${Math.max(2, (it.value / max) * 100)}%`, background: 'var(--color-chart)' }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Order funnel: each step's people, share of sign-ups, and conversion from the step before.
export function Funnel({ steps }) {
  const first = steps[0]?.value || 0;
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const share = first ? Math.round((s.value / first) * 100) : 0;
        const prev = steps[i - 1]?.value;
        const conv = i && prev ? Math.round((s.value / prev) * 100) : null;
        return (
          <li key={s.key}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-slate-700">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">{i + 1}</span>
                <span className="truncate">{s.label}</span>
              </span>
              <span className="shrink-0 font-semibold text-slate-950 tabular-nums">
                {s.value.toLocaleString('en-IN')}
                <span className="ml-1.5 text-xs font-normal text-slate-500">{share}%</span>
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full" style={{ width: `${Math.max(1.5, share)}%`, background: 'var(--color-chart)' }} />
            </div>
            {conv !== null && <p className="mt-1 text-[11px] text-slate-500">{conv}% of the step before</p>}
          </li>
        );
      })}
    </ol>
  );
}

// The numbers behind a chart, for screen readers and anyone who prefers a table.
export function ChartTable({ data, format, label }) {
  const rows = useMemo(() => [...data].reverse(), [data]);
  return (
    <div className="scroll-thin max-h-60 overflow-y-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-slate-50">
          <tr>
            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Day</th>
            <th scope="col" className="px-3 py-2 text-right text-xs font-semibold text-slate-500">{label}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((d) => (
            <tr key={d.date}>
              <td className="px-3 py-1.5 text-slate-700">{shortDate(d.date)}</td>
              <td className="px-3 py-1.5 text-right font-medium text-slate-950 tabular-nums">{format(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
