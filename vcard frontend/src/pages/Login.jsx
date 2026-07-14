import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import AuthBrandPanel from '../components/AuthBrandPanel';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import ThemeToggle from '../components/ui/ThemeToggle';
import MeshBackground from '../components/ui/MeshBackground';
import { fadeUp } from '../utils/motion';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-['Inter'] relative" style={{ background: 'var(--surface-bg)' }}>
      <div className="lg:hidden absolute inset-0"><MeshBackground /></div>
      <AuthBrandPanel />

      <ThemeToggle className="fixed top-5 right-5 z-20" />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <motion.div {...fadeUp(0)} className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-display text-2xl font-black tracking-tight" style={{ color: 'var(--surface-text)' }}>MYcardLINK</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)' }}>Digital Business Card Platform</p>
          </div>

          <GlassCard className="p-7 sm:p-8">
            <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--surface-text)' }}>Welcome back</h2>
            <p className="text-sm mb-8" style={{ color: 'var(--surface-text-2)' }}>Sign in to manage your digital card</p>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg mb-5 text-sm">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surface-text-2)' }} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition text-sm focus:ring-2 focus:ring-brand-400"
                    style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surface-text-2)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg outline-none transition text-sm focus:ring-2 focus:ring-brand-400"
                    style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:text-brand-500 transition-colors"
                    style={{ color: 'var(--surface-text-2)' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs hover:text-brand-500 transition" style={{ color: 'var(--surface-text-2)' }}>
                  Forgot password?
                </Link>
              </div>

              <GradientButton type="submit" disabled={loading} loading={loading}>
                {loading ? (
                  <motion.span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              </GradientButton>
            </form>
          </GlassCard>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--surface-text-2)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-500 hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
