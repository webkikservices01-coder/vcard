import { useEffect, useState } from 'react';
import axios from 'axios';
import { MailCheck, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const WAIT = 30; // seconds between resends

// "Check your inbox" after sign-up (or a sign-in before verifying), with a resend button.
const VerifyEmailNotice = ({ email, isDark, onBack, sent = true }) => {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(sent ? '' : "We couldn't send the email just now. Tap \"Resend link\".");
  const [wait, setWait] = useState(sent ? WAIT : 0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const resend = async () => {
    setBusy(true);
    setMsg('');
    try {
      const res = await axios.post(`${API}/api/auth/resend-verification`, { email });
      setMsg(res.data?.msg || 'A new link is on its way.');
      setWait(WAIT);
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Could not send the link. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-lg shadow-[#E70C65]/30">
        <MailCheck className="h-8 w-8" />
      </div>
      <h2 className={`mt-5 text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Verify your email</h2>
      <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        We sent a verification link to <b className={isDark ? 'text-white' : 'text-slate-900'}>{email}</b>. Open it to activate your account, then
        you'll go straight to setting up your card.
      </p>
      <p className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Can't find it? Check your Spam or Promotions folder.</p>

      {msg && (
        <p className={`mt-4 rounded-xl px-3 py-2 text-xs font-medium ${isDark ? 'bg-white/5 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>{msg}</p>
      )}

      <button
        type="button"
        onClick={resend}
        disabled={busy || wait > 0}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E70C65] via-[#ff6b9d] to-[#9F1C44] py-3 text-sm font-bold text-white shadow-lg shadow-[#E70C65]/35 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : wait > 0 ? `Resend link in ${wait}s` : 'Resend link'}
      </button>
      {onBack && (
        <button type="button" onClick={onBack} className="mt-3 text-xs font-bold text-[#E70C65] hover:underline underline-offset-4">
          Use a different email / Back to sign in
        </button>
      )}
    </div>
  );
};

export default VerifyEmailNotice;
