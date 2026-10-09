import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { load as loadCashfree } from '@cashfreepayments/cashfree-js';
import { Check, Loader2, ShieldCheck } from 'lucide-react';
import { plans as PLAN_INFO, inr } from '../data/plans.jsx';
import LogoMark from '../components/ui/LogoMark';

// /upgrade/<token>: the link emailed when a free trial ends (BACKEND services/trial.js). No login:
// the token opens this account's upgrade; the visitor picks a plan and pays with Cashfree, and the
// card is live again at once. /upgrade/paid is where the SMS payment link returns to.
const API = `${import.meta.env.VITE_API_URL}/api/upgrade`;

let cashfreePromise = null;
const getCashfree = () =>
  (cashfreePromise ??= loadCashfree({ mode: import.meta.env.VITE_CASHFREE_ENV === 'production' ? 'production' : 'sandbox' }));

const HIGHLIGHTS = [
  ['aiChatWidget', 'AI chatbot on your card'],
  ['aiVoiceCall', 'Live AI voice call'],
  ['aiVideoCall', 'Live AI video call'],
  ['whatsappBot', 'WhatsApp AI bot'],
  ['hideBranding', 'No Aicardly branding'],
];
const highlightsOf = (id) => {
  const f = PLAN_INFO.find((p) => p.id === id)?.features || {};
  return ['Your card live again', ...(PLAN_INFO.find((p) => p.id === id)?.highlights || HIGHLIGHTS.filter(([k]) => f[k]).map(([, l]) => l))];
};

function Shell({ children }) {
  return (
    <div className="min-h-dvh bg-[#faf8f9] px-4 py-8 font-['Inter'] text-slate-900">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 font-bold">
          <LogoMark className="h-8 w-8" /> Aicardly
        </Link>
        {children}
      </div>
    </div>
  );
}

function Done({ title, text }) {
  return (
    <Shell>
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-black">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{text}</p>
        <Link to="/dashboard" className="mt-6 inline-block rounded-full bg-[#E70C65] px-6 py-3 text-sm font-bold text-white">
          Open my dashboard
        </Link>
      </div>
    </Shell>
  );
}

export default function UpgradePage() {
  const { token } = useParams();
  const [params, setParams] = useSearchParams();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [billing, setBilling] = useState('yearly');
  const [busy, setBusy] = useState('');
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (token === 'paid') return;
    axios
      .get(`${API}/${token}`)
      .then(({ data }) => setInfo(data))
      .catch((err) => setError(err.response?.data?.msg || 'Could not open this link.'));
  }, [token]);

  const verify = async (orderId) => {
    const { data } = await axios.post(`${API}/${token}/verify`, { orderId });
    if (data.status === 'PAID') setPaid(true);
    else setError('Payment not completed yet. If money was deducted, your plan activates automatically within a few minutes.');
  };

  // Back from Cashfree's own page (some UPI / bank payments redirect with ?order_id=…).
  useEffect(() => {
    const orderId = params.get('order_id');
    if (!orderId || token === 'paid') return;
    setParams({}, { replace: true });
    verify(orderId).catch((err) => setError(err.response?.data?.msg || 'Could not confirm the payment.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buy = async (planId) => {
    setBusy(planId);
    setError('');
    try {
      const { data } = await axios.post(`${API}/${token}/order`, { planId, billing });
      const cashfree = await getCashfree();
      const result = await cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: '_modal' });
      if (result.error) setError('Payment was not completed.');
      else await verify(data.orderId);
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not start the payment. Please try again.');
    } finally {
      setBusy('');
    }
  };

  if (token === 'paid') return <Done title="Payment received 🎉" text="Thank you! Your plan is active and your card is live again. It can take a minute to update." />;
  if (paid) return <Done title="You're all set 🎉" text="Your plan is active and your card is live again." />;

  return (
    <Shell>
      {!info && !error && (
        <div className="grid place-items-center py-24 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      {error && !info && (
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <h1 className="text-lg font-bold">Link not valid</h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <Link to="/dashboard/plans" className="mt-5 inline-block rounded-full bg-[#E70C65] px-6 py-3 text-sm font-bold text-white">
            Sign in to upgrade
          </Link>
        </div>
      )}
      {info && (
        <>
          <h1 className="text-2xl font-black sm:text-3xl">Hi {String(info.name || '').split(' ')[0] || 'there'}, keep your card live</h1>
          <p className="mt-2 text-sm text-slate-600">
            {info.paused ? 'Your free trial is over and your card is paused. ' : ''}Choose a plan and pay. Your card is live again the moment the payment goes through.
          </p>

          <div className="mt-6 inline-flex rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200" role="radiogroup" aria-label="Billing period">
            {['monthly', 'yearly'].map((b) => (
              <button key={b} type="button" role="radio" aria-checked={billing === b} onClick={() => setBilling(b)} className={`rounded-full px-5 py-2 text-sm font-semibold capitalize ${billing === b ? 'bg-[#E70C65] text-white' : 'text-slate-600'}`}>
                {b}
              </button>
            ))}
          </div>

          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {info.plans.map((p) => {
              const price = p[billing];
              const meta = PLAN_INFO.find((x) => x.id === p.id);
              const popular = meta?.popular;
              return (
                <div key={p.id} className={`flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ${popular ? 'ring-2 ring-[#E70C65]' : 'ring-slate-200'}`}>
                  {popular && <span className="mb-2 self-start rounded-full bg-[#E70C65] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Most popular</span>}
                  <h2 className="text-lg font-black">{p.name}</h2>
                  <p className="text-xs text-slate-500">{meta?.tagline}</p>
                  <p className="mt-4 text-3xl font-black">
                    {inr(price.base)}
                    <span className="text-sm font-medium text-slate-500"> / {billing === 'monthly' ? 'month' : 'year'}</span>
                  </p>
                  <p className="text-xs text-slate-500">+ 18% GST = {inr(price.amount)}</p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-700">
                    {highlightsOf(p.id).map((h) => (
                      <li key={h} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {h}
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => buy(p.id)} disabled={!!busy} className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold disabled:opacity-60 ${popular ? 'bg-[#E70C65] text-white' : 'bg-slate-900 text-white'}`}>
                    {busy === p.id && <Loader2 className="h-4 w-4 animate-spin" />}
                    Pay {inr(price.amount)}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-6 flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4" /> Secure payment by Cashfree. Account: {info.email}
          </p>
        </>
      )}
    </Shell>
  );
}
