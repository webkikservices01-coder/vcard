import { Fragment, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2, RefreshCw, Send } from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL}/api/card-orders/admin`;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

const STATUS_TONE = {
  PAID: 'bg-emerald-500/15 text-emerald-500',
  PENDING_PAYMENT: 'bg-amber-500/15 text-amber-500',
  EXPIRED: 'bg-slate-500/15 text-slate-400',
  CANCELLED: 'bg-slate-500/15 text-slate-400',
  FAILED: 'bg-red-500/15 text-red-500',
};
const DELIVERY_TONE = {
  SENT: 'text-emerald-500',
  DELIVERED: 'text-emerald-500',
  READ: 'text-emerald-500',
  FAILED: 'text-red-500',
  PENDING: 'text-amber-500',
  SKIPPED: 'text-sky-500',
};

// Admin: every "Get my card" order, its payment and WhatsApp/email delivery, with a Resend button.
const AdminCardOrders = () => {
  const [rows, setRows] = useState(null);
  const [status, setStatus] = useState('');
  const [delivery, setDelivery] = useState('');
  const [busy, setBusy] = useState('');
  const [open, setOpen] = useState('');

  const load = useCallback(async () => {
    const { data } = await axios.get(`${API}/list`, { headers: headers(), params: { status: status || undefined, delivery: delivery || undefined } });
    setRows(data);
  }, [status, delivery]);

  useEffect(() => {
    // load() is async: its setState calls run after the request, not during the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch(() => toast.error('Could not load orders'));
  }, [load]);

  const resend = async (id) => {
    setBusy(id);
    try {
      await axios.post(`${API}/${id}/resend-card`, {}, { headers: headers() });
      toast.success('Card re-sent');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not resend');
    } finally {
      setBusy('');
    }
  };

  const sel = 'rounded-lg px-3 py-2 text-sm';
  const selStyle = { background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--surface-text)' }}>Card orders</h2>
          <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Razorpay payment links and WhatsApp / email card delivery</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={sel} style={selStyle}>
            <option value="">All payments</option>
            {['PENDING_PAYMENT', 'PAID', 'EXPIRED', 'CANCELLED', 'FAILED'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={delivery} onChange={(e) => setDelivery(e.target.value)} className={sel} style={selStyle}>
            <option value="">All deliveries</option>
            {['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'SKIPPED'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button type="button" onClick={() => load()} className={`${sel} inline-flex items-center gap-1.5`} style={selStyle}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {!rows ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-7 w-7 animate-spin text-[#E70C65]" /></div>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm" style={{ color: 'var(--surface-text-2)' }}>No orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--surface-border)' }}>
          <table className="w-full min-w-[820px] text-sm" style={{ color: 'var(--surface-text)' }}>
            <thead style={{ background: 'var(--surface-2)' }}>
              <tr className="text-left text-xs uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">WhatsApp delivery</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <Fragment key={o.id}>
                  <tr className="border-t align-top" style={{ borderColor: 'var(--surface-border)' }}>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{o.user?.name}</div>
                      <div className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{o.email} · {o.phone || 'no phone'}</div>
                      {o.username && <a href={`/${o.username}`} target="_blank" rel="noreferrer" className="text-xs text-[#E70C65]">/{o.username}</a>}
                    </td>
                    <td className="px-4 py-3 font-semibold">₹{(o.amount / 100).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_TONE[o.status] || ''}`}>{o.status}</span>
                      {o.razorpayPaymentId && <div className="mt-1 text-[11px]" style={{ color: 'var(--surface-text-2)' }}>{o.razorpayPaymentId}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${DELIVERY_TONE[o.delivery?.status] || ''}`}>{o.status === 'PAID' ? o.delivery?.status : '—'}</span>
                      {o.delivery?.lastError && <div className="mt-1 max-w-[240px] text-[11px] text-red-400">{o.delivery.lastError}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--surface-text-2)' }}>
                      {new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button type="button" onClick={() => setOpen(open === o.id ? '' : o.id)} className="mr-2 text-xs font-semibold text-[#E70C65]">
                        {open === o.id ? 'Hide log' : 'Log'}
                      </button>
                      {o.status === 'PAID' && (
                        <button type="button" onClick={() => resend(o.id)} disabled={busy === o.id} className="inline-flex items-center gap-1 rounded-lg bg-[#E70C65] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">
                          {busy === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Resend
                        </button>
                      )}
                    </td>
                  </tr>
                  {open === o.id && (
                    <tr style={{ background: 'var(--surface-2)' }}>
                      <td colSpan={6} className="px-4 py-3">
                        {o.notifications.length === 0 ? (
                          <span className="text-xs" style={{ color: 'var(--surface-text-2)' }}>No messages yet.</span>
                        ) : (
                          <ul className="space-y-1 text-xs">
                            {o.notifications.map((n, i) => (
                              <li key={i}>
                                <b>{new Date(n.at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</b> · {n.channel} · {n.type} ·{' '}
                                <span className={n.status === 'failed' ? 'text-red-400' : n.status === 'skipped' ? 'text-sky-400' : 'text-emerald-400'}>{n.status}</span>
                                {n.error ? ` – ${n.error}` : ''}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCardOrders;
