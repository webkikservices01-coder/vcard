import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';

const API = `${import.meta.env.VITE_API_URL}/api/admin`;
const h = () => ({ 'x-auth-token': localStorage.getItem('token') });
const statusStyle = {
  open: 'bg-red-500/15 text-red-400',
  'in-progress': 'bg-yellow-500/15 text-yellow-400',
  closed: 'bg-emerald-500/15 text-emerald-400',
};

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    axios.get(`${API}/support`, { headers: h(), params: { status: filter } })
      .then(r => { setTickets(r.data.tickets); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    await axios.put(`${API}/support/${id}`, { status }, { headers: h() });
    toast.success('Ticket updated');
    setTickets(ts => ts.map(t => t._id === id ? { ...t, status } : t));
    if (selected?._id === id) setSelected(s => ({ ...s, status }));
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black" style={{ color: 'var(--surface-text)' }}>
          Support Tickets <span className="font-normal text-base" style={{ color: 'var(--surface-text-2)' }}>({total})</span>
        </h1>
        <select
          value={filter} onChange={e => setFilter(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm outline-none fast-transition"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <GlassCard className="overflow-hidden">
        <div>
          {loading ? (
            <p className="text-center py-10 text-sm" style={{ color: 'var(--surface-text-2)' }}>Loading...</p>
          ) : tickets.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: 'var(--surface-text-2)' }}>No tickets found</p>
          ) : tickets.map((t, idx) => (
            <div
              key={t._id}
              className="px-5 py-4 flex items-start justify-between hover:bg-brand-500/5 fast-transition cursor-pointer"
              style={idx > 0 ? { borderTop: '1px solid var(--surface-border)' } : undefined}
              onClick={() => setSelected(t)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[t.status] || 'bg-gray-500/15 text-gray-400'}`}>{t.status}</span>
                  <span className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{t.category}</span>
                </div>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--surface-text)' }}>{t.subject}</p>
                <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{t.userId?.name} · {t.userId?.email} · {new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex items-center space-x-2 ml-3 shrink-0" onClick={e => e.stopPropagation()}>
                {t.status !== 'closed' && (
                  <Button
                    variant="themed" size="sm"
                    onClick={() => updateStatus(t._id, 'closed')}
                    className="!px-2.5 !py-1 !text-[10px] !min-h-0 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                  >
                    Close
                  </Button>
                )}
                {t.status === 'open' && (
                  <Button
                    variant="themed" size="sm"
                    onClick={() => updateStatus(t._id, 'in-progress')}
                    className="!px-2.5 !py-1 !text-[10px] !min-h-0 bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25"
                  >
                    In Progress
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Ticket detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-2xl w-full max-w-lg"
            >
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <h3 className="font-bold" style={{ color: 'var(--surface-text)' }}>{selected.subject}</h3>
                <IconButton variant="ghost" title="Close" onClick={() => setSelected(null)} className="hover:text-brand-500">
                  <X className="w-5 h-5" />
                </IconButton>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>From</p>
                    <p className="font-medium" style={{ color: 'var(--surface-text)' }}>{selected.userId?.name}</p>
                    <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{selected.userId?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>Category</p>
                    <p className="font-medium" style={{ color: 'var(--surface-text)' }}>{selected.category}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>Status</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusStyle[selected.status]}`}>{selected.status}</span>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>Date</p>
                    <p className="text-xs" style={{ color: 'var(--surface-text)' }}>{new Date(selected.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--surface-text-2)' }}>Message</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--surface-text)' }}>{selected.message}</p>
                </div>
                <div className="flex space-x-2">
                  {selected.status !== 'in-progress' && (
                    <Button
                      variant="themed" size="sm"
                      onClick={() => updateStatus(selected._id, 'in-progress')}
                      className="flex-1 bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25"
                    >
                      Mark In Progress
                    </Button>
                  )}
                  {selected.status !== 'closed' && (
                    <Button
                      variant="themed" size="sm"
                      onClick={() => updateStatus(selected._id, 'closed')}
                      className="flex-1 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                    >
                      Mark Closed
                    </Button>
                  )}
                  {selected.status !== 'open' && (
                    <Button
                      variant="themed" size="sm"
                      onClick={() => updateStatus(selected._id, 'open')}
                      className="flex-1 hover:bg-brand-500/10 hover:text-brand-500"
                      style={{ background: 'var(--surface-2)', color: 'var(--surface-text-2)' }}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSupport;
