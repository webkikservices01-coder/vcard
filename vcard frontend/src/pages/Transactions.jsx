import React, { useState, useEffect } from 'react';
import { Receipt, Download, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
    completed: 'bg-pink-600 text-white',
    pending:   'bg-gray-200 text-gray-700',
    failed:    'bg-gray-100 text-gray-500 line-through',
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Transactions</h2>
        <p className="text-sm text-gray-500">Your billing and payment history</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No transactions yet.</p>
            <a href="/dashboard/plans" className="inline-block mt-4 bg-pink-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-pink-700">View Plans</a>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Plan</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Billing</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(txn => (
                <tr key={txn._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">{txn.plan}</p>
                    <p className="text-xs text-gray-400 font-mono">#{txn._id.slice(-6).toUpperCase()}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold text-gray-900">₹{txn.amount?.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-sm text-gray-600">{txn.billingType}</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-sm text-gray-600">{formatDate(txn.createdAt)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[txn.status] || 'bg-gray-100 text-gray-600'}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {txn.status === 'completed' ? (
                      <button
                        onClick={() => handleDownloadInvoice(txn)}
                        disabled={downloadingId === txn._id}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 disabled:opacity-50 transition-colors"
                      >
                        {downloadingId === txn._id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Download className="w-3.5 h-3.5" />}
                        <span>{downloadingId === txn._id ? 'Downloading...' : 'Download'}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Transactions;
