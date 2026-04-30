import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Calendar, Clock, CreditCard, ShoppingBag, Star, Eye, ArrowRight } from 'lucide-react';
import axios from 'axios';

const StatCard = ({ icon: Icon, label, value, sub, link, linkText }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start space-x-4 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      {link && (
        <Link to={link} className="inline-flex items-center space-x-1 text-xs font-semibold text-black hover:underline mt-2">
          <span>{linkText || 'View'}</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://vcard-backend-uuq6.onrender.com/api/stats', {
          headers: { 'x-auth-token': token }
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  const expiryDisplay = stats?.planExpiry
    ? new Date(stats.planExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Welcome bar */}
      <div className="bg-black text-white rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Welcome back, {stats?.user?.name?.split(' ')[0] || 'User'} 👋</h2>
          <p className="text-sm text-gray-300 mt-0.5">Here's an overview of your digital card.</p>
        </div>
        <Link
          to="/dashboard/vcard/profile"
          className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          Manage vCard →
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          icon={DollarSign}
          label="Current Plan"
          value={stats?.currentPlan || 'Free Trial'}
          link="/dashboard/plans"
          linkText="Upgrade"
        />
        <StatCard
          icon={Calendar}
          label="Plan Expiry"
          value={expiryDisplay}
          sub={stats?.planExpiry ? `${stats.remainingDays} days remaining` : 'No active plan'}
        />
        <StatCard
          icon={Clock}
          label="Remaining Days"
          value={stats?.remainingDays ?? 'N/A'}
          sub="Days until renewal"
        />
        <StatCard
          icon={CreditCard}
          label="My vCards"
          value={stats?.vcardCount ?? 0}
          link="/dashboard/vcard/all"
          linkText="View Cards"
        />
        <StatCard
          icon={ShoppingBag}
          label="Products & Services"
          value={stats?.productCount ?? 0}
          link="/dashboard/vcard/products"
          linkText="Manage"
        />
        <StatCard
          icon={Star}
          label="Testimonials"
          value={stats?.testimonialCount ?? 0}
          link="/dashboard/vcard/testimonials"
          linkText="View"
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Edit Profile', path: '/dashboard/vcard/profile' },
            { label: 'Add Product', path: '/dashboard/vcard/products' },
            { label: 'View QR Code', path: '/dashboard/vcard/qr' },
            { label: 'Upgrade Plan', path: '/dashboard/plans' },
          ].map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className="flex items-center justify-center text-center text-sm font-medium text-gray-700 border border-gray-200 rounded-lg p-3 hover:bg-black hover:text-white hover:border-black transition-all"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
