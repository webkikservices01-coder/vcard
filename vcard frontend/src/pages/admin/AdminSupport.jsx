import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL}/api/admin`;
const h = () => ({ 'x-auth-token': localStorage.getItem('token') });
const statusStyle = { open: 'bg-red-900 text-red-300', 'in-progress': 'bg-yellow-900 text-yellow-300', closed: 'bg-green-900 text-green-300' };

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
        <h1 className="text-xl font-black text-white">Support Tickets <span className="text-gray-500 font-normal text-base">({total})</span></h1>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="divide-y divide-gray-800">
          {loading ? (
            <p className="text-center py-10 text-gray-600 text-sm">Loading...</p>
          ) : tickets.length === 0 ? (
            <p className="text-center py-10 text-gray-600 text-sm">No tickets found</p>
          ) : tickets.map(t => (
            <div key={t._id} className="px-5 py-4 flex items-start justify-between hover:bg-gray-800/40 transition-colors cursor-pointer" onClick={() => setSelected(t)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[t.status] || 'bg-gray-700 text-gray-300'}`}>{t.status}</span>
                  <span className="text-xs text-gray-500">{t.category}</span>
                </div>
                <p className="text-sm font-semibold text-white truncate">{t.subject}</p>
                <p className="text-xs text-gray-500">{t.userId?.name} · {t.userId?.email} · {new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex items-center space-x-2 ml-3 shrink-0" onClick={e => e.stopPropagation()}>
                {t.status !== 'closed' && (
                  <button onClick={() => updateStatus(t._id, 'closed')}
                    className="text-[10px] px-2.5 py-1 bg-green-900 text-green-300 rounded-lg font-bold hover:bg-green-800 transition">
                    Close
                  </button>
                )}
                {t.status === 'open' && (
                  <button onClick={() => updateStatus(t._id, 'in-progress')}
                    className="text-[10px] px-2.5 py-1 bg-yellow-900 text-yellow-300 rounded-lg font-bold hover:bg-yellow-800 transition">
                    In Progress
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h3 className="font-bold text-white">{selected.subject}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-500">From</p><p className="text-white font-medium">{selected.userId?.name}</p><p className="text-xs text-gray-500">{selected.userId?.email}</p></div>
                <div><p className="text-xs text-gray-500">Category</p><p className="text-white font-medium">{selected.category}</p></div>
                <div><p className="text-xs text-gray-500">Status</p><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusStyle[selected.status]}`}>{selected.status}</span></div>
                <div><p className="text-xs text-gray-500">Date</p><p className="text-white text-xs">{new Date(selected.createdAt).toLocaleDateString('en-IN')}</p></div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Message</p>
                <p className="text-sm text-gray-200 leading-relaxed">{selected.message}</p>
              </div>
              <div className="flex space-x-2">
                {selected.status !== 'in-progress' && <button onClick={() => updateStatus(selected._id, 'in-progress')} className="flex-1 py-2 bg-yellow-900 text-yellow-300 text-xs font-bold rounded-xl hover:bg-yellow-800 transition">Mark In Progress</button>}
                {selected.status !== 'closed' && <button onClick={() => updateStatus(selected._id, 'closed')} className="flex-1 py-2 bg-green-900 text-green-300 text-xs font-bold rounded-xl hover:bg-green-800 transition">Mark Closed</button>}
                {selected.status !== 'open' && <button onClick={() => updateStatus(selected._id, 'open')} className="flex-1 py-2 bg-gray-800 text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-700 transition">Reopen</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
