import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Eye, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL}/api/admin`;
const h = () => ({ 'x-auth-token': localStorage.getItem('token') });

const PLANS = ['Free Trial', 'DIGITAL CARD', 'SMART AI CARD', 'AI AGENT PRO'];
const planColor = { 'Free Trial': 'bg-gray-700 text-gray-300', 'DIGITAL CARD': 'bg-blue-900 text-blue-300', 'SMART AI CARD': 'bg-purple-900 text-purple-300', 'AI AGENT PRO': 'bg-green-900 text-green-300' };
const statusColor = { active: 'bg-green-900 text-green-300', inactive: 'bg-red-900 text-red-300' };

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editPlan, setEditPlan] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/users`, { headers: h(), params: { search, plan: planFilter, page } });
      setUsers(res.data.users);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [search, planFilter, page]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (user) => {
    setSelected(user);
    setEditPlan(user.plan);
    setEditStatus(user.status);
    try {
      const res = await axios.get(`${API}/users/${user._id}`, { headers: h() });
      setDetail(res.data);
    } catch { setDetail(null); }
  };

  const saveUser = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/users/${selected._id}`, { plan: editPlan, status: editStatus }, { headers: h() });
      toast.success('User updated!');
      setSelected(s => ({ ...s, plan: editPlan, status: editStatus }));
      load();
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-white">Users <span className="text-gray-500 font-normal text-base">({total})</span></h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or email..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600" />
        </div>
        <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
          <option value="">All Plans</option>
          {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Plan</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Views</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-600 text-sm">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-600 text-sm">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-white text-sm">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                    {u.card?.username && (
                      <a href={`/c/${u.card.username}`} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-gray-600 hover:text-gray-400 flex items-center space-x-1 mt-0.5">
                        <ExternalLink className="w-3 h-3" /><span>/c/{u.card.username}</span>
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${planColor[u.plan] || 'bg-gray-700 text-gray-300'}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor[u.status] || ''}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-400">{u.card?.viewCount || 0}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => openDetail(u)} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {pages > 1 && (
          <div className="px-5 py-3 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500">Page {page} of {pages}</span>
            <div className="flex space-x-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}
                className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 sticky top-0 bg-gray-900">
              <h3 className="font-bold text-white">{selected.name}</h3>
              <button onClick={() => { setSelected(null); setDetail(null); }} className="text-gray-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* User info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[['Email', selected.email], ['Phone', selected.phone || '—'], ['Joined', new Date(selected.createdAt).toLocaleDateString('en-IN')], ['Card Limit', selected.cardLimit]].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-gray-500 mb-0.5">{k}</p>
                    <p className="text-white font-medium">{v}</p>
                  </div>
                ))}
              </div>

              {/* Activity stats */}
              {detail && (
                <div className="grid grid-cols-4 gap-2">
                  {[['Products', detail.products], ['Portfolio', detail.portfolio], ['Testimonials', detail.testimonials], ['Gallery', detail.gallery]].map(([k, v]) => (
                    <div key={k} className="bg-gray-800 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-white">{v || 0}</p>
                      <p className="text-[10px] text-gray-500">{k}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent transactions */}
              {detail?.transactions?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Recent Transactions</p>
                  <div className="space-y-1.5">
                    {detail.transactions.map(t => (
                      <div key={t._id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-300">{t.plan}</span>
                        <span className="text-xs font-bold text-white">₹{t.amount}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${t.status === 'completed' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit plan & status */}
              <div className="border-t border-gray-800 pt-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Manage Account</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Plan</label>
                    <select value={editPlan} onChange={e => setEditPlan(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                      {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Status</label>
                    <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <button onClick={saveUser} disabled={saving}
                  className="w-full bg-white text-pink-600 font-bold py-2.5 rounded-xl text-sm hover:bg-gray-100 transition disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
