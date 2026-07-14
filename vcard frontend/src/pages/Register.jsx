import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import AuthBrandPanel from '../components/AuthBrandPanel';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import ThemeToggle from '../components/ui/ThemeToggle';
import MeshBackground from '../components/ui/MeshBackground';
import { fadeUp } from '../utils/motion';

const fields = [
  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe', icon: User },
  { label: 'Email address', key: 'email', type: 'email', placeholder: 'you@example.com', icon: Mail },
  { label: 'Phone number', key: 'phone', type: 'tel', placeholder: '+91 98765 43210', icon: Phone },
  { label: 'Password', key: 'password', type: 'password', placeholder: 'Min. 6 characters', icon: Lock },
  { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: '••••••••', icon: Lock },
];

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        name: form.name, email: form.email, phone: form.phone, password: form.password
      });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
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
        <motion.div {...fadeUp(0)} className="w-full max-w-sm py-8">
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-display text-2xl font-black tracking-tight" style={{ color: 'var(--surface-text)' }}>MYcardLINK</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)' }}>Digital Business Card Platform</p>
          </div>

          <GlassCard className="p-7 sm:p-8">
            <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--surface-text)' }}>Create account</h2>
            <p className="text-sm mb-8" style={{ color: 'var(--surface-text-2)' }}>Start your digital card journey</p>

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
              {fields.map(({ label, key, type, placeholder, icon: Icon }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surface-text-2)' }} />
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition text-sm focus:ring-2 focus:ring-brand-400"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                      placeholder={placeholder}
                      required={key !== 'phone'}
                    />
                  </div>
                </motion.div>
              ))}

              <div className="pt-2">
                <GradientButton type="submit" disabled={loading} loading={loading}>
                  {loading ? (
                    <motion.span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                </GradientButton>
              </div>
            </form>
          </GlassCard>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--surface-text-2)' }}>
            Already have an account?{' '}
            <Link to="/" className="font-semibold text-brand-500 hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
