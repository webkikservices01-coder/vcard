import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Logo from '../components/ui/Logo';
import VerifyEmailNotice from '../components/VerifyEmailNotice';
import { useTheme } from '../context/ThemeContext';

// Opened from the verification email: confirms the address, signs the user in and moves on
// to card setup.
const VerifyEmail = () => {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [state, setState] = useState(email && token ? 'checking' : 'invalid');
  const [msg, setMsg] = useState('');
  const [resend, setResend] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !email || !token) return;
    ran.current = true;
    axios
      .post(`${import.meta.env.VITE_API_URL}/api/auth/verify-email`, { email, token })
      .then((res) => {
        localStorage.setItem('token', res.data.token);
        setState('done');
        // Onboarding sends people with a finished card on to the dashboard.
        setTimeout(() => navigate('/onboarding', { replace: true }), 1400);
      })
      .catch((err) => {
        setMsg(err.response?.data?.msg || 'Could not verify the email. Please try again.');
        setState('invalid');
      });
  }, [email, token, navigate]);

  return (
    <div className={`min-h-dvh grid place-items-center px-4 py-10 font-['Inter'] ${isDark ? 'bg-[#07090E] text-slate-100' : 'bg-[#faf8f9] text-slate-900'}`}>
      <div className={`w-full max-w-[440px] rounded-[26px] p-7 sm:p-9 shadow-2xl ${isDark ? 'bg-[#0c101a] border border-white/10' : 'bg-white border border-pink-100'}`}>
        <div className="mb-6 flex justify-center">
          <Logo size={32} />
        </div>
        {resend ? (
          <VerifyEmailNotice email={email} isDark={isDark} sent={false} onBack={() => navigate('/login')} />
        ) : state === 'checking' ? (
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#E70C65]" />
            <p className="mt-4 text-sm font-semibold">Verifying your email…</p>
          </div>
        ) : state === 'done' ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
            <h1 className="mt-4 text-2xl font-extrabold">Email verified!</h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Taking you to set up your card…</p>
          </div>
        ) : (
          <div className="text-center">
            <AlertCircle className="mx-auto h-14 w-14 text-red-500" />
            <h1 className="mt-4 text-2xl font-extrabold">Link not valid</h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {msg || 'This verification link is incomplete. Please open the latest link from your email.'}
            </p>
            {email && (
              <button
                type="button"
                onClick={() => setResend(true)}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#E70C65] to-[#9F1C44] py-3 text-sm font-bold text-white"
              >
                Send me a new link
              </button>
            )}
            <Link to="/login" className="mt-3 inline-block text-xs font-bold text-[#E70C65] hover:underline">
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
