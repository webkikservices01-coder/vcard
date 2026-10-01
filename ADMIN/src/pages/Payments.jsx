import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search } from 'lucide-react';
import { useApi, useDebounced, useFilters } from '../lib/hooks';
import { qs, downloadUrl } from '../lib/api';
import { useAuth } from '../lib/auth';
import { dateTime, money, timeLeft } from '../lib/format';
import { Badge, Card, ErrorBox, Input, PageHeader, Pagination, Select, StatusBadge, Table, Tabs } from '../components/ui';
import OrderActions from '../components/OrderActions';

const DEFAULTS = { tab: 'cards', q: '', status: '', delivery: '', from: '', to: '', page: '1' };

const UserCell = ({ user, fallback }) =>
  user ? (
    <Link to={`/users/${user.id}`} className="block hover:underline" onClick={(e) => e.stopPropagation()}>
      <span className="text-slate-900">{user.name}</span>
      <span className="block text-xs text-slate-500">{user.email}</span>
    </Link>
  ) : (
    <span className="text-xs text-slate-500">{fallback || 'deleted user'}</span>
  );

export default function Payments() {
  const { can } = useAuth();
  const [f, set] = useFilters(DEFAULTS);
  const [search, setSearch] = useState(f.q);
  const q = useDebounced(search);
  useEffect(() => {
    if (q !== f.q) set({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const cards = f.tab === 'cards';
  const params = { q: f.q, status: f.status, from: f.from, to: f.to, page: f.page, limit: 25, ...(cards && { delivery: f.delivery }) };
  const { data, loading, error, reload } = useApi(`/payments/${cards ? 'card-orders' : 'transactions'}${qs(params)}`);

  const orderColumns = [
    { key: 'user', label: 'User', render: (o) => <UserCell user={o.user} fallback={o.email} /> },
    {
      key: 'link',
      label: 'Link sent',
      render: (o) => (
        <div className="whitespace-nowrap">
          <p>{dateTime(o.linkSentAt)}</p>
          {!o.complimentary && (
            <p className="text-xs text-slate-500">
              email {o.linkSent?.email || '—'} · WhatsApp {o.linkSent?.whatsapp || '—'}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'expiry',
      label: '24h link',
      render: (o) =>
        o.complimentary ? <Badge color="pink">Free credit</Badge> : (
          <div className="whitespace-nowrap">
            <p>{dateTime(o.expiresAt)}</p>
            <p className="text-xs text-slate-500">{o.status === 'PENDING_PAYMENT' ? timeLeft(o.expiresAt) : o.status === 'PAID' ? 'used' : 'expired'}</p>
          </div>
        ),
    },
    { key: 'amount', label: 'Amount', render: (o) => money(o.amount) },
    { key: 'status', label: 'Payment', render: (o) => <div><StatusBadge value={o.status} />{o.paidAt && <p className="mt-1 whitespace-nowrap text-xs text-slate-500">{dateTime(o.paidAt)}</p>}</div> },
    { key: 'gateway', label: 'Transaction ID', render: (o) => <span className="font-mono text-xs">{o.razorpayPaymentId || '—'}</span> },
    { key: 'delivery', label: 'Delivery', render: (o) => <div><StatusBadge value={o.delivery?.status} />{o.delivery?.lastError && <p className="mt-1 max-w-[200px] text-xs text-red-600">{o.delivery.lastError}</p>}</div> },
    { key: 'actions', label: '', render: (o) => <OrderActions order={o} onDone={reload} /> },
  ];

  const txnColumns = [
    { key: 'user', label: 'User', render: (t) => <UserCell user={t.user} /> },
    { key: 'createdAt', label: 'Date', render: (t) => dateTime(t.createdAt) },
    { key: 'plan', label: 'Plan', render: (t) => <div><p>{t.plan}</p><p className="text-xs text-slate-500">{t.billingType} · {t.expireDays} days</p></div> },
    { key: 'amount', label: 'Amount', render: (t) => money(t.amount) },
    { key: 'status', label: 'Status', render: (t) => <StatusBadge value={t.status} /> },
    { key: 'cfOrderId', label: 'Cashfree order', render: (t) => <span className="font-mono text-xs">{t.cfOrderId || '—'}</span> },
    { key: 'invoice', label: 'Invoice', render: (t) => <span className="text-xs">{t.invoiceNumber || '—'}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Card payment links (Razorpay, valid 24 hours) and plan purchases (Cashfree)."
        actions={
          can('export.csv') && (
            <a href={downloadUrl(cards ? '/payments/card-orders/export' : '/payments/transactions/export', { ...params, page: undefined, limit: undefined })} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-surface px-4 text-sm font-medium text-slate-800 hover:bg-slate-50">
              <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
            </a>
          )
        }
      />
      <Tabs
        value={f.tab}
        onChange={(tab) => { setSearch(''); set({ tab, status: '', delivery: '', q: '' }); }}
        tabs={[
          { value: 'cards', label: 'Card payments' },
          { value: 'plans', label: 'Plan purchases' },
        ]}
      />
      <Card padded={false}>
        <div className="grid gap-2 border-b border-slate-100 p-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={cards ? 'Name, email, phone, payment ID' : 'Name, email, order ID, invoice'} className="pl-9" aria-label="Search payments" />
          </div>
          <Select value={f.status} onChange={(e) => set({ status: e.target.value })} aria-label="Status">
            <option value="">Any status</option>
            {cards ? (
              <>
                <option value="PENDING_PAYMENT">Pending (link valid)</option>
                <option value="PAID">Paid</option>
                <option value="EXPIRED">Expired</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </>
            ) : (
              <>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </>
            )}
          </Select>
          {cards && (
            <Select value={f.delivery} onChange={(e) => set({ delivery: e.target.value })} aria-label="Delivery">
              <option value="">Any delivery</option>
              <option value="PENDING">Pending</option>
              <option value="SENT">Sent</option>
              <option value="DELIVERED">Delivered</option>
              <option value="READ">Read</option>
              <option value="FAILED">Failed</option>
              <option value="SKIPPED">Skipped</option>
            </Select>
          )}
          <Input type="date" value={f.from ? f.from.slice(0, 10) : ''} onChange={(e) => set({ from: e.target.value })} aria-label="From date" title="From" />
        </div>
        {error ? (
          <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div>
        ) : (
          <>
            <Table columns={cards ? orderColumns : txnColumns} rows={cards ? data?.orders : data?.transactions} loading={loading} empty="No payments match these filters." />
            <Pagination page={f.page} pages={data?.pages} total={data?.total} onPage={(page) => set({ page })} />
          </>
        )}
      </Card>
    </>
  );
}
