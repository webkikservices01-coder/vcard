import { useState } from 'react';
import axios from 'axios';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toE164 } from '../utils/phone';

// /metal-nfc-card order request. Saved as a lead (admin panel → Leads, source "metal-card") and
// emailed to the team, who reply with a quote.
const API = import.meta.env.VITE_API_URL;
const QUANTITIES = ['1 card', '2–5 cards', '6–20 cards', 'More than 20'];

export default function MetalOrderForm() {
  const [v, setV] = useState({ name: '', phone: '', email: '', businessName: '', quantity: QUANTITIES[0], message: '', website: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle'); // idle | sending | done
  const [serverError, setServerError] = useState('');
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!v.name.trim()) next.name = 'Please enter your name.';
    if (!toE164(v.phone)) next.phone = 'Please enter a valid mobile number, e.g. 98123 45678.';
    if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) next.email = 'Please check your email address.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setState('sending');
    setServerError('');
    try {
      await axios.post(`${API}/api/ai/platform-lead`, {
        name: v.name.trim(),
        phone: toE164(v.phone),
        email: v.email.trim(),
        businessName: v.businessName.trim(),
        need: `Metal NFC card: ${v.quantity}`,
        message: v.message.trim(),
        website: v.website,
        source: 'metal-card',
      });
      setState('done');
    } catch (err) {
      setServerError(err.response?.data?.msg || 'Could not send your request. Please order on WhatsApp instead.');
      setState('idle');
    }
  };

  if (state === 'done') {
    return (
      <div role="status" className="flex items-start gap-3 rounded-2xl border p-6" style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-1)', color: 'var(--surface-text)' }}>
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
        <p className="text-sm">
          Thanks, {v.name.trim().split(' ')[0]}! We have your request and will send your quote on WhatsApp or call you, usually within one business day.
        </p>
      </div>
    );
  }

  const field = (id, label, input, hint) => (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold" style={{ color: 'var(--surface-text)' }}>{label}</label>
      {input}
      {errors[hint] && <p id={`${id}-error`} className="mt-1 text-xs text-red-500">{errors[hint]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 rounded-2xl border p-6 sm:grid-cols-2" style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-1)' }}>
      {/* Honeypot: only bots fill it in. */}
      <input type="text" name="website" value={v.website} onChange={set('website')} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {field('mo-name', 'Your name *',
        <input id="mo-name" className="input-premium text-sm" value={v.name} onChange={set('name')} maxLength={100} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'mo-name-error' : undefined} />, 'name')}
      {field('mo-phone', 'WhatsApp / mobile *',
        <input id="mo-phone" type="tel" inputMode="tel" className="input-premium text-sm" value={v.phone} onChange={set('phone')} maxLength={16} autoComplete="tel" placeholder="98123 45678" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'mo-phone-error' : undefined} />, 'phone')}
      {field('mo-email', 'Email (optional)',
        <input id="mo-email" type="email" className="input-premium text-sm" value={v.email} onChange={set('email')} maxLength={100} autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'mo-email-error' : undefined} />, 'email')}
      {field('mo-business', 'Company (optional)',
        <input id="mo-business" className="input-premium text-sm" value={v.businessName} onChange={set('businessName')} maxLength={150} autoComplete="organization" />, 'businessName')}
      {field('mo-qty', 'How many cards?',
        <select id="mo-qty" className="input-premium text-sm" value={v.quantity} onChange={set('quantity')}>
          {QUANTITIES.map((q) => <option key={q}>{q}</option>)}
        </select>, 'quantity')}
      {field('mo-msg', 'Finish, logo or anything else (optional)',
        <input id="mo-msg" className="input-premium text-sm" value={v.message} onChange={set('message')} maxLength={1000} />, 'message')}
      <div className="sm:col-span-2">
        {serverError && <p role="alert" className="mb-2 text-xs text-red-500">{serverError}</p>}
        <button
          type="submit"
          disabled={state === 'sending'}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#E70C65]/30 disabled:opacity-60"
        >
          {state === 'sending' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Request a quote
        </button>
        <p className="mt-2 text-xs" style={{ color: 'var(--surface-text-2)' }}>
          No payment now. We confirm the price, finish and delivery date with you first.
        </p>
      </div>
    </form>
  );
}
