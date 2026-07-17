import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import AuthBrandPanel from '../components/AuthBrandPanel';
import GradientButton from '../components/ui/GradientButton';
import ThemeToggle from '../components/ui/ThemeToggle';
import MeshBackground from '../components/ui/MeshBackground';
import Logo from '../components/ui/Logo';
import Field from '../components/ui/Field';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    <div className="relative min-h-screen lg:flex font-['Inter']" style={{ background: 'var(--surface-bg)' }}>
      <AuthBrandPanel />

      <ThemeToggle className="fixed top-5 right-5 z-20" />

      {/* Form panel */}
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
            Welcome back
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight" style={{ color: 'var(--surface-text)' }}>Sign in to Webcard.ai</h1>
          <p className="mt-2" style={{ color: 'var(--surface-text-2)' }}>Your cards are waiting.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field icon={<Mail className="h-4 w-4" />} label="Email">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-premium pl-11"
                placeholder="you@company.com"
              />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label="Password">
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-premium pl-11"
                placeholder="••••••••"
              />
            </Field>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 overflow-hidden"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <GradientButton type="submit" disabled={loading} loading={loading} className="text-base">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Sign in</span><ArrowRight className="h-4 w-4" /></>}
            </GradientButton>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="font-medium text-crimson-700 hover:text-magenta-500 transition">
              Forgot password?
            </Link>
            <p style={{ color: 'var(--surface-text-2)' }}>
              No account?{' '}
              <Link to="/register" className="font-semibold hover:text-crimson-700 transition" style={{ color: 'var(--surface-text)' }}>
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
