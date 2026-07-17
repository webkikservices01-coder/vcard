import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import AuthBrandPanel from '../components/AuthBrandPanel';
import GradientButton from '../components/ui/GradientButton';
import ThemeToggle from '../components/ui/ThemeToggle';
import MeshBackground from '../components/ui/MeshBackground';
import Logo from '../components/ui/Logo';
import Field from '../components/ui/Field';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 400);
  };

  return (
    <div className="relative min-h-screen lg:flex font-['Inter']" style={{ background: 'var(--surface-bg)' }}>
      <AuthBrandPanel />

      <ThemeToggle className="fixed top-5 right-5 z-20" />

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
            No worries
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight" style={{ color: 'var(--surface-text)' }}>Reset your password</h1>
          <p className="mt-2" style={{ color: 'var(--surface-text-2)' }}>We will send a secure link.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field icon={<Mail className="h-4 w-4" />} label="Email">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium pl-11"
                placeholder="you@company.com"
              />
            </Field>

            <AnimatePresence>
              {sent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 overflow-hidden"
                >
                  <Check className="h-4 w-4 shrink-0" /> Reset link sent. Check your inbox.
                </motion.div>
              )}
            </AnimatePresence>

            <GradientButton type="submit" disabled={loading} loading={loading} className="text-base">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Send reset link</span><ArrowRight className="h-4 w-4" /></>}
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
