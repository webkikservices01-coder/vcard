/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, X, AlertTriangle, CheckCircle2, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const cx = (...c) => c.filter(Boolean).join(' ');

export function Button({ variant = 'primary', size = 'md', loading, className, children, ...props }) {
  const styles = {
    primary: 'bg-brand-gradient text-white shadow-brand hover:brightness-110 disabled:opacity-50 disabled:shadow-none',
    secondary: 'bg-surface text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:text-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-500 disabled:opacity-50',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:text-slate-300',
  };
  const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm' };
  return (
    <button
      type="button"
      className={cx('inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500', styles[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Field({ label, hint, error, children, className }) {
  return (
    <label className={cx('block', className)}>
      {label && <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

const inputCls = 'h-10 w-full rounded-xl border border-slate-200 bg-surface-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50';

export const Input = ({ className, ...props }) => <input className={cx(inputCls, className)} {...props} />;
export const Select = ({ className, children, ...props }) => (
  <select className={cx(inputCls, 'pr-8', className)} {...props}>
    {children}
  </select>
);
export const Textarea = ({ className, ...props }) => <textarea className={cx(inputCls, 'h-auto min-h-[80px] py-2', className)} {...props} />;

const BADGE = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  pink: 'bg-brand-50 text-brand-700 ring-brand-500/20',
};
export const Badge = ({ color = 'slate', children }) => (
  <span className={cx('inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', BADGE[color])}>{children}</span>
);

// One place that decides the colour of every status word shown in the panel.
const STATUS_COLOR = {
  active: 'green', paid: 'green', PAID: 'green', completed: 'green', SENT: 'green', DELIVERED: 'green', READ: 'green', sent: 'green', delivered: 'green', read: 'green', resolved: 'green', yes: 'green',
  blocked: 'red', FAILED: 'red', failed: 'red', revoked: 'red', removed: 'red', CANCELLED: 'slate', closed: 'slate',
  PENDING_PAYMENT: 'amber', pending: 'amber', PENDING: 'amber', open: 'amber', 'in-progress': 'blue', queued: 'blue',
  EXPIRED: 'slate', expired: 'slate', replaced: 'slate', none: 'slate', NOT_STARTED: 'slate', SKIPPED: 'slate', skipped: 'slate', no: 'slate',
};
const STATUS_LABEL = { PENDING_PAYMENT: 'Pending', NOT_STARTED: 'Not started', none: 'No order' };
export const StatusBadge = ({ value }) => (value ? <Badge color={STATUS_COLOR[value] || 'slate'}>{STATUS_LABEL[value] || String(value).replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</Badge> : <span className="text-slate-400">—</span>);

export const Card = ({ title, subtitle, icon: Icon, actions, children, className, padded = true }) => (
  <section className={cx('rounded-2xl border border-slate-200 bg-surface shadow-[0_1px_2px_rgba(0,0,0,.04),0_8px_24px_-12px_rgba(0,0,0,.12)]', className)}>
    {(title || actions) && (
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
        {title && (
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && (
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-500">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
              {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
        )}
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
    )}
    <div className={padded ? 'p-5' : ''}>{children}</div>
  </section>
);

// Change vs the previous period: arrow + sign + words, so it never relies on colour alone.
export function Trend({ now, prev, invert = false }) {
  if (prev === undefined || prev === null) return null;
  if (!prev && !now) return <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500"><Minus className="h-3 w-3" aria-hidden="true" /> no change</span>;
  if (!prev) return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700"><TrendingUp className="h-3 w-3" aria-hidden="true" /> new</span>;
  const pct = Math.round(((now - prev) / prev) * 100);
  const up = pct > 0;
  const good = invert ? !up : up;
  if (pct === 0) return <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500"><Minus className="h-3 w-3" aria-hidden="true" /> same as before</span>;
  const I = up ? TrendingUp : TrendingDown;
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold', good ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')} title="Compared with the previous period">
      <I className="h-3 w-3" aria-hidden="true" /> {up ? '+' : ''}{pct}%
    </span>
  );
}

export const Stat = ({ label, value, sub, icon: Icon, tone = 'slate', trend, hero }) => (
  <div className={cx('group relative overflow-hidden rounded-2xl border border-slate-200 bg-surface p-4 transition-colors hover:border-slate-300', hero && 'p-5')}>
    {hero && <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" aria-hidden="true" />}
    <div className="relative flex items-start justify-between gap-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      {Icon && (
        <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-xl', tone === 'brand' ? 'bg-brand-gradient text-white shadow-brand' : 'bg-slate-100 text-slate-500')}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </div>
    <p className={cx('relative mt-1 font-semibold tracking-tight text-slate-950 tabular-nums', hero ? 'text-3xl' : 'text-2xl')}>{value}</p>
    {(trend || sub) && (
      <div className="relative mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {trend}
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </div>
    )}
  </div>
);

export const Spinner = ({ label = 'Loading' }) => (
  <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500" role="status">
    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> {label}…
  </div>
);

export const ErrorBox = ({ error, onRetry }) => (
  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
    <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
    <span className="flex-1">{error?.message || 'Something went wrong.'}</span>
    {onRetry && (
      <Button size="sm" variant="secondary" onClick={onRetry}>
        Retry
      </Button>
    )}
  </div>
);

// columns: [{ key, label, render?(row), className? }]
export function Table({ columns, rows, loading, empty = 'Nothing here yet.', onRowClick, rowKey = (r) => r.id || r._id }) {
  return (
    <div className="table-wrap">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cx('px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500', c.className)}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading && !rows?.length ? (
            <tr>
              <td colSpan={columns.length}>
                <Spinner />
              </td>
            </tr>
          ) : !rows?.length ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-500">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr
                key={rowKey(r)}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={cx('align-top transition-colors', onRowClick && 'cursor-pointer hover:bg-slate-50', loading && 'opacity-60')}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cx('px-4 py-3 text-slate-700', c.className)}>
                    {c.render ? c.render(r) : (r[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, pages, total, onPage }) {
  const p = Number(page) || 1;
  if (!total) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
      <span>
        {total.toLocaleString('en-IN')} result{total === 1 ? '' : 's'} · page {p} of {pages}
      </span>
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" disabled={p <= 1} onClick={() => onPage(p - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="secondary" disabled={p >= pages} onClick={() => onPage(p + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function Modal({ open, title, onClose, children, footer, wide }) {
  const ref = useRef(null);
  // The latest onClose, without re-running the effects below on every render (a parent passes a
  // new function each time it re-renders, i.e. on every keystroke in the dialog).
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && closeRef.current?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  // Focus the first field once, when the dialog opens — not on every keystroke, which used to
  // pull the cursor back to the first box after each letter typed in a later one.
  useEffect(() => {
    if (open) ref.current?.querySelector('input, select, textarea, button')?.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={cx('max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-slate-200 bg-surface shadow-2xl sm:rounded-3xl', wide ? 'sm:max-w-2xl' : 'sm:max-w-md')}>
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="space-y-4 px-5 py-4">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
}

// ─── Toasts ─────────────────────────────────────────────────────────────────
const ToastContext = createContext(() => {});
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, tone = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 7000 : 4000);
  }, []);
  const Icon = { success: CheckCircle2, error: AlertTriangle, info: Info };
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end" aria-live="polite">
        {toasts.map((t) => {
          const I = Icon[t.tone] || Info;
          return (
            <div key={t.id} className={cx('pointer-events-auto flex max-w-sm items-start gap-2 rounded-lg px-4 py-3 text-sm shadow-lg', t.tone === 'error' ? 'bg-red-600 text-white' : 'bg-ink text-white')}>
              <I className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const Tabs = ({ tabs, value, onChange }) => (
  <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist">
    {tabs.map((t) => (
      <button
        key={t.value}
        type="button"
        role="tab"
        aria-selected={value === t.value}
        onClick={() => onChange(t.value)}
        className={cx('-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors', value === t.value ? 'border-brand-500 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-800')}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export const DefList = ({ items }) => (
  <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
    {items.filter(Boolean).map(([k, v]) => (
      <div key={k} className="min-w-0">
        <dt className="text-xs font-medium text-slate-500">{k}</dt>
        <dd className="mt-0.5 break-words text-sm text-slate-900">{v ?? '—'}</dd>
      </div>
    ))}
  </dl>
);
