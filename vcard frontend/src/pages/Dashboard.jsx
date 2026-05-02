import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, ArrowRight, ExternalLink, Pencil, QrCode,
  Zap, Package, Star, CreditCard, Share2, LayoutDashboard
} from 'lucide-react';
import axios from 'axios';

const PLAN_COLORS = {
  'Free Trial':    { badge: 'bg-gray-100 text-gray-600',   bar: 'bg-gray-400',   icon: 'bg-gray-100 text-gray-500' },
  'DIGITAL CARD':  { badge: 'bg-blue-50 text-blue-700',    bar: 'bg-blue-500',   icon: 'bg-blue-50 text-blue-600' },
  'SMART AI CARD': { badge: 'bg-purple-50 text-purple-700',bar: 'bg-purple-500', icon: 'bg-purple-50 text-purple-600' },
  'AI AGENT PRO':  { badge: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500', icon: 'bg-emerald-50 text-emerald-600' },
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
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div className="space-y-4 max-w-4xl">
      <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
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
      <div className="relative bg-black rounded-2xl px-6 py-5 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/[0.04] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-32 w-24 h-24 bg-white/[0.03] rounded-full pointer-events-none" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Dashboard</p>
            <h1 className="text-2xl font-black text-white leading-tight">Hey, {firstName} 👋</h1>
            <div className="flex items-center gap-2 mt-2.5">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${pc.badge}`}>{plan}</span>
              {daysLeft != null
                ? <span className="text-xs text-gray-500">{daysLeft} days left</span>
                : <span className="text-xs text-gray-600">No active plan</span>
              }
            </div>
          </div>
          {cardSlug && (
            <a href={`/c/${cardSlug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition shrink-0">
              <Eye className="w-4 h-4" />
              <span>View Live Card</span>
            </a>
          )}
        </div>
      </div>

      {/* ── My vCard card ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">My vCard</h2>
          <Link to="/dashboard/vcard/all" className="text-xs text-gray-400 hover:text-black flex items-center gap-1 transition">
            All Cards <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {cardSlug ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar + info */}
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center text-white text-xl font-black shrink-0 overflow-hidden border border-gray-100">
                {stats.cardProfilePic
                  ? <img src={stats.cardProfilePic} alt="" className="w-full h-full object-cover" />
                  : (stats.cardName?.[0]?.toUpperCase() || 'V')
                }
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-gray-900 truncate">{stats.cardName || 'Unnamed Card'}</p>
                <p className="text-sm text-gray-500 truncate">{stats.cardDesignation || '—'}</p>
                <a href={`/c/${cardSlug}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-black mt-0.5 transition">
                  /c/{cardSlug} <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
              <a href={`/c/${cardSlug}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition">
                <Eye className="w-3.5 h-3.5" /> View
              </a>
              <Link to="/dashboard/vcard/profile"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:border-black hover:text-black transition">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Link>
              <Link to="/dashboard/vcard/qr"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:border-black hover:text-black transition">
                <QrCode className="w-3.5 h-3.5" /> QR
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
            <LayoutDashboard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500 mb-1">No vCard yet</p>
            <p className="text-xs text-gray-400 mb-4">Create your digital business card</p>
            <Link to="/dashboard/vcard/profile"
              className="inline-flex items-center gap-2 bg-black text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition">
              Create vCard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* ── Stats row ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Eye,        label: 'Card Views',   value: stats?.viewCount ?? 0,            iconCls: 'bg-sky-50 text-sky-600',    link: null },
          { icon: Package,    label: 'Products',     value: stats?.productCount ?? 0,          iconCls: 'bg-orange-50 text-orange-600', link: '/dashboard/vcard/products' },
          { icon: Star,       label: 'Testimonials', value: stats?.testimonialCount ?? 0,      iconCls: 'bg-yellow-50 text-yellow-600', link: '/dashboard/vcard/testimonials' },
          { icon: CreditCard, label: 'Cards Used',   value: `${cardCount} / ${cardLimit}`,    iconCls: 'bg-violet-50 text-violet-600', link: '/dashboard/vcard/all' },
        ].map(({ icon: Icon, label, value, iconCls, link }) => {
          const card = (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-sm transition-shadow cursor-pointer">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${iconCls}`}>
                <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              </div>
              <p className="text-xl font-black text-gray-900 leading-tight">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          );
          return link
            ? <Link key={label} to={link}>{card}</Link>
            : <div key={label}>{card}</div>;
        })}
      </div>

      {/* ── Plan info + Quick actions ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Plan card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Active Plan</h3>
            <Link to="/dashboard/plans" className="text-xs font-semibold text-black hover:underline">Upgrade →</Link>
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${pc.icon}`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{plan}</p>
              <p className="text-xs text-gray-400">
                {daysLeft != null ? `${daysLeft} days remaining` : 'No expiry set'}
              </p>
            </div>
          </div>

          {daysLeft != null && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Validity</span>
                <span>{daysLeft} / 365 days</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${pc.bar}`} style={{ width: `${daysBar}%` }} />
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Cards</p>
              <p className="text-sm font-bold text-gray-800">{cardCount} <span className="text-gray-400 font-normal">/ {cardLimit} allowed</span></p>
            </div>
            {stats?.planExpiry && (
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Renews</p>
                <p className="text-xs text-gray-600 font-medium">
                  {new Date(stats.planExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Edit Profile',  path: '/dashboard/vcard/profile',  icon: Pencil },
              { label: 'Add Product',   path: '/dashboard/vcard/products', icon: Package },
              { label: 'QR Code',       path: '/dashboard/vcard/qr',       icon: QrCode },
              { label: 'Upgrade Plan',  path: '/dashboard/plans',          icon: Zap },
            ].map(({ label, path, icon: Icon }) => (
              <Link key={path} to={path}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
