import { useEffect, useState } from 'react';
import axios from 'axios';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';

const API = `${import.meta.env.VITE_API_URL}/api/admin`;
const h = () => ({ 'x-auth-token': localStorage.getItem('token') });
const statusStyle = {
  completed: 'bg-emerald-500/15 text-emerald-400',
  pending:   'bg-yellow-500/15 text-yellow-400',
  failed:    'bg-red-500/15 text-red-400',
};

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
        <h1 className="text-xl font-black" style={{ color: 'var(--surface-text)' }}>
          Transactions <span className="font-normal text-base" style={{ color: 'var(--surface-text-2)' }}>({total})</span>
        </h1>
        <select
          value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="rounded-xl px-3 py-2 text-sm outline-none fast-transition"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                {['User', 'Plan', 'Amount', 'Status', 'Date'].map(hd => (
                  <th key={hd} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>{hd}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10" style={{ color: 'var(--surface-text-2)' }}>Loading...</td></tr>
              ) : txns.map((t, idx) => (
                <tr
                  key={t._id}
                  className="hover:bg-brand-500/5 fast-transition"
                  style={idx > 0 ? { borderTop: '1px solid var(--surface-border)' } : undefined}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold" style={{ color: 'var(--surface-text)' }}>{t.userId?.name || '—'}</p>
                    <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{t.userId?.email || ''}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--surface-text-2)' }}>{t.plan}</td>
                  <td className="px-5 py-3.5 text-sm font-bold" style={{ color: 'var(--surface-text)' }}>₹{(t.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusStyle[t.status] || 'bg-gray-500/15 text-gray-400'}`}>{t.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--surface-text-2)' }}>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="px-5 py-3 flex justify-between items-center" style={{ borderTop: '1px solid var(--surface-border)' }}>
            <span className="text-xs" style={{ color: 'var(--surface-text-2)' }}>Page {page} of {pages}</span>
            <div className="flex space-x-2">
              <Button
                variant="secondary" size="sm"
                onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              >
                Prev
              </Button>
              <Button
                variant="secondary" size="sm"
                onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default AdminTransactions;
