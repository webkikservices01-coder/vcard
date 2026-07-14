import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, X, LifeBuoy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import MeshBackground from '../components/ui/MeshBackground';
import { fadeUp } from '../utils/motion';

const API = `${import.meta.env.VITE_API_URL}/api/support`;
const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });

const statusStyles = {
  'open':        'bg-gradient-to-r from-brand-600 to-brand-700 text-white',
  'in-progress': 'bg-gray-700 text-white',
  'resolved':    '',
  'closed':      '',
};
const statusInlineStyle = {
  'open':        undefined,
  'in-progress': undefined,
  'resolved':    { background: 'var(--surface-2)', color: 'var(--surface-text-2)' },
  'closed':      { background: 'var(--surface-2)', color: 'var(--surface-text-2)', opacity: 0.7 },
};

const categories = ['General', 'Technical', 'Billing', 'Feature Request', 'Bug Report'];

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'General', message: '' });
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try { const res = await axios.get(API, { headers: headers() }); setTickets(res.data); }
    catch { toast.error('Failed to load tickets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!form.subject || !form.message) { toast.error('Subject and message are required'); return; }
    setSaving(true);
    try {
      await axios.post(API, form, { headers: headers() });
      toast.success('Ticket submitted successfully');
      setModalOpen(false);
      setForm({ subject: '', category: 'General', message: '' });
      fetch();
    } catch { toast.error('Failed to create ticket'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    try { await axios.delete(`${API}/${id}`, { headers: headers() }); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = tickets.filter(t =>
    t.subject?.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-5">
      <div className="relative rounded-2xl overflow-hidden px-1 py-2">
        <MeshBackground className="opacity-40" />
        <motion.div {...fadeUp(0)} className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--surface-text)' }}>Support</h2>
            <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Submit and track your support requests</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surface-text-2)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                placeholder="Search tickets..."
              />
            </div>
            <GradientButton onClick={() => setModalOpen(true)} className="!w-auto px-4 py-2">
              <Plus className="w-4 h-4" /><span>New Ticket</span>
            </GradientButton>
          </div>
        </motion.div>
      </div>

      <GlassCard {...fadeUp(0.08)} className="overflow-hidden">
        {loading ? <div className="p-8 text-center text-sm" style={{ color: 'var(--surface-text-2)' }}>Loading...</div>
        : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <LifeBuoy className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--surface-text-2)', opacity: 0.4 }} />
            <p className="text-sm mb-4" style={{ color: 'var(--surface-text-2)' }}>No support tickets yet.</p>
            <button onClick={() => setModalOpen(true)} className="bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90 fast-transition">
              Create Ticket
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--surface-border)' }}>
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase" style={{ color: 'var(--surface-text-2)' }}>Ticket</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase hidden sm:table-cell" style={{ color: 'var(--surface-text-2)' }}>Category</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase hidden md:table-cell" style={{ color: 'var(--surface-text-2)' }}>Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase" style={{ color: 'var(--surface-text-2)' }}>Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase" style={{ color: 'var(--surface-text-2)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ticket => (
                <tr key={ticket._id} className="hover:bg-[var(--surface-2)] fast-transition" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium" style={{ color: 'var(--surface-text)' }}>{ticket.subject}</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--surface-text-2)' }}>#{ticket._id.slice(-6).toUpperCase()}</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell"><span className="text-sm" style={{ color: 'var(--surface-text-2)' }}>{ticket.category}</span></td>
                  <td className="px-5 py-4 hidden md:table-cell"><span className="text-sm" style={{ color: 'var(--surface-text-2)' }}>{formatDate(ticket.createdAt)}</span></td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[ticket.status] || ''}`}
                      style={statusInlineStyle[ticket.status] || { background: 'var(--surface-2)', color: 'var(--surface-text-2)' }}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      <button onClick={() => handleDelete(ticket._id)} className="p-2 hover:text-red-600 hover:bg-red-500/10 rounded-lg fast-transition" style={{ color: 'var(--surface-text-2)' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard className="w-full max-w-md">
                <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--surface-text)' }}>Create Support Ticket</h3>
                  <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-[var(--surface-2)] rounded-lg fast-transition" style={{ color: 'var(--surface-text-2)' }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Subject *</label>
                    <input
                      value={form.subject}
                      onChange={e => setForm({...form, subject: e.target.value})}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Message *</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                      rows={5}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-400 resize-none fast-transition"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                      placeholder="Describe your issue in detail..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 p-6 pt-0">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium rounded-lg hover:border-brand-500 hover:text-brand-500 fast-transition"
                    style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                  >
                    Cancel
                  </button>
                  <GradientButton onClick={handleCreate} disabled={saving} className="!w-auto px-6">
                    <span>{saving ? 'Submitting...' : 'Submit Ticket'}</span>
                  </GradientButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Support;
