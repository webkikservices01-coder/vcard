import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, CreditCard, Eye, LifeBuoy, TrendingUp, Activity } from 'lucide-react';

const API = 'https://vcard-backend-uuq6.onrender.com/api/admin';
const h = () => ({ 'x-auth-token': localStorage.getItem('token') });

const Stat = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</span>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <p className="text-3xl font-black text-white">{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </div>
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

  if (loading) return <div className="text-gray-500 text-sm p-8 text-center">Loading...</div>;

  const planMap = {};
  stats.planCounts?.forEach(p => { planMap[p._id] = p.count; });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-black text-white">Platform Overview</h1>
        <p className="text-sm text-gray-500">Real-time stats across all users and cards</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Users"    value={stats.totalUsers}     icon={Users}      color="bg-blue-500/20 text-blue-400"   sub={`${stats.activeUsers} active`} />
        <Stat label="Total Cards"    value={stats.totalCards}     icon={Activity}   color="bg-green-500/20 text-green-400" sub="published cards" />
        <Stat label="Total Views"    value={(stats.totalViews||0).toLocaleString()} icon={Eye} color="bg-purple-500/20 text-purple-400" sub="all-time" />
        <Stat label="Revenue"        value={`₹${(stats.totalRevenue||0).toLocaleString('en-IN')}`} icon={CreditCard} color="bg-yellow-500/20 text-yellow-400" sub={`${stats.totalTransactions} txns`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Stat label="Open Tickets"   value={stats.openTickets}    icon={LifeBuoy}   color="bg-red-500/20 text-red-400"     sub="needs attention" />
        <Stat label="Paid Users"     value={(stats.totalTransactions||0)} icon={TrendingUp} color="bg-emerald-500/20 text-emerald-400" sub="completed payments" />
      </div>

      {/* Plan breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Users by Plan</h3>
        <div className="space-y-2">
          {['Free Trial', 'DIGITAL CARD', 'SMART AI CARD', 'AI AGENT PRO'].map(plan => (
            <div key={plan} className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{plan}</span>
              <div className="flex items-center space-x-3">
                <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, ((planMap[plan] || 0) / (stats.totalUsers || 1)) * 100)}%` }} />
                </div>
                <span className="text-xs font-bold text-white w-6 text-right">{planMap[plan] || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top cards */}
      {cards.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white">Top Cards by Views</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {cards.map((c, i) => (
              <div key={c._id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-600 font-bold w-4">#{i+1}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.personalInfo?.name || 'Unnamed'}</p>
                    <p className="text-xs text-gray-500">/c/{c.username} · {c.userId?.plan || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-gray-400">
                  <Eye className="w-3 h-3" />
                  <span className="text-xs font-bold">{c.viewCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
