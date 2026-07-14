import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';

const API = `${import.meta.env.VITE_API_URL}/api/admin`;
const h = () => ({ 'x-auth-token': localStorage.getItem('token') });

const PLANS = ['Free Trial', 'DIGITAL CARD', 'SMART AI CARD', 'AI AGENT PRO'];
const planColor = {
  'Free Trial':    'bg-gray-500/15 text-gray-400',
  'DIGITAL CARD':  'bg-blue-500/15 text-blue-400',
  'SMART AI CARD': 'bg-purple-500/15 text-purple-400',
  'AI AGENT PRO':  'bg-emerald-500/15 text-emerald-400',
};
const statusColor = { active: 'bg-emerald-500/15 text-emerald-400', inactive: 'bg-red-500/15 text-red-400' };

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
        <h1 className="text-xl font-black" style={{ color: 'var(--surface-text)' }}>
          Users <span className="font-normal text-base" style={{ color: 'var(--surface-text-2)' }}>({total})</span>
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surface-text-2)' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or email..."
            className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
          />
        </div>
        <select
          value={planFilter}
          onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
          className="rounded-xl px-3 py-2.5 text-sm outline-none fast-transition"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
        >
          <option value="">All Plans</option>
          {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>Plan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>Views</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-sm" style={{ color: 'var(--surface-text-2)' }}>Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-sm" style={{ color: 'var(--surface-text-2)' }}>No users found</td></tr>
              ) : users.map((u, idx) => (
                <tr
                  key={u._id}
                  className="hover:bg-brand-500/5 fast-transition"
                  style={idx > 0 ? { borderTop: '1px solid var(--surface-border)' } : undefined}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-sm" style={{ color: 'var(--surface-text)' }}>{u.name}</p>
                    <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{u.email}</p>
                    {u.card?.username && (
                      <a
                        href={`/c/${u.card.username}`} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] hover:text-brand-500 flex items-center space-x-1 mt-0.5 fast-transition"
                        style={{ color: 'var(--surface-text-2)' }}
                      >
                        <ExternalLink className="w-3 h-3" /><span>/c/{u.card.username}</span>
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${planColor[u.plan] || 'bg-gray-500/15 text-gray-400'}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor[u.status] || ''}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--surface-text-2)' }}>{u.card?.viewCount || 0}</td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--surface-text-2)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => openDetail(u)}
                      className="p-1.5 rounded-lg hover:bg-brand-500/10 hover:text-brand-500 fast-transition"
                      style={{ color: 'var(--surface-text-2)' }}
                    >
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
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--surface-border)' }}>
            <span className="text-xs" style={{ color: 'var(--surface-text-2)' }}>Page {page} of {pages}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-brand-500/10 hover:text-brand-500 disabled:opacity-30 fast-transition"
                style={{ color: 'var(--surface-text-2)' }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}
                className="p-1.5 rounded-lg hover:bg-brand-500/10 hover:text-brand-500 disabled:opacity-30 fast-transition"
                style={{ color: 'var(--surface-text-2)' }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 py-4 sticky top-0 glass" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <h3 className="font-bold" style={{ color: 'var(--surface-text)' }}>{selected.name}</h3>
                <button
                  onClick={() => { setSelected(null); setDetail(null); }}
                  className="p-1 rounded-lg hover:bg-brand-500/10 hover:text-brand-500 fast-transition"
                  style={{ color: 'var(--surface-text-2)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-5">
                {/* User info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[['Email', selected.email], ['Phone', selected.phone || '—'], ['Joined', new Date(selected.createdAt).toLocaleDateString('en-IN')], ['Card Limit', selected.cardLimit]].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs mb-0.5" style={{ color: 'var(--surface-text-2)' }}>{k}</p>
                      <p className="font-medium" style={{ color: 'var(--surface-text)' }}>{v}</p>
                    </div>
                  ))}
                </div>

                {/* Activity stats */}
                {detail && (
                  <div className="grid grid-cols-4 gap-2">
                    {[['Products', detail.products], ['Portfolio', detail.portfolio], ['Testimonials', detail.testimonials], ['Gallery', detail.gallery]].map(([k, v]) => (
                      <div key={k} className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-2)' }}>
                        <p className="text-lg font-black" style={{ color: 'var(--surface-text)' }}>{v || 0}</p>
                        <p className="text-[10px]" style={{ color: 'var(--surface-text-2)' }}>{k}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent transactions */}
                {detail?.transactions?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--surface-text-2)' }}>Recent Transactions</p>
                    <div className="space-y-1.5">
                      {detail.transactions.map(t => (
                        <div key={t._id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'var(--surface-2)' }}>
                          <span className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{t.plan}</span>
                          <span className="text-xs font-bold" style={{ color: 'var(--surface-text)' }}>₹{t.amount}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${t.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{t.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Edit plan & status */}
                <div className="pt-4 space-y-3" style={{ borderTop: '1px solid var(--surface-border)' }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>Manage Account</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--surface-text-2)' }}>Plan</label>
                      <select
                        value={editPlan} onChange={e => setEditPlan(e.target.value)}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none fast-transition"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                      >
                        {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--surface-text-2)' }}>Status</label>
                      <select
                        value={editStatus} onChange={e => setEditStatus(e.target.value)}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none fast-transition"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <GradientButton onClick={saveUser} disabled={saving}>
                    {saving && (
                      <motion.span
                        className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </GradientButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
