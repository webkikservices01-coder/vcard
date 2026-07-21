import { useState, useEffect } from 'react';
import { Receipt, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import MeshBackground from '../components/ui/MeshBackground';
import { fadeUp } from '../utils/motion';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/transactions`, {
          headers: { 'x-auth-token': token }
        });
        setTransactions(res.data);
      } catch { toast.error('Failed to load transactions'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleDownloadInvoice = async (txn) => {
    setDownloadingId(txn._id);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/transactions/${txn._id}/invoice`, {
        headers: { 'x-auth-token': token },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${txn.invoiceNumber || txn._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download invoice');
    } finally {
      setDownloadingId(null);
    }
  };

  const statusStyles = {
    completed: 'bg-gradient-to-r from-brand-600 to-brand-700 text-white',
    pending:   '',
    failed:    'line-through',
  };
  const statusInlineStyle = {
    completed: undefined,
    pending:   { background: 'var(--surface-2)', color: 'var(--surface-text-2)' },
    failed:    { background: 'var(--surface-2)', color: 'var(--surface-text-2)', opacity: 0.7 },
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-5">
      <div className="relative rounded-2xl overflow-hidden px-1 py-2">
        <MeshBackground className="opacity-40" />
        <motion.div {...fadeUp(0)} className="relative">
          <h2 className="text-xl font-bold" style={{ color: 'var(--surface-text)' }}>Transactions</h2>
          <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Your billing and payment history</p>
        </motion.div>
      </div>

      <GlassCard {...fadeUp(0.08)} className="overflow-hidden">
        {loading ? <div className="p-8 text-center text-sm" style={{ color: 'var(--surface-text-2)' }}>Loading...</div>
        : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--surface-text-2)', opacity: 0.4 }} />
            <p className="text-sm mb-4" style={{ color: 'var(--surface-text-2)' }}>No transactions yet.</p>
            <a href="/dashboard/plans" className="inline-block bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90 fast-transition">
              View Plans
            </a>
          </div>
        ) : (
          <table className="w-full">
            <thead style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--surface-border)' }}>
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase" style={{ color: 'var(--surface-text-2)' }}>Plan</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase" style={{ color: 'var(--surface-text-2)' }}>Amount</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase hidden sm:table-cell" style={{ color: 'var(--surface-text-2)' }}>Billing</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase hidden md:table-cell" style={{ color: 'var(--surface-text-2)' }}>Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase" style={{ color: 'var(--surface-text-2)' }}>Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase" style={{ color: 'var(--surface-text-2)' }}>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(txn => (
                <tr key={txn._id} className="hover:bg-[var(--surface-2)] fast-transition" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium" style={{ color: 'var(--surface-text)' }}>{txn.plan}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--surface-text-2)' }}>#{txn._id.slice(-6).toUpperCase()}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>₹{txn.amount?.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-sm" style={{ color: 'var(--surface-text-2)' }}>{txn.billingType}</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-sm" style={{ color: 'var(--surface-text-2)' }}>{formatDate(txn.createdAt)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[txn.status] || ''}`}
                      style={statusInlineStyle[txn.status] || { background: 'var(--surface-2)', color: 'var(--surface-text-2)' }}
                    >
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {txn.status === 'completed' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadInvoice(txn)}
                        loading={downloadingId === txn._id}
                        leftIcon={<Download className="w-3.5 h-3.5" />}
                      >
                        {downloadingId === txn._id ? 'Downloading...' : 'Download'}
                      </Button>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--surface-text-2)', opacity: 0.4 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </div>
  );
};

export default Transactions;
