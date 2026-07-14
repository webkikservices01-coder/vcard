import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import AuthBrandPanel from '../components/AuthBrandPanel';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import ThemeToggle from '../components/ui/ThemeToggle';
import MeshBackground from '../components/ui/MeshBackground';
import { fadeUp } from '../utils/motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen flex font-['Inter'] relative" style={{ background: 'var(--surface-bg)' }}>
      <div className="lg:hidden absolute inset-0"><MeshBackground /></div>
      <AuthBrandPanel />

      <ThemeToggle className="fixed top-5 right-5 z-20" />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <motion.div {...fadeUp(0)} className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--surface-text)' }}>MYcardLINK</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)' }}>Digital Business Card Platform</p>
          </div>

          <GlassCard className="p-7 sm:p-8">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 14, delay: 0.1 }}
                    className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--surface-text)' }}>Check your email</h2>
                  <p className="text-sm mb-6" style={{ color: 'var(--surface-text-2)' }}>
                    If an account exists for <span className="font-medium" style={{ color: 'var(--surface-text)' }}>{email}</span>, a reset link has been sent.
                  </p>
                  <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:underline">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </Link>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--surface-text)' }}>Forgot password?</h2>
                  <p className="text-sm mb-8" style={{ color: 'var(--surface-text-2)' }}>Enter your email and we'll send a reset link.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Email address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surface-text-2)' }} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition text-sm focus:ring-2 focus:ring-brand-400"
                          style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>
                    <GradientButton type="submit">
                      <Send className="w-4 h-4" />
                      <span>Send Reset Link</span>
                    </GradientButton>
                  </form>

                  <p className="text-center text-sm mt-6">
                    <Link to="/" className="inline-flex items-center gap-1.5 font-semibold hover:text-brand-500 transition" style={{ color: 'var(--surface-text)' }}>
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                    </Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
