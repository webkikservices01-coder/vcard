import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CalendarCheck, Loader2, Link2, Unlink, ExternalLink } from 'lucide-react';
import GlassCard from './ui/GlassCard';

// AI settings → "Let the AI book meetings in Calendly": one click on "Connect with Calendly"
// (Calendly's Allow page, OAuth), or, as a fallback, a pasted Personal Access Token. Then the card's AI (chat, voice and video calls) finds free times in their
// Calendly, offers them, and books the one the visitor picks; Calendly emails both the invite.
const API = `${import.meta.env.VITE_API_URL}/api/ai`;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

export default function CalendlyConnect() {
  const [status, setStatus] = useState(null); // { eventName, schedulingUrl, connectedAt } | false
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [oauth, setOauth] = useState(false); // Aicardly's Calendly app is set up: one-click connect
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/persona`, { headers: headers() })
      .then(({ data }) => setStatus(data?.calendly?.eventType ? data.calendly : false))
      .catch(() => setStatus(false));
    axios.get(`${API}/calendly/config`).then(({ data }) => setOauth(!!data.oauth)).catch(() => {});
    // Back from Calendly's Allow page.
    const q = new URLSearchParams(window.location.search);
    if (q.get('calendly') === 'connected') toast.success('Calendly connected. The AI now books meetings from your free times.');
    if (q.get('calendly') === 'error') toast.error(q.get('msg') || 'Could not connect Calendly.');
    if (q.get('calendly')) window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const connectOauth = async () => {
    setBusy(true);
    try {
      const { data } = await axios.post(`${API}/calendly/oauth`, {}, { headers: headers() });
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not open Calendly.');
      setBusy(false);
    }
  };

  const connect = async () => {
    setBusy(true);
    try {
      const { data } = await axios.post(`${API}/calendly`, { token: token.trim() }, { headers: headers() });
      setStatus(data.calendly);
      setToken('');
      toast.success(data.msg);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not connect Calendly.');
    } finally {
      setBusy(false);
    }
  };
  const disconnect = async () => {
    if (!window.confirm('Disconnect Calendly? The AI will go back to sending your booking link.')) return;
    setBusy(true);
    try {
      const { data } = await axios.delete(`${API}/calendly`, { headers: headers() });
      setStatus(false);
      toast.success(data.msg);
    } catch {
      toast.error('Could not disconnect. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard className="p-5">
      <p className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--surface-text)' }}>
        <CalendarCheck className="h-4 w-4 text-brand-600" aria-hidden="true" /> Optional: let the AI book meetings fully by itself
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--surface-text-2)' }}>
        Your Calendly link above already works. Connect Calendly too and the AI (chat, voice and video calls) books the time the visitor picks by itself, with no confirm tap. Calendly emails you both the invite with the meeting link. Works with any Calendly account; on the free plan the visitor taps “Schedule Event” once to confirm.
      </p>
      {status === null ? (
        <p className="mt-3 flex items-center gap-2 text-xs" style={{ color: 'var(--surface-text-2)' }}><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Checking…</p>
      ) : status ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.35)' }}>
          <p className="text-sm" style={{ color: 'var(--surface-text)' }}>
            <b className="text-emerald-600">Connected.</b> The AI books “{status.eventName}”{status.duration ? ` (${status.duration} min)` : ''} meetings.
            {status.schedulingUrl && (
              <a href={status.schedulingUrl} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-0.5 text-xs font-semibold text-brand-600 underline">
                Open <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
          </p>
          {status.canBook === false && (
            <p className="w-full text-xs" style={{ color: 'var(--surface-text-2)' }}>
              Your Calendly is on the <b>free plan</b>: the AI finds your free times and opens the confirmation for the time the visitor picks (their details filled in); they tap “Schedule Event”. For fully automatic booking, upgrade Calendly to Standard and connect again.
            </p>
          )}
          <button type="button" onClick={disconnect} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/10">
            <Unlink className="h-3.5 w-3.5" aria-hidden="true" /> Disconnect
          </button>
        </div>
      ) : (
        <>
          {oauth && (
            <div className="mt-3">
              <button type="button" onClick={connectOauth} disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#006BFF] px-5 py-3 text-sm font-bold text-white shadow-md hover:brightness-110 disabled:opacity-60 sm:w-auto">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CalendarCheck className="h-4 w-4" aria-hidden="true" />} Connect with Calendly
              </button>
              <p className="mt-1.5 text-[11px]" style={{ color: 'var(--surface-text-2)' }}>Sign in to Calendly and tap Allow. That's it.</p>
              <button type="button" onClick={() => setShowToken((v) => !v)} className="mt-2 text-[11px] font-semibold underline" style={{ color: 'var(--surface-text-2)' }}>
                {showToken ? 'Hide' : 'Advanced: paste an access token instead'}
              </button>
            </div>
          )}
          {(!oauth || showToken) && (
          <>
          <ol className="mt-3 list-decimal space-y-0.5 pl-5 text-xs" style={{ color: 'var(--surface-text-2)' }}>
            <li>Open <a href="https://calendly.com/integrations/api_webhooks" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 underline">Calendly → Integrations → API &amp; Webhooks</a>.</li>
            <li>Under “Personal access tokens”, tap “Generate new token”, give it a name (e.g. Aicardly) and copy it.</li>
            <li>Paste it below and tap Connect. The AI uses the event type of your booking link above (or your first one).</li>
          </ol>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your Calendly access token"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
              aria-label="Calendly access token"
            />
            <button type="button" onClick={connect} disabled={busy || token.trim().length < 20} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />} Connect
            </button>
          </div>
          <p className="mt-1.5 text-[11px]" style={{ color: 'var(--surface-text-2)' }}>The token is stored encrypted and is only used to read your free times and book meetings.</p>
          </>
          )}
        </>
      )}
    </GlassCard>
  );
}
