import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, CreditCard, Download, FileText, Image as ImageIcon, Loader2, MessageCircle, RefreshCw, Send, ShieldCheck, TimerOff, AlertTriangle,
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import LiveCardPreview from '../components/LiveCardPreview';
import { fadeUp } from '../utils/motion';
import { toE164 } from '../utils/phone';

const API = `${import.meta.env.VITE_API_URL}/api/card-orders`;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });
const inr = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`;

const DELIVERY = {
  PENDING: { label: 'Sending your card…', tone: 'amber', spin: true },
  SENT: { label: 'Sent to your WhatsApp', tone: 'green' },
  DELIVERED: { label: 'Delivered on WhatsApp', tone: 'green' },
  READ: { label: 'Seen on WhatsApp', tone: 'green' },
  FAILED: { label: "Couldn't reach your WhatsApp", tone: 'red' },
  SKIPPED: { label: 'Sent by email', tone: 'blue' },
};
const TONES = {
  green: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  red: 'bg-red-500/15 text-red-500 border-red-500/30',
  blue: 'bg-sky-500/15 text-sky-500 border-sky-500/30',
};

function useCountdown(to) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!to) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [to]);
  if (!to) return '';
  const ms = Math.max(0, new Date(to).getTime() - now);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

const Btn = ({ children, busy, variant = 'primary', className = '', ...p }) => (
  <button
    type="button"
    disabled={busy || p.disabled}
    {...p}
    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all disabled:opacity-60 ${
      variant === 'primary'
        ? 'bg-gradient-to-r from-[#E70C65] to-[#9F1C44] text-white shadow-lg shadow-[#E70C65]/30 hover:-translate-y-0.5'
        : 'border hover:-translate-y-0.5'
    } ${className}`}
    style={variant === 'primary' ? undefined : { borderColor: 'var(--surface-border)', color: 'var(--surface-text)' }}
  >
    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
    {children}
  </button>
);

