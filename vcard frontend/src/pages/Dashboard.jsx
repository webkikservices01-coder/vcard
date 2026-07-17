import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye, ArrowRight, Pencil, QrCode,
  Zap, Package, Star, CreditCard, Sparkles
} from 'lucide-react';
import axios from 'axios';
import GlassCard from '../components/ui/GlassCard';
import MeshBackground from '../components/ui/MeshBackground';
import StatCard from '../components/ui/StatCard';
import VcardTile from '../components/ui/VcardTile';
import { fadeUp } from '../utils/motion';

const PLAN_COLORS = {
  'Free Trial':    { badge: 'bg-gray-500/15 text-gray-400',   bar: 'bg-gray-400',   icon: 'bg-gray-500/10 text-gray-400' },
  'DIGITAL CARD':  { badge: 'bg-blue-500/15 text-blue-400',    bar: 'bg-blue-500',   icon: 'bg-blue-500/10 text-blue-400' },
  'SMART AI CARD': { badge: 'bg-purple-500/15 text-purple-400',bar: 'bg-purple-500', icon: 'bg-purple-500/10 text-purple-400' },
  'AI AGENT PRO':  { badge: 'bg-emerald-500/15 text-emerald-400', bar: 'bg-emerald-500', icon: 'bg-emerald-500/10 text-emerald-400' },
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/stats`, {
          headers: { 'x-auth-token': token }
        });
        setStats(res.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div className="space-y-4 max-w-4xl">
      <div className="h-28 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
      <div className="h-36 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />)}
      </div>
    </div>
  );

  const plan       = stats?.currentPlan || 'Free Trial';
  const pc         = PLAN_COLORS[plan] || PLAN_COLORS['Free Trial'];
  const daysLeft   = stats?.remainingDays;
  const cardLimit  = stats?.user?.cardLimit || 1;
  const cardCount  = stats?.vcardCount || 0;
  const cardSlug   = stats?.cardSlug;
  const firstName  = stats?.user?.name?.split(' ')[0] || 'User';
  const daysBar    = daysLeft != null ? Math.min(100, Math.round((daysLeft / 365) * 100)) : 0;

  const quickActions = [
    { label: 'Edit Profile', desc: 'Update your card details', path: '/dashboard/vcard/profile', icon: Pencil },
    { label: 'Add Product',  desc: 'Showcase what you offer',  path: '/dashboard/vcard/products', icon: Package },
    { label: 'QR Studio',    desc: 'Generate your branded QR', path: '/dashboard/vcard/qr',       icon: QrCode },
    { label: 'Upgrade Plan', desc: 'Unlock more AI features',  path: '/dashboard/plans',          icon: Zap },
  ];

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ── Welcome hero ─────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="relative bg-gradient-crimson rounded-2xl px-6 py-5 overflow-hidden">
        <MeshBackground className="opacity-60" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-white/60 mb-1 uppercase tracking-wider">Dashboard</p>
            <h1 className="font-display text-2xl font-black text-white leading-tight">Welcome back, {firstName}</h1>
            <div className="flex items-center gap-2 mt-2.5">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${pc.badge}`}>{plan}</span>
              {daysLeft != null
                ? <span className="text-xs text-white/70">{daysLeft} days left</span>
                : <span className="text-xs text-white/60">No active plan</span>
              }
            </div>
          </div>
          {cardSlug ? (
            <motion.a
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              href={`/c/${cardSlug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-crimson-700 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-crimson-50 transition shrink-0"
            >
              <Eye className="w-4 h-4" />
              <span>View Live Card</span>
            </motion.a>
          ) : (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/dashboard/vcard/profile"
                className="flex items-center gap-2 bg-white text-crimson-700 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-crimson-50 transition shrink-0">
                <Sparkles className="w-4 h-4" />
                <span>New card</span>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── Stats grid ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Eye,        label: 'Card Views',   value: stats?.viewCount ?? 0,          link: null },
          { icon: Package,    label: 'Products',     value: stats?.productCount ?? 0,        link: '/dashboard/vcard/products' },
          { icon: Star,       label: 'Testimonials', value: stats?.testimonialCount ?? 0,    link: '/dashboard/vcard/testimonials' },
          { icon: CreditCard, label: 'Cards Used',   value: `${cardCount} / ${cardLimit}`,   link: '/dashboard/vcard/all' },
        ].map(({ icon: Icon, label, value, link }, idx) => {
          const card = <StatCard icon={<Icon className="w-5 h-5" />} label={label} value={value} delay={0.1 + idx * 0.05} />;
          return link
            ? <Link key={label} to={link}>{card}</Link>
            : <div key={label}>{card}</div>;
        })}
      </div>

      {/* ── Quick actions ────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        {quickActions.map((a, i) => (
          <motion.div
            key={a.path}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to={a.path} className="glass-card flex items-center gap-4 p-4 group hover:-translate-y-1 hover:shadow-card-hover transition-all duration-500">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-crimson-soft text-crimson-700 group-hover:bg-gradient-crimson group-hover:text-white group-hover:shadow-glow-crimson transition-all duration-500">
                <a.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: 'var(--surface-text)' }}>{a.label}</p>
                <p className="text-sm truncate" style={{ color: 'var(--surface-text-2)' }}>{a.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 group-hover:text-crimson-700 group-hover:translate-x-1 transition-all" style={{ color: 'var(--surface-text-2)' }} />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Your card ────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: 'var(--surface-text)' }}>Your card</h2>
          <Link to="/dashboard/vcard/all" className="text-sm font-medium text-crimson-700 hover:text-magenta-500 transition">
            View all
          </Link>
        </div>

        {cardSlug ? (
          <div className="max-w-sm">
            <VcardTile
              {...fadeUp(0.4)}
              name={stats.cardName}
              subtitle={stats.cardDesignation || `/c/${cardSlug}`}
              avatarUrl={stats.cardProfilePic}
              viewCount={stats?.viewCount ?? 0}
              footer={
                <>
                  <a href={`/c/${cardSlug}`} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg fast-transition hover:text-brand-500 hover:bg-brand-500/10" style={{ color: 'var(--surface-text-2)' }} title="View">
                    <Eye className="w-4 h-4" />
                  </a>
                  <Link to="/dashboard/vcard/profile"
                    className="p-2 rounded-lg fast-transition hover:text-brand-500 hover:bg-brand-500/10" style={{ color: 'var(--surface-text-2)' }} title="Edit">
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <Link to="/dashboard/vcard/qr"
                    className="p-2 rounded-lg fast-transition hover:text-brand-500 hover:bg-brand-500/10" style={{ color: 'var(--surface-text-2)' }} title="QR">
                    <QrCode className="w-4 h-4" />
                  </Link>
                </>
              }
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card relative overflow-hidden p-12 text-center"
          >
            <div className="absolute inset-0 bg-gradient-radial opacity-40" />
            <div className="absolute -top-8 left-1/4 h-24 w-24 rounded-full bg-magenta-500/10 blur-2xl animate-pulse-glow" />
            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-crimson text-white shadow-glow-crimson">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-2xl font-bold" style={{ color: 'var(--surface-text)' }}>Create your first card</h3>
              <p className="mx-auto mt-2 max-w-md" style={{ color: 'var(--surface-text-2)' }}>
                Design a breathtaking digital business card in minutes. Share it anywhere with a link or QR.
              </p>
              <Link to="/dashboard/vcard/profile" className="btn-primary mt-6 inline-flex">
                <Sparkles className="h-4 w-4" /> Create card <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Active Plan ──────────────────────────────────── */}
      <GlassCard premium {...fadeUp(0.46)} className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>Active Plan</h3>
          <Link to="/dashboard/plans" className="text-xs font-semibold text-crimson-700 hover:text-magenta-500 transition">Upgrade →</Link>
        </div>
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${pc.icon}`}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>{plan}</p>
            <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>
              {daysLeft != null ? `${daysLeft} days remaining` : 'No expiry set'}
            </p>
          </div>
        </div>

        {daysLeft != null && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px]" style={{ color: 'var(--surface-text-2)' }}>
              <span>Validity</span>
              <span>{daysLeft} / 365 days</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
              <motion.div
                className={`h-full rounded-full ${pc.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${daysBar}%` }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--surface-border)' }}>
          <div>
            <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>Cards</p>
            <p className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>{cardCount} <span className="font-normal" style={{ color: 'var(--surface-text-2)' }}>/ {cardLimit} allowed</span></p>
          </div>
          {stats?.planExpiry && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>Renews</p>
              <p className="text-xs font-medium" style={{ color: 'var(--surface-text)' }}>
                {new Date(stats.planExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default Dashboard;
