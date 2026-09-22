import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import AuthBrandPanel from '../components/AuthBrandPanel';
import ThemeToggle from '../components/ui/ThemeToggle';
import Logo from '../components/ui/Logo';
import { useTheme } from '../context/ThemeContext';

// Sequential container orchestration
const containerVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -30, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 30, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const slideFromBottom = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

export const Login = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <div className={`relative min-h-screen lg:flex font-['Inter'] transition-colors duration-500 overflow-hidden ${
      isDark ? 'bg-[#07090E] text-slate-100' : 'bg-[#faf8f9] text-slate-900'
    }`}>
      
      <style>{`
        @keyframes borderSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes buttonShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .clean-border-beam {
          position: relative;
          border-radius: 26px;
          padding: 1.5px;
          overflow: hidden;
        }
        .clean-border-beam::before {
          content: '';
          position: absolute;
          inset: -150%;
          background: conic-gradient(from 0deg, transparent 0 320deg, #E70C65 345deg, #ff6b9d 360deg);
          animation: borderSpin 6s linear infinite;
        }

        .shimmer-btn {
          background-size: 200% 200%;
          animation: buttonShimmer 4s ease infinite;
        }
      `}</style>

      {/* Floating Theme Toggle (Fixed Top-Right) */}
      <div className="fixed top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      {/* Left Brand Panel */}
      <AuthBrandPanel />

      {/* Right Form Container */}
      <div className="relative flex flex-1 min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-8">
        
        {/* Dot Matrix Grid */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: `radial-gradient(${isDark ? 'rgba(231, 12, 101, 0.35)' : 'rgba(231, 12, 101, 0.2)'} 1px, transparent 1px)`,
            backgroundSize: '28px 28px'
          }}
        />

        {/* Ambient Glow Aura */}
        <div className={`pointer-events-none absolute -right-20 -top-20 h-[420px] w-[420px] rounded-full blur-[110px] transition-all duration-700 ${
          isDark ? 'bg-gradient-to-br from-[#E70C65]/20 via-[#6366f1]/15 to-transparent' : 'bg-gradient-to-br from-[#ffb8d2]/40 via-[#e0e7ff]/30 to-transparent'
        }`} />
        <div className={`pointer-events-none absolute -left-20 -bottom-20 h-[420px] w-[420px] rounded-full blur-[110px] transition-all duration-700 ${
          isDark ? 'bg-gradient-to-tr from-[#9F1C44]/20 via-[#E70C65]/10 to-transparent' : 'bg-gradient-to-tr from-[#ffd1e1]/40 to-transparent'
        }`} />

        {/* Form Card */}
        <div className={`clean-border-beam relative z-10 w-full max-w-[450px] transition-all duration-500 ${
          isDark ? 'bg-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]' : 'bg-[#E70C65]/15 shadow-[0_20px_50px_rgba(231,12,101,0.08)]'
        }`}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`relative rounded-[25px] p-7 sm:p-9 backdrop-blur-2xl transition-colors duration-500 ${
              isDark ? 'bg-[#0c101a]/95' : 'bg-white/95 border border-pink-100/60'
            }`}
          >
            {/* 1. Mobile Logo */}
            <motion.div variants={slideFromBottom} className="lg:hidden mb-5 flex justify-center">
              <Logo size={32} />
            </motion.div>

            {/* 2. Badge & Headers */}
            <motion.div variants={slideFromBottom} className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-colors ${
                isDark 
                  ? 'border-[#E70C65]/35 bg-[#E70C65]/15 text-[#ff6b9d] shadow-[0_0_12px_rgba(231,12,101,0.25)]' 
                  : 'border-[#E70C65]/20 bg-[#fff0f5] text-[#9F1C44]'
              }`}>
                <Sparkles className="h-3 w-3 animate-pulse text-[#E70C65]" />
                Welcome back
              </span>
            </motion.div>

            <motion.h1 variants={slideFromBottom} className={`mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Sign in to Webcard.ai
            </motion.h1>

            <motion.p variants={slideFromBottom} className={`mt-1.5 text-xs sm:text-sm transition-colors ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Your cards and AI persona are waiting.
            </motion.p>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              
              {/* 3. Email (Slide from Left) */}
              <motion.div variants={slideFromLeft}>
                <label className={`block text-xs font-semibold mb-1.5 transition-colors ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>Email address</label>
                <div className="relative group">
                  <Mail className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                    isDark ? 'text-slate-400 group-focus-within:text-[#ff6b9d]' : 'text-slate-400 group-focus-within:text-[#E70C65]'
                  }`} />
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@company.com"
                    className={`w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-xs sm:text-sm shadow-inner outline-none transition-all duration-300 ${
                      isDark 
                        ? 'border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:border-[#E70C65] focus:bg-white/[0.07] focus:shadow-[0_0_15px_rgba(231,12,101,0.3)]' 
                        : 'border-slate-200 bg-slate-50/70 text-slate-900 placeholder-slate-400 focus:border-[#E70C65] focus:bg-white focus:shadow-[0_0_15px_rgba(231,12,101,0.15)]'
                    }`}
                  />
                </div>
              </motion.div>

              {/* 4. Password (Slide from Right) */}
              <motion.div variants={slideFromRight}>
                <label className={`block text-xs font-semibold mb-1.5 transition-colors ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>Password</label>
                <div className="relative group">
                  <Lock className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                    isDark ? 'text-slate-400 group-focus-within:text-[#ff6b9d]' : 'text-slate-400 group-focus-within:text-[#E70C65]'
                  }`} />
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className={`w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-xs sm:text-sm shadow-inner outline-none transition-all duration-300 ${
                      isDark 
                        ? 'border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:border-[#E70C65] focus:bg-white/[0.07] focus:shadow-[0_0_15px_rgba(231,12,101,0.3)]' 
                        : 'border-slate-200 bg-slate-50/70 text-slate-900 placeholder-slate-400 focus:border-[#E70C65] focus:bg-white focus:shadow-[0_0_15px_rgba(231,12,101,0.15)]'
                    }`}
                  />
                </div>

                {/* Clean Forgot Password Placement */}
                <div className="mt-2 flex justify-end">
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-medium text-[#E70C65] hover:underline underline-offset-4 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </motion.div>

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2 text-xs font-medium text-red-500 overflow-hidden backdrop-blur-md"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 5. Submit Button */}
              <motion.div variants={slideFromBottom} className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="shimmer-btn group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E70C65] via-[#ff6b9d] to-[#9F1C44] py-3 text-sm font-bold text-white shadow-lg shadow-[#E70C65]/35 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#E70C65]/55 active:translate-y-0 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            {/* 6. Sign Up Redirect Link */}
            <motion.div variants={slideFromBottom} className="mt-6 text-center text-xs">
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-bold text-[#E70C65] hover:underline underline-offset-4 transition-colors"
                >
                  Create account
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;