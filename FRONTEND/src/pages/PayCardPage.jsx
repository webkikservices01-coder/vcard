import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { load as loadCashfree } from '@cashfreepayments/cashfree-js';
import { ShieldCheck, Loader2, CheckCircle2, Clock } from 'lucide-react';

// /pay/card/<token>: the "Get my card" payment link we send by email and WhatsApp. No login: the
// link itself is the key. Starts the Cashfree checkout for the order; Cashfree brings the buyer
// back here (?done=1) and we check the payment, then the card is delivered.
const API = `${import.meta.env.VITE_API_URL}/api/card-orders/pay`;
let cashfreePromise;
const getCashfree = (mode) => (cashfreePromise ??= loadCashfree({ mode: mode === 'production' ? 'production' : 'sandbox' }));

export default function PayCardPage() {
  const { token } = useParams();
  const [params] = useSearchParams();
  const [info, setInfo] = useState(null);
  const [state, setState] = useState(params.get('done') ? 'checking' : 'loading'); // loading | ready | paying | checking | paid | expired | error
  const [error, setError] = useState('');

  const check = async () => {
    setState('checking');
    try {
      const { data } = await axios.post(`${API}/${token}/check`);
      setState(data.status === 'PAID' ? 'paid' : data.status === 'EXPIRED' ? 'expired' : 'ready');
      if (data.status !== 'PAID' && params.get('done')) setError('The payment did not go through. You can try again.');
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not check the payment.');
      setState('ready');
    }
  };

  useEffect(() => {
    axios
      .get(`${API}/${token}`)
      .then(({ data }) => {
        setInfo(data);
        if (data.status === 'PAID') setState('paid');
        else if (data.status !== 'PENDING_PAYMENT') setState('expired');
        else if (params.get('done')) check();
        else setState('ready');
      })
      .catch((err) => {
        setError(err.response?.data?.msg || 'This payment link is not valid.');
        setState('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const pay = async () => {
    setError('');
    setState('paying');
    try {
      const cashfree = await getCashfree(info.cfEnv);
      const result = await cashfree.checkout({ paymentSessionId: info.paymentSessionId, redirectTarget: '_modal' });
      if (result?.error) {
        setError(result.error.message || 'Payment was not completed.');
        setState('ready');
      } else await check();
    } catch {
      setError('Could not start the payment. Please try again.');
      setState('ready');
    }
  };

  const box = 'mx-auto mt-10 max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl';
  return (
    <div className="min-h-screen bg-[#faf8f9] px-4 py-10 text-slate-900">
      <div className={box}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E70C65]">Aicardly</p>
        {state === 'loading' || state === 'checking' ? (
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {state === 'checking' ? 'Checking your payment…' : 'Loading…'}</p>
        ) : state === 'paid' ? (
          <>
            <CheckCircle2 className="mx-auto mt-5 h-12 w-12 text-emerald-500" aria-hidden="true" />
            <h1 className="mt-3 text-2xl font-black">Payment received 🎉</h1>
            <p className="mt-2 text-sm text-slate-600">Your finished card is on its way to your WhatsApp and email (a PDF and an image). It takes a minute.</p>
            <Link to="/dashboard/get-card" className="mt-6 inline-block rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-6 py-3 text-sm font-bold text-white">Open my dashboard</Link>
          </>
        ) : state === 'expired' ? (
          <>
            <Clock className="mx-auto mt-5 h-10 w-10 text-amber-500" aria-hidden="true" />
            <h1 className="mt-3 text-xl font-black">This payment link has expired</h1>
            <p className="mt-2 text-sm text-slate-600">Payment links work for 24 hours. Sign in and tap “Get my card” for a new one.</p>
            <Link to="/dashboard/get-card" className="mt-6 inline-block rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-6 py-3 text-sm font-bold text-white">Get a new link</Link>
          </>
        ) : state === 'error' ? (
          <p className="mt-6 text-sm text-red-600" role="alert">{error}</p>
        ) : (
          <>
            <h1 className="mt-3 text-2xl font-black">Pay for your Aicardly card</h1>
            {info?.name && <p className="mt-1 text-sm text-slate-600">{info.name}{info.cardLink ? ` · ${info.cardLink}` : ''}</p>}
            <p className="mt-6 text-4xl font-black">₹{Number(info?.amount || 0).toLocaleString('en-IN')}</p>
            <p className="mt-1 text-xs text-slate-500">Your finished card (PDF + image) comes to your WhatsApp and email right after payment.</p>
            {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">{error}</p>}
            <button type="button" onClick={pay} disabled={state === 'paying' || !info?.paymentSessionId} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-6 py-3.5 text-sm font-bold text-white disabled:opacity-60">
              {state === 'paying' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Pay ₹{Number(info?.amount || 0).toLocaleString('en-IN')}
            </button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Secure payment by Cashfree: UPI, cards, net banking</p>
          </>
        )}
      </div>
    </div>
  );
}