const GetCard = () => {
  const [params, setParams] = useSearchParams();
  const [cfg, setCfg] = useState(null);
  const [me, setMe] = useState(null);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const order = me?.order;
  const countdown = useCountdown(order?.status === 'PENDING_PAYMENT' ? order.expiresAt : null);

  const load = useCallback(async () => {
    const [c, m] = await Promise.all([axios.get(`${API}/config`), axios.get(`${API}/me`, { headers: headers() })]);
    setCfg(c.data);
    setMe(m.data);
    setPhone((p) => p || m.data.phone || '');
    return m.data;
  }, []);

  useEffect(() => {
    // load() is async: its setState calls run after the request, not during the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch(() => setError('Could not load your order. Please refresh.'));
  }, [load]);

  // Back from the Razorpay page (?order=…): ask Razorpay now, then follow until the card is sent.
  const checked = useRef(false);
  useEffect(() => {
    const id = params.get('order');
    if (!id || checked.current) return;
    checked.current = true;
    (async () => {
      try {
        const { data } = await axios.post(`${API}/${id}/check`, {}, { headers: headers() });
        setMe((m) => ({ ...(m || {}), order: data.order }));
        if (data.order?.status === 'PAID') toast.success('Payment received! Sending your card…');
      } catch {
        /* the webhook will still update it */
      }
      params.delete('order');
      params.delete('razorpay_payment_link_id');
      params.delete('razorpay_payment_link_reference_id');
      params.delete('razorpay_payment_link_status');
      params.delete('razorpay_payment_id');
      params.delete('razorpay_signature');
      setParams(params, { replace: true });
    })();
  }, [params, setParams]);

  // Keep refreshing while the card is being sent (or a payment was just made).
  const waiting = order?.status === 'PAID' && order?.delivery?.status === 'PENDING';
  useEffect(() => {
    if (!waiting) return;
    const t = setInterval(() => load().catch(() => {}), 4000);
    return () => clearInterval(t);
  }, [waiting, load]);

  const act = async (key, fn) => {
    setBusy(key);
    setError('');
    try {
      await fn();
    } catch (err) {
      const msg = err.response?.data?.msg || 'Something went wrong. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy('');
    }
  };

  const createOrder = () =>
    act('create', async () => {
      const e164 = toE164(phone);
      if (!e164) throw { response: { data: { msg: 'Please enter a valid WhatsApp number, e.g. +91 98123 45678.' } } };
      const { data } = await axios.post(API, { phone: e164 }, { headers: headers() });
      setMe((m) => ({ ...m, order: data.order, phone: e164 }));
      toast.success(data.created ? 'Payment link sent to your email and WhatsApp!' : 'Your payment link is ready.');
    });
  const newLink = () =>
    act('new', async () => {
      const { data } = await axios.post(`${API}/${order.id}/new-link`, {}, { headers: headers() });
      setMe((m) => ({ ...m, order: data.order }));
      toast.success('New payment link sent to your email and WhatsApp!');
    });
  const resendLink = () =>
    act('resend', async () => {
      const { data } = await axios.post(`${API}/${order.id}/resend-link`, {}, { headers: headers() });
      toast.success(data.msg);
    });
  const checkNow = () =>
    act('check', async () => {
      const { data } = await axios.post(`${API}/${order.id}/check`, {}, { headers: headers() });
      setMe((m) => ({ ...m, order: data.order }));
      toast[data.order.status === 'PAID' ? 'success' : 'error'](data.order.status === 'PAID' ? 'Payment received! Sending your card…' : 'No payment yet. Complete it on the payment page.');
    });
  const resendCard = () =>
    act('card', async () => {
      const { data } = await axios.post(`${API}/${order.id}/resend-card`, {}, { headers: headers() });
      setMe((m) => ({ ...m, order: data.order }));
      toast.success('Card sent again to your WhatsApp and email.');
    });

  if (!cfg || !me)
    return (
      <div className="grid min-h-[50vh] place-items-center">
        {error ? <p className="text-sm text-red-500">{error}</p> : <Loader2 className="h-8 w-8 animate-spin text-[#E70C65]" />}
      </div>
    );

  const price = inr(order?.amount || cfg.priceInr * 100);
  const status = order?.status;
  const d = DELIVERY[order?.delivery?.status];
  const muted = { color: 'var(--surface-text-2)' };
  const text = { color: 'var(--surface-text)' };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl sm:text-3xl font-black" style={text}>Get my card</h1>
        <p className="mt-1 text-sm" style={muted}>
          Pay once and receive your finished card (print-ready PDF + image) on WhatsApp and email.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <GlassCard {...fadeUp(0.05)} className="lg:col-span-7 p-5 sm:p-7 space-y-5">
          {!cfg.payments && (
            <div className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-600">
              <AlertTriangle className="h-5 w-5 shrink-0" /> Online payment for cards is being set up. Please check back soon, or contact support.
            </div>
          )}

          {!me.hasCard ? (
            <div className="space-y-3">
              <p className="text-sm" style={text}>First create your card, then come back here to get it delivered.</p>
              <Link to="/dashboard/vcard/profile" className="inline-flex rounded-xl bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-5 py-3 text-sm font-bold text-white">
                Create my card
              </Link>
            </div>
          ) : status === 'PAID' ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-9 w-9 shrink-0 text-emerald-500" />
                <div>
                  <h2 className="text-xl font-extrabold" style={text}>{order.complimentary ? 'Your card is on us 🎁' : `Payment received – ${price}`}</h2>
                  <p className="text-sm" style={muted}>{order.complimentary ? 'Free card from Aicardly, confirmed on' : 'Paid on'} {new Date(order.paidAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
              </div>
              {d && (
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${TONES[d.tone]}`}>
                  {d.spin ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />} {d.label}
                  {order.phone && d.tone !== 'blue' ? <span className="font-medium opacity-80">· {order.phone}</span> : null}
                </div>
              )}
              {order.delivery.status === 'FAILED' && order.delivery.lastError && (
                <p className="text-xs" style={muted}>
                  Reason: {order.delivery.lastError}. A copy was sent to {order.email}. Try again below.
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                {order.delivery.pdfUrl ? (
                  <a href={order.delivery.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#E70C65]/30">
                    <FileText className="h-4 w-4" /> Download card (PDF)
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm" style={muted}>
                    <Loader2 className="h-4 w-4 animate-spin" /> Preparing your card…
                  </span>
                )}
                {order.delivery.imageUrl && (
                  <a href={order.delivery.imageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold" style={{ borderColor: 'var(--surface-border)', ...text }}>
                    <ImageIcon className="h-4 w-4" /> Download image
                  </a>
                )}
                <Btn variant="ghost" busy={busy === 'card'} onClick={resendCard} disabled={waiting}>
                  {busy !== 'card' && <Send className="h-4 w-4" />} Resend to WhatsApp & email
                </Btn>
              </div>
            </div>
          ) : status === 'PENDING_PAYMENT' ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Clock className="h-9 w-9 shrink-0 text-amber-500" />
                <div>
                  <h2 className="text-xl font-extrabold" style={text}>Complete your payment – {price}</h2>
                  <p className="text-sm" style={muted}>
                    We sent the link to {order.email}{order.phone ? ` and WhatsApp ${order.phone}` : ''}. It expires in <b style={text}>{countdown}</b>.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={order.paymentLinkUrl} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#E70C65]/30 hover:-translate-y-0.5 transition-all">
                  <CreditCard className="h-4 w-4" /> Pay {price} now
                </a>
                <Btn variant="ghost" busy={busy === 'check'} onClick={checkNow}>
                  {busy !== 'check' && <RefreshCw className="h-4 w-4" />} I've paid – check
                </Btn>
                <Btn variant="ghost" busy={busy === 'resend'} onClick={resendLink}>
                  {busy !== 'resend' && <Send className="h-4 w-4" />} Resend link
                </Btn>
              </div>
            </div>
          ) : status === 'EXPIRED' ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <TimerOff className="h-9 w-9 shrink-0 text-red-500" />
                <div>
                  <h2 className="text-xl font-extrabold" style={text}>Expired – payment link no longer works</h2>
                  <p className="text-sm" style={muted}>Payment links are valid for {cfg.linkHours} hours. Create a new one to continue.</p>
                </div>
              </div>
              <Btn busy={busy === 'new'} onClick={newLink} disabled={!cfg.payments}>
                {busy !== 'new' && <RefreshCw className="h-4 w-4" />} Generate new payment link
              </Btn>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold" style={text}>Your card, delivered to WhatsApp</h2>
                <ul className="mt-3 space-y-2 text-sm" style={text}>
                  {['Print-ready PDF card with your photo, details and QR code', 'High-resolution card image to share anywhere', 'Sent to your WhatsApp and email right after payment', 'Download again any time from here'].map((f) => (
                    <li key={f} className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={text}>WhatsApp number (the card is sent here)</label>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98123 45678"
                  className="w-full max-w-sm rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#E70C65]/50"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', ...text }}
                />
              </div>
              <Btn busy={busy === 'create'} onClick={createOrder} disabled={!cfg.payments}>
                {busy !== 'create' && <CreditCard className="h-4 w-4" />} Get my card – Pay {price}
              </Btn>
              <p className="flex items-center gap-1.5 text-xs" style={muted}>
                <ShieldCheck className="h-3.5 w-3.5" /> Secure payment by Razorpay (UPI, cards, net banking). The link is valid for {cfg.linkHours} hours.
              </p>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </GlassCard>

        <motion.div {...fadeUp(0.1)} className="lg:col-span-5">
          {me.username ? <LiveCardPreview username={me.username} height={520} /> : null}
          {status === 'PAID' && order.delivery.pdfUrl ? (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs" style={muted}>
              <Download className="h-3.5 w-3.5" /> Your PDF has your photo, details and a QR code to your live card.
            </p>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
};

export default GetCard;
