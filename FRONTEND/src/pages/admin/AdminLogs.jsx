import { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw, Search, MailWarning, CheckCircle2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { fadeUp } from '../../utils/motion';

const API = `${import.meta.env.VITE_API_URL}/api/admin`;
const h = () => ({ 'x-auth-token': localStorage.getItem('token') });

// Event groups (type prefixes) the backend logs; see BACKEND/utils/logger.js.
const GROUPS = [
  ['', 'All'],
  ['auth', 'Sign-up & login'],
  ['mail', 'Emails'],
  ['payment', 'Payments'],
  ['enquiry', 'Enquiries'],
  ['ai', 'AI'],
  ['http', 'Server errors'],
];
const LEVEL_STYLE = {
  info: 'bg-sky-500/15 text-sky-500',
  warn: 'bg-amber-500/15 text-amber-500',
  error: 'bg-red-500/15 text-red-500',
};

// Admin → Logs: the last 30 days of app events, newest first, auto-refreshing.
const AdminLogs = () => {
  const [group, setGroup] = useState('');
  const [level, setLevel] = useState('');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let off = false;
    const params = new URLSearchParams({ limit: '300' });
    if (group) params.set('type', group);
    if (level) params.set('level', level);
    if (query) params.set('q', query);
    axios
      .get(`${API}/logs?${params}`, { headers: h() })
      .then((r) => !off && (setData(r.data), setError('')))
      .catch((e) => !off && setError(e.response?.data?.msg || 'Could not load logs'));
    return () => {
      off = true;
    };
  }, [group, level, query, tick]);

  // Live view: refresh every 20 seconds.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 20000);
    return () => clearInterval(t);
  }, []);

  const c = data?.last24h || {};
  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-black" style={{ color: 'var(--surface-text)' }}>Logs</h1>
          <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>
            Sign-ups, logins, emails, payments, enquiries, AI and server errors from the last 30 days. Refreshes every 20 seconds.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTick((n) => n + 1)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
          style={{ background: 'var(--surface-2)', color: 'var(--surface-text)' }}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {data && (
        <div
          className={`flex items-start gap-2 rounded-xl px-4 py-3 text-xs font-medium ${data.mail ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}
        >
          {data.mail ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <MailWarning className="w-4 h-4 shrink-0" />}
          {data.mail
            ? 'Email sending is set up: welcome, password reset and enquiry emails go out.'
            : 'Email sending is NOT set up on the server (SMTP_HOST / SMTP_USER / SMTP_PASS missing), so welcome, password reset and enquiry emails are skipped. They show here as "mail.skipped".'}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          ['info', 'Info (24h)'],
          ['warn', 'Warnings (24h)'],
          ['error', 'Errors (24h)'],
        ].map(([k, label]) => (
          <GlassCard key={k} {...fadeUp(0)} className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>
              {label}
            </p>
            <p className={`text-2xl font-black ${k === 'error' ? 'text-red-500' : k === 'warn' ? 'text-amber-500' : ''}`} style={k === 'info' ? { color: 'var(--surface-text)' } : undefined}>
              {c[k] || 0}
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard {...fadeUp(0.05)} className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {GROUPS.map(([id, label]) => (
            <button
              key={id || 'all'}
              type="button"
              onClick={() => setGroup(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold fast-transition ${group === id ? 'bg-brand-600 text-white' : ''}`}
              style={group !== id ? { background: 'var(--surface-2)', color: 'var(--surface-text-2)' } : undefined}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <form
            className="relative flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(q.trim());
            }}
          >
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--surface-text-2)' }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search email or message, then Enter"
              className="w-full rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
            />
          </form>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
          >
            <option value="">All levels</option>
            <option value="info">Info</option>
            <option value="warn">Warnings</option>
            <option value="error">Errors</option>
          </select>
        </div>
      </GlassCard>

      <GlassCard {...fadeUp(0.1)} className="overflow-hidden">
        {error && <p className="px-5 py-6 text-sm text-red-500">{error}</p>}
        {!data && !error && (
          <p className="text-center py-10 text-sm" style={{ color: 'var(--surface-text-2)' }}>
            Loading...
          </p>
        )}
        {data && data.logs.length === 0 && (
          <p className="text-center py-10 text-sm" style={{ color: 'var(--surface-text-2)' }}>
            No events match.
          </p>
        )}
        {data?.logs.map((l, i) => (
          <div key={l._id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3" style={i ? { borderTop: '1px solid var(--surface-border)' } : undefined}>
            <span className="text-[11px] font-mono shrink-0 sm:w-36" style={{ color: 'var(--surface-text-2)' }}>
              {new Date(l.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className={`self-start shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${LEVEL_STYLE[l.level] || ''}`}>{l.level}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm" style={{ color: 'var(--surface-text)' }}>
                <span className="font-mono text-xs font-semibold mr-2" style={{ color: 'var(--surface-text-2)' }}>
                  {l.type}
                </span>
                {l.msg}
              </p>
              <p className="text-[11px] mt-0.5 break-all" style={{ color: 'var(--surface-text-2)' }}>
                {[l.email, l.path, l.ip && `IP ${l.ip}`, l.meta && JSON.stringify(l.meta)].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
};

export default AdminLogs;
