import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, CreditCard, Eye, LifeBuoy, TrendingUp, Activity } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp } from '../../utils/motion';

const API = `${import.meta.env.VITE_API_URL}/api/admin`;
const h = () => ({ 'x-auth-token': localStorage.getItem('token') });

const Stat = ({ label, value, sub, icon: Icon, color, delay }) => (
  <GlassCard {...fadeUp(delay)} hover className="p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>{label}</span>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <p className="text-3xl font-black" style={{ color: 'var(--surface-text)' }}>{value}</p>
    {sub && <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)' }}>{sub}</p>}
  </GlassCard>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/stats`, { headers: h() }),
      axios.get(`${API}/cards`, { headers: h() })
    ]).then(([s, c]) => { setStats(s.data); setCards(c.data.slice(0, 5)); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4 max-w-5xl">
      <div className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />)}
      </div>
    </div>
  );

  const planMap = {};
  stats.planCounts?.forEach(p => { planMap[p._id] = p.count; });

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Hero ─────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="relative bg-gradient-to-br from-brand-600 to-rose-600 rounded-2xl px-6 py-5 overflow-hidden">
        <MeshBackground className="opacity-60" />
        <div className="relative">
          <p className="text-xs text-white/60 mb-1 uppercase tracking-wider">Admin</p>
          <h1 className="text-2xl font-black text-white leading-tight">Platform Overview</h1>
          <p className="text-sm text-white/70 mt-1">Real-time stats across all users and cards</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Users"    value={stats.totalUsers}     icon={Users}      color="bg-blue-500/10 text-blue-400"       sub={`${stats.activeUsers} active`} delay={0.06} />
        <Stat label="Total Cards"    value={stats.totalCards}     icon={Activity}   color="bg-emerald-500/10 text-emerald-400" sub="published cards" delay={0.1} />
        <Stat label="Total Views"    value={(stats.totalViews||0).toLocaleString()} icon={Eye} color="bg-purple-500/10 text-purple-400" sub="all-time" delay={0.14} />
        <Stat label="Revenue"        value={`₹${(stats.totalRevenue||0).toLocaleString('en-IN')}`} icon={CreditCard} color="bg-yellow-500/10 text-yellow-400" sub={`${stats.totalTransactions} txns`} delay={0.18} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Stat label="Open Tickets"   value={stats.openTickets}    icon={LifeBuoy}   color="bg-red-500/10 text-red-400"         sub="needs attention" delay={0.22} />
        <Stat label="Paid Users"     value={(stats.totalTransactions||0)} icon={TrendingUp} color="bg-emerald-500/10 text-emerald-400" sub="completed payments" delay={0.26} />
      </div>

      {/* Plan breakdown */}
      <GlassCard {...fadeUp(0.3)} className="p-5">
        <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--surface-text)' }}>Users by Plan</h3>
        <div className="space-y-2">
          {['Free Trial', 'DIGITAL CARD', 'SMART AI CARD', 'AI AGENT PRO'].map(plan => (
            <div key={plan} className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{plan}</span>
              <div className="flex items-center space-x-3">
                <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-700"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((planMap[plan] || 0) / (stats.totalUsers || 1)) * 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="text-xs font-bold w-6 text-right" style={{ color: 'var(--surface-text)' }}>{planMap[plan] || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Top cards */}
      {cards.length > 0 && (
        <GlassCard {...fadeUp(0.36)} className="overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>Top Cards by Views</h3>
          </div>
          <div>
            {cards.map((c, i) => (
              <div
                key={c._id}
                className="px-5 py-3 flex items-center justify-between hover:bg-brand-500/5 fast-transition"
                style={i > 0 ? { borderTop: '1px solid var(--surface-border)' } : undefined}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold w-4" style={{ color: 'var(--surface-text-2)' }}>#{i+1}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--surface-text)' }}>{c.personalInfo?.name || 'Unnamed'}</p>
                    <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>/c/{c.username} · {c.userId?.plan || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1" style={{ color: 'var(--surface-text-2)' }}>
                  <Eye className="w-3 h-3" />
                  <span className="text-xs font-bold">{c.viewCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default AdminDashboard;
