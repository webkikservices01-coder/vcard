import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Mail, Lock, Check, ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import AuthBrandPanel from '../components/AuthBrandPanel';
import GradientButton from '../components/ui/GradientButton';
import ThemeToggle from '../components/ui/ThemeToggle';
import BackButton from '../components/BackButton';
import MeshBackground from '../components/ui/MeshBackground';
import Logo from '../components/ui/Logo';
import Field from '../components/ui/Field';
import PasswordEye from '../components/PasswordEye';

const API = import.meta.env.VITE_API_URL;

// /forgot-password: ask for a reset link by email.
// /reset-password?email=…&token=… (the emailed link): choose a new password.
const ForgotPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const resetMode = !!token;

  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const mismatch = !!confirm && confirm !== password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDone('');
    if (resetMode) {
      if (password.length < 8) return setError('Password must be at least 8 characters.');
      if (password !== confirm) return setError('Passwords do not match.');
    }
    setLoading(true);
    try {
      if (resetMode) {
        const { data } = await axios.post(`${API}/api/auth/reset-password`, { email: email.trim().toLowerCase(), token, password, confirm });
        setDone(data.msg);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const { data } = await axios.post(`${API}/api/auth/forgot-password`, { email: email.trim().toLowerCase() });
        setDone(data.msg);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen lg:flex font-['Inter']" style={{ background: 'var(--surface-bg)' }}>
      <AuthBrandPanel />

      <div className="fixed top-5 right-5 z-20 flex items-center gap-2">
        <BackButton />
        <ThemeToggle />
      </div>

      <div className="relative flex flex-1 min-h-screen items-center justify-center overflow-hidden px-6 py-12">
        <MeshBackground rich />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="lg:hidden mb-8">
            <Logo size={32} />
          </div>

          <span className="badge-glass text-crimson-700">
            <span className="h-1.5 w-1.5 rounded-full bg-magenta-500" />
            {resetMode ? 'Almost done' : 'No worries'}
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight" style={{ color: 'var(--surface-text)' }}>
            {resetMode ? 'Choose a new password' : 'Reset your password'}
          </h1>
          <p className="mt-2" style={{ color: 'var(--surface-text-2)' }}>
            {resetMode ? `For ${email}` : "Enter your account email and we'll send you a secure reset link."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {!resetMode && (
              <Field icon={<Mail className="h-4 w-4" />} label="Email">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium pl-11"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </Field>
            )}

            {resetMode && (
              <>
                <Field icon={<Lock className="h-4 w-4" />} label="New password">
                  <div className="relative">
                    <input
                      required
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-premium pl-11 pr-11"
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                    />
                    <PasswordEye shown={showPwd} onToggle={() => setShowPwd((v) => !v)} />
                  </div>
                </Field>
                <Field icon={<Lock className="h-4 w-4" />} label="Confirm new password">
                  <input
                    required
                    type={showPwd ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={`input-premium pl-11 ${mismatch ? '!border-red-500' : ''}`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-invalid={mismatch}
                  />
                </Field>
                {mismatch && (
                  <p role="alert" className="-mt-2 flex items-center gap-1 text-xs font-medium text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" /> Passwords do not match
                  </p>
                )}
              </>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 overflow-hidden"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    {error}
                    {resetMode && /expired|invalid/i.test(error) && (
                      <>
                        {' '}
                        <Link to={`/forgot-password?email=${encodeURIComponent(email)}`} className="font-semibold underline">
                          Send a new link
                        </Link>
                      </>
                    )}
                  </span>
                </motion.div>
              )}
              {done && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 overflow-hidden"
                >
                  <Check className="h-4 w-4 shrink-0 mt-0.5" /> {done}
                </motion.div>
              )}
            </AnimatePresence>

            <GradientButton type="submit" disabled={loading || mismatch} loading={loading} className="text-base">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>{resetMode ? 'Update password' : 'Send reset link'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </GradientButton>
          </form>

          <div className="mt-6 text-sm">
            <Link to="/login" className="inline-flex items-center gap-1 font-semibold hover:text-crimson-700 transition" style={{ color: 'var(--surface-text)' }}>
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
