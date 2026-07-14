import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye, ArrowRight, ExternalLink, Pencil, QrCode,
  Zap, Package, Star, CreditCard, LayoutDashboard
} from 'lucide-react';
import axios from 'axios';
import GlassCard from '../components/ui/GlassCard';
import MeshBackground from '../components/ui/MeshBackground';
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

  return (
    <div className="space-y-4 max-w-4xl">

      {/* ── Welcome hero ─────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="relative bg-gradient-to-br from-brand-600 to-rose-600 rounded-2xl px-6 py-5 overflow-hidden">
        <MeshBackground className="opacity-60" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-white/60 mb-1 uppercase tracking-wider">Dashboard</p>
            <h1 className="font-display text-2xl font-black text-white leading-tight">Hey, {firstName} 👋</h1>
            <div className="flex items-center gap-2 mt-2.5">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${pc.badge}`}>{plan}</span>
              {daysLeft != null
                ? <span className="text-xs text-white/70">{daysLeft} days left</span>
                : <span className="text-xs text-white/60">No active plan</span>
              }
            </div>
          </div>
          {cardSlug && (
            <motion.a
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              href={`/c/${cardSlug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-brand-600 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-brand-50 transition shrink-0"
            >
              <Eye className="w-4 h-4" />
              <span>View Live Card</span>
            </motion.a>
          )}
        </div>
      </motion.div>

      {/* ── My vCard card ─────────────────────────────────── */}
      <GlassCard {...fadeUp(0.06)} hover className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>My vCard</h2>
          <Link to="/dashboard/vcard/all" className="text-xs hover:text-brand-500 flex items-center gap-1 transition" style={{ color: 'var(--surface-text-2)' }}>
            All Cards <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {cardSlug ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar + info */}
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-rose-600 flex items-center justify-center text-white text-xl font-black shrink-0 overflow-hidden">
                {stats.cardProfilePic
                  ? <img src={stats.cardProfilePic} alt="" className="w-full h-full object-cover" />
                  : (stats.cardName?.[0]?.toUpperCase() || 'V')
                }
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold truncate" style={{ color: 'var(--surface-text)' }}>{stats.cardName || 'Unnamed Card'}</p>
                <p className="text-sm truncate" style={{ color: 'var(--surface-text-2)' }}>{stats.cardDesignation || '—'}</p>
                <a href={`/c/${cardSlug}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs hover:text-brand-500 mt-0.5 transition" style={{ color: 'var(--surface-text-2)' }}>
                  /c/{cardSlug} <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
              <a href={`/c/${cardSlug}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-xs font-bold rounded-xl hover:opacity-90 transition">
                <Eye className="w-3.5 h-3.5" /> View
              </a>
              <Link to="/dashboard/vcard/profile"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold hover:border-brand-500 hover:text-brand-500 fast-transition"
                style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}>
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Link>
              <Link to="/dashboard/vcard/qr"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold hover:border-brand-500 hover:text-brand-500 fast-transition"
                style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}>
                <QrCode className="w-3.5 h-3.5" /> QR
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 rounded-xl" style={{ border: '2px dashed var(--surface-border)' }}>
            <LayoutDashboard className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--surface-text-2)', opacity: 0.5 }} />
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--surface-text-2)' }}>No vCard yet</p>
            <p className="text-xs mb-4" style={{ color: 'var(--surface-text-2)', opacity: 0.8 }}>Create your digital business card</p>
            <Link to="/dashboard/vcard/profile"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition">
              Create vCard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </GlassCard>

      {/* ── Stats row ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Eye,        label: 'Card Views',   value: stats?.viewCount ?? 0,            iconCls: 'bg-sky-500/10 text-sky-400',    link: null },
          { icon: Package,    label: 'Products',     value: stats?.productCount ?? 0,          iconCls: 'bg-orange-500/10 text-orange-400', link: '/dashboard/vcard/products' },
          { icon: Star,       label: 'Testimonials', value: stats?.testimonialCount ?? 0,      iconCls: 'bg-yellow-500/10 text-yellow-400', link: '/dashboard/vcard/testimonials' },
          { icon: CreditCard, label: 'Cards Used',   value: `${cardCount} / ${cardLimit}`,    iconCls: 'bg-violet-500/10 text-violet-400', link: '/dashboard/vcard/all' },
        ].map(({ icon: Icon, label, value, iconCls, link }, idx) => {
          const card = (
            <GlassCard {...fadeUp(0.1 + idx * 0.05)} hover className="p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${iconCls}`}>
                <Icon className="w-[18px] h-[18px]" />
              </div>
              <p className="text-xl font-black leading-tight" style={{ color: 'var(--surface-text)' }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--surface-text-2)' }}>{label}</p>
            </GlassCard>
          );
          return link
            ? <Link key={label} to={link}>{card}</Link>
            : <div key={label}>{card}</div>;
        })}
      </div>

      {/* ── Plan info + Quick actions ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Plan card */}
        <GlassCard {...fadeUp(0.3)} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>Active Plan</h3>
            <Link to="/dashboard/plans" className="text-xs font-semibold text-brand-500 hover:underline">Upgrade →</Link>
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
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
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

        {/* Quick actions */}
        <GlassCard {...fadeUp(0.36)} className="p-5">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--surface-text)' }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Edit Profile',  path: '/dashboard/vcard/profile',  icon: Pencil },
              { label: 'Add Product',   path: '/dashboard/vcard/products', icon: Package },
              { label: 'QR Code',       path: '/dashboard/vcard/qr',       icon: QrCode },
              { label: 'Upgrade Plan',  path: '/dashboard/plans',          icon: Zap },
            ].map(({ label, path, icon: Icon }) => (
              <Link key={path} to={path}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-gradient-to-r hover:from-brand-600 hover:to-brand-700 hover:text-white hover:border-transparent fast-transition"
                style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default Dashboard;
