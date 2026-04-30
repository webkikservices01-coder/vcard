import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api/admin';
const h = () => ({ 'x-auth-token': localStorage.getItem('token') });
const statusStyle = { completed: 'bg-green-900 text-green-300', pending: 'bg-yellow-900 text-yellow-300', failed: 'bg-red-900 text-red-300' };

const AdminTransactions = () => {
  const [txns, setTxns] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/transactions`, { headers: h(), params: { page, status: filter } })
      .then(r => { setTxns(r.data.transactions); setTotal(r.data.total); setPages(r.data.pages); })
      .finally(() => setLoading(false));
  }, [page, filter]);

  const totalRevenue = txns.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-white">Transactions <span className="text-gray-500 font-normal text-base">({total})</span></h1>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['User', 'Plan', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-600">Loading...</td></tr>
              ) : txns.map(t => (
                <tr key={t._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-white">{t.userId?.name || '—'}</p>
                    <p className="text-xs text-gray-500">{t.userId?.email || ''}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-300">{t.plan}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-white">₹{(t.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusStyle[t.status] || 'bg-gray-700 text-gray-300'}`}>{t.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="px-5 py-3 border-t border-gray-800 flex justify-between items-center">
            <span className="text-xs text-gray-500">Page {page} of {pages}</span>
            <div className="flex space-x-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="text-xs px-3 py-1.5 bg-gray-800 rounded-lg text-gray-300 disabled:opacity-30">Prev</button>
              <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages} className="text-xs px-3 py-1.5 bg-gray-800 rounded-lg text-gray-300 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;
