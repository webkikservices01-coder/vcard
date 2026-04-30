import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, X, LifeBuoy } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'https://vcard-backend-uuq6.onrender.com/api/support';
const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });

const statusStyles = {
  'open':        'bg-black text-white',
  'in-progress': 'bg-gray-700 text-white',
  'resolved':    'bg-gray-200 text-gray-700',
  'closed':      'bg-gray-100 text-gray-500',
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Support</h2>
          <p className="text-sm text-gray-500">Submit and track your support requests</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="Search tickets..." />
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center space-x-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            <Plus className="w-4 h-4" /><span>New Ticket</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <LifeBuoy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No support tickets yet.</p>
            <button onClick={() => setModalOpen(true)} className="mt-4 bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800">Create Ticket</button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Ticket</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Category</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(ticket => (
                <tr key={ticket._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">{ticket.subject}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">#{ticket._id.slice(-6).toUpperCase()}</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell"><span className="text-sm text-gray-600">{ticket.category}</span></td>
                  <td className="px-5 py-4 hidden md:table-cell"><span className="text-sm text-gray-600">{formatDate(ticket.createdAt)}</span></td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[ticket.status] || 'bg-gray-100 text-gray-600'}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      <button onClick={() => handleDelete(ticket._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold">Create Support Ticket</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="Brief description of your issue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none bg-white">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={5} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none resize-none" placeholder="Describe your issue in detail..." />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 pt-0">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-60">{saving ? 'Submitting...' : 'Submit Ticket'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
