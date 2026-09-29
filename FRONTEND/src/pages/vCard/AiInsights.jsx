import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart3, Copy, FlaskConical, MessageSquareQuote, RefreshCw } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import { fadeUp } from '../../utils/motion';

const API = `${import.meta.env.VITE_API_URL}/api`;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

const RANGES = [7, 30, 90];
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const npsColor = (n) => (n == null ? 'var(--surface-text-2)' : n >= 30 ? '#10B981' : n >= 0 ? '#F59E0B' : '#EF4444');
const scoreColor = (s) => (s >= 9 ? '#10B981' : s >= 7 ? '#F59E0B' : '#EF4444');

// Chat funnel for one cohort: chats → engaged → offer shown → offer clicked → rated.
function Funnel({ c }) {
  const steps = [
    ['Chats started', c.chats],
    ['Engaged (2+ messages)', c.engaged],
    ['Saw your offer', c.offerShown],
    ['Clicked your offer', c.offerClicked],
    ['Gave a rating', c.rated],
  ];
  return (
    <div className="space-y-2">
      {steps.map(([label, n]) => (
        <div key={label}>
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--surface-text-2)' }}>
            <span>{label}</span>
            <span className="font-semibold" style={{ color: 'var(--surface-text)' }}>
              {n}
              {c.chats ? <span className="font-normal opacity-70"> · {pct(n, c.chats)}%</span> : null}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct(n, c.chats)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const AiInsights = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState('');
  const [group, setGroup] = useState('');

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API}/ai/insights?days=${days}`, { headers: headers() })
      .then((res) => !cancelled && setData(res.data))
      .catch((err) => !cancelled && toast.error(err.response?.data?.msg || 'Could not load insights'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [days, reloadKey]);

  const pickDays = (d) => {
    setLoading(true);
    setDays(d);
  };
  const load = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    axios
      .get(`${API}/stats`, { headers: headers() })
      .then((r) => setSlug(r.data?.cardSlug || r.data?.card?.username || ''))
      .catch(() => {});
  }, []);

  const groupName = group.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
  const testLink = slug && groupName ? `${window.location.origin}/${slug}?dipstick=${groupName}` : '';
  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied');
  };

  const live = data?.cohorts.find((c) => c.cohort === 'live');
  const tests = data?.cohorts.filter((c) => c.cohort !== 'live') || [];

  return (
    <div className="max-w-4xl space-y-6">
      <motion.div {...fadeUp(0)} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--surface-text)' }}>
            <BarChart3 className="w-5 h-5" /> AI Insights
          </h2>
          <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>
            How visitors move through your AI chat, from first question to your offer and their rating.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg p-0.5" style={{ background: 'var(--surface-2)' }}>
            {RANGES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => pickDays(d)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold fast-transition ${days === d ? 'bg-brand-600 text-white' : ''}`}
                style={days !== d ? { color: 'var(--surface-text-2)' } : undefined}
              >
                {d} days
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={load} leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}>
            Refresh
          </Button>
        </div>
      </motion.div>

      {loading && !data ? (
        <p className="text-sm text-center py-10" style={{ color: 'var(--surface-text-2)' }}>
          Loading…
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <GlassCard {...fadeUp(0.05)} className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>
                Net Promoter Score
              </p>
              <p className="mt-1 text-4xl font-black" style={{ color: npsColor(data?.nps) }}>
                {data?.nps == null ? '—' : data.nps > 0 ? `+${data.nps}` : data.nps}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)' }}>
                % promoters (9–10) minus % detractors (0–6). Range −100 to +100.
              </p>
            </GlassCard>
            <GlassCard {...fadeUp(0.08)} className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>
                AI chats
              </p>
              <p className="mt-1 text-4xl font-black" style={{ color: 'var(--surface-text)' }}>
                {data?.cohorts.reduce((a, c) => a + c.chats, 0) || 0}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)' }}>
                Last {data?.days} days, all groups
              </p>
            </GlassCard>
            <GlassCard {...fadeUp(0.11)} className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>
                Offer click rate
              </p>
              <p className="mt-1 text-4xl font-black" style={{ color: 'var(--surface-text)' }}>
                {live ? `${pct(live.offerClicked, live.offerShown)}%` : '—'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)' }}>
                Of visitors who saw your final offer
              </p>
            </GlassCard>
          </div>

          <GlassCard {...fadeUp(0.14)} className="p-5">
            <p className="text-sm font-bold mb-4" style={{ color: 'var(--surface-text)' }}>
              Chat funnel · live visitors
            </p>
            {live ? (
              <Funnel c={live} />
            ) : (
              <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>
                No chats yet. Share your card and the funnel fills in as visitors talk to your AI.
              </p>
            )}
          </GlassCard>

          {/* Dipstick test groups */}
          <GlassCard {...fadeUp(0.17)} className="p-5">
            <p className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--surface-text)' }}>
              <FlaskConical className="w-4 h-4 text-brand-600" /> Test groups (dipstick)
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)' }}>
              Before a big launch, send a special link to 10–20 people. Their chats, ratings and enquiries are counted separately, so
              you can compare them with everyone else.
            </p>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                maxLength={30}
                placeholder="Group name, e.g. pilot-doctors"
                className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
              />
              <Button variant="secondary" size="sm" disabled={!testLink} onClick={() => copy(testLink)} leftIcon={<Copy className="w-3.5 h-3.5" />}>
                Copy test link
              </Button>
            </div>
            {testLink && (
              <p className="mt-2 text-xs break-all font-mono" style={{ color: 'var(--surface-text-2)' }}>
                {testLink}
              </p>
            )}
            {!slug && (
              <p className="mt-2 text-xs" style={{ color: 'var(--surface-text-2)' }}>
                Set your card username first to create test links.
              </p>
            )}

            {data?.cohorts.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ color: 'var(--surface-text-2)' }}>
                      {['Group', 'Chats', 'Engaged', 'Offer clicks', 'Enquiries', 'Ratings', 'Avg', 'NPS'].map((h) => (
                        <th key={h} className="text-left font-semibold py-2 pr-3 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody style={{ color: 'var(--surface-text)' }}>
                    {[live, ...tests].filter(Boolean).map((c) => (
                      <tr key={c.cohort} style={{ borderTop: '1px solid var(--surface-border)' }}>
                        <td className="py-2 pr-3 font-semibold whitespace-nowrap">{c.cohort === 'live' ? 'Everyone (live)' : c.cohort}</td>
                        <td className="py-2 pr-3">{c.chats}</td>
                        <td className="py-2 pr-3">{pct(c.engaged, c.chats)}%</td>
                        <td className="py-2 pr-3">{c.offerClicked}</td>
                        <td className="py-2 pr-3">{c.enquiries}</td>
                        <td className="py-2 pr-3">{c.rated}</td>
                        <td className="py-2 pr-3">{c.avgScore ?? '—'}</td>
                        <td className="py-2 pr-3 font-bold" style={{ color: npsColor(c.nps) }}>
                          {c.nps == null ? '—' : c.nps > 0 ? `+${c.nps}` : c.nps}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>

          {/* Recent feedback */}
          <GlassCard {...fadeUp(0.2)} className="p-5">
            <p className="text-sm font-bold flex items-center gap-2 mb-3" style={{ color: 'var(--surface-text)' }}>
              <MessageSquareQuote className="w-4 h-4 text-brand-600" /> Recent ratings
            </p>
            {data?.feedback.length ? (
              <div className="space-y-2">
                {data.feedback.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg px-3 py-2.5" style={{ background: 'var(--surface-2)' }}>
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black text-white"
                      style={{ background: scoreColor(f.score) }}
                    >
                      {f.score}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm" style={{ color: f.comment ? 'var(--surface-text)' : 'var(--surface-text-2)' }}>
                        {f.comment || 'No comment'}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--surface-text-2)' }}>
                        {new Date(f.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                        {f.cohort !== 'live' ? ` · test group: ${f.cohort}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>
                No ratings yet. Visitors are asked after a few answers, or after they click your offer. You can turn this on or off on the AI
                Persona page.
              </p>
            )}
          </GlassCard>
        </>
      )}
    </div>
  );
};

export default AiInsights;
