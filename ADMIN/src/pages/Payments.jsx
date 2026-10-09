import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileDown, RefreshCw, Search, Undo2 } from 'lucide-react';
import { useApi, useDebounced, useFilters } from '../lib/hooks';
import { api, qs, downloadUrl } from '../lib/api';
import { useAuth } from '../lib/auth';
import { dateTime, money, timeLeft, planLabel, words } from '../lib/format';
import { Badge, Button, Card, DefList, ErrorBox, Field, FilterBar, Input, Modal, PageHeader, Pagination, Select, Spinner, StatusBadge, Table, Tabs, useToast } from '../components/ui';
import OrderActions from '../components/OrderActions';
import ActionDialog from '../components/ActionDialog';
import ExportButton from '../components/ExportButton';

const DEFAULTS = { tab: 'plans', q: '', status: '', delivery: '', from: '', to: '', page: '1' };

const UserCell = ({ user, fallback }) =>
  user ? (
    <Link to={`/users/${user.id}`} className="block hover:underline" onClick={(e) => e.stopPropagation()}>
      <span className="text-slate-900">{user.name}</span>
      <span className="block text-xs text-slate-500">{user.email}</span>
    </Link>
  ) : (
    <span className="text-xs text-slate-500">{fallback || 'Deleted account'}</span>
  );

// Status of a plan purchase, with what an admin needs to know at a glance.
function TxnStatus({ t }) {
  return (
    <div className="flex flex-wrap gap-1">
      {t.status === 'abandoned' ? <Badge color="slate">Abandoned</Badge> : <StatusBadge value={t.status} />}
      {t.refund && <Badge color={t.refund.status === 'failed' ? 'red' : 'amber'}>{t.refund.status === 'failed' ? 'Refund failed' : `Refunded ${money(t.refund.amount)}`}</Badge>}
      {t.test && <Badge color="blue">Test amount</Badge>}
    </div>
  );
}

export default function Payments() {
  const { can } = useAuth();
  const [f, set] = useFilters(DEFAULTS);
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(f.q);
  const q = useDebounced(search);
  useEffect(() => {
    if (q !== f.q) set({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const cards = f.tab === 'cards';
  const listParams = { q: f.q, status: f.status, from: f.from, to: f.to, page: f.page, limit: 25, ...(cards && { delivery: f.delivery }) };
  const { data, loading, error, reload } = useApi(`/payments/${cards ? 'card-orders' : 'transactions'}${qs(listParams)}`);
  const openId = params.get('open') || '';
  const setOpen = (id) => {
    const p = new URLSearchParams(params);
    if (id) p.set('open', id);
    else p.delete('open');
    setParams(p, { replace: true });
  };

  const orderColumns = [
    { key: 'user', label: 'User', render: (o) => <UserCell user={o.user} fallback={o.email} /> },
    {
      key: 'link',
      label: 'Link sent',
      render: (o) => (
        <div className="whitespace-nowrap">
          <p>{dateTime(o.linkSentAt)}</p>
          {!o.complimentary && <p className="text-xs text-slate-500">Email {o.linkSent?.email || '—'} · WhatsApp {o.linkSent?.whatsapp || '—'}</p>}
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
            <p className="text-xs text-slate-500">{o.status === 'PENDING_PAYMENT' ? timeLeft(o.expiresAt) : o.status === 'PAID' ? 'Used' : 'Expired'}</p>
          </div>
        ),
    },
    { key: 'amount', label: 'Amount', render: (o) => money(o.amount) },
    { key: 'status', label: 'Payment', render: (o) => <div><StatusBadge value={o.status} />{o.paidAt && <p className="mt-1 whitespace-nowrap text-xs text-slate-500">{dateTime(o.paidAt)}</p>}</div> },
    { key: 'gateway', label: 'Transaction ID', mobile: false, render: (o) => <span className="font-mono text-xs">{o.razorpayPaymentId || '—'}</span> },
    { key: 'delivery', label: 'Delivery', render: (o) => <div><StatusBadge value={o.delivery?.status} />{o.delivery?.lastError && <p className="mt-1 max-w-[200px] text-xs text-red-600">{o.delivery.lastError}</p>}</div> },
    { key: 'actions', label: '', wide: true, render: (o) => <OrderActions order={o} onDone={reload} /> },
  ];

  const txnColumns = [
    { key: 'user', label: 'User', primary: true, render: (t) => <UserCell user={t.user} /> },
    { key: 'createdAt', label: 'Date', render: (t) => <span className="whitespace-nowrap">{dateTime(t.createdAt)}</span> },
    {
      key: 'plan',
      label: 'Plan',
      render: (t) => (
        <div>
          <p>{planLabel(t.plan)}</p>
          <p className="text-xs text-slate-500">{t.billingType} · {t.expireDays} days{t.periodMismatch && <span className="ml-1 text-amber-700">(period doesn't match)</span>}</p>
        </div>
      ),
    },
    { key: 'base', label: 'Price', className: 'text-right', render: (t) => <span title={t.gstEstimated ? 'Worked out from the total (older payment)' : undefined}>{money(t.base)}{t.gstEstimated ? '*' : ''}</span> },
    { key: 'gst', label: 'GST 18%', className: 'text-right', render: (t) => `${money(t.gst)}${t.gstEstimated ? '*' : ''}` },
    { key: 'amount', label: 'Total', className: 'text-right', render: (t) => <b className="text-slate-900">{money(t.amount)}</b> },
    { key: 'status', label: 'Status', render: (t) => <TxnStatus t={t} /> },
    { key: 'invoice', label: 'Invoice', render: (t) => (t.status === 'completed' ? <a href={downloadUrl(`/payments/transactions/${t.id}/invoice`)} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"><FileDown className="h-3.5 w-3.5" aria-hidden="true" />{t.invoiceNumber}</a> : <span className="text-xs text-slate-400">—</span>) },
  ];

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Plan purchases (Cashfree) and card payment links (Razorpay, valid 24 hours)."
        actions={can('export.csv') && <ExportButton path={cards ? '/payments/card-orders/export' : '/payments/transactions/export'} params={{ ...listParams, limit: undefined }} what={cards ? 'card payments' : 'plan purchases'} />}
      />
      <Tabs
        value={f.tab}
        onChange={(tab) => { setSearch(''); set({ tab, status: '', delivery: '', q: '' }); }}
        tabs={[
          { value: 'plans', label: 'Plan purchases' },
          { value: 'cards', label: 'Card payments' },
        ]}
      />
      <Card padded={false}>
        <FilterBar className="sm:grid-cols-2 lg:grid-cols-5" active={[f.status, f.delivery, f.from].filter(Boolean).length}>
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
                <option value="pending">Pending (last 24 hours)</option>
                <option value="abandoned">Abandoned (not paid in 24 hours)</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
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
        </FilterBar>
        {error ? (
          <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div>
        ) : (
          <>
            <Table
              columns={cards ? orderColumns : txnColumns}
              rows={cards ? data?.orders : data?.transactions}
              loading={loading}
              empty="No payments match these filters."
              onRowClick={cards ? undefined : (t) => setOpen(t.id)}
            />
            {!cards && data?.transactions?.some((t) => t.gstEstimated) && (
              <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">* Older payment: only the total was saved, so price and GST are worked out from it.</p>
            )}
            <Pagination page={f.page} pages={data?.pages} total={data?.total} onPage={(page) => set({ page })} />
          </>
        )}
      </Card>
      {!cards && openId && <TxnDetail id={openId} onClose={() => setOpen('')} onChanged={reload} />}
    </>
  );
}

function TxnDetail({ id, onClose, onChanged }) {
  const { can } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useApi(`/payments/transactions/${id}`);
  const [dialog, setDialog] = useState(null);
  const [checking, setChecking] = useState(false);
  const [refund, setRefund] = useState({ amount: '', endPlan: true, manual: false });
  const t = data?.transaction;
  const done = () => {
    reload();
    onChanged();
  };
  const check = async () => {
    setChecking(true);
    try {
      const res = await api(`/payments/transactions/${id}/check`, { method: 'POST' });
      toast(res.msg);
      done();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setChecking(false);
    }
  };
  return (
    <Modal open title="Plan payment" onClose={onClose} wide>
      {loading && !t ? (
        <Spinner />
      ) : error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : (
        <>
          <TxnStatus t={t} />
          <DefList
            items={[
              ['Customer', t.user ? <Link key="u" to={`/users/${t.user.id}`} className="text-brand-600 hover:underline">{t.user.name} ({t.user.email})</Link> : 'Deleted account'],
              ['Plan', `${planLabel(t.plan)} · ${t.billingType} · ${t.expireDays} days`],
              ['Price before GST', `${money(t.base)}${t.gstEstimated ? ' (worked out from the total)' : ''}`],
              ['GST 18%', money(t.gst)],
              ['Total charged', money(t.amount)],
              ['Invoice', t.invoiceNumber || '—'],
              ['Started', dateTime(t.createdAt)],
              ['Last update', dateTime(t.updatedAt)],
              ['Paid through', t.source ? words(t.source) : t.cfLinkId ? 'SMS payment link' : 'Checkout'],
              ['Cashfree order / link', t.cfOrderId || t.cfLinkId || '—'],
              t.refund && ['Refund', `${t.refund.status} · ${money(t.refund.amount)} · ${dateTime(t.refund.at)}${t.refund.reason ? ` · ${t.refund.reason}` : ''}${t.refund.error ? ` · ${t.refund.error}` : ''}`],
            ]}
          />
          {t.periodMismatch && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">The billing period ({t.billingType}) doesn't match the days bought ({t.expireDays}). This is an old test record.</p>}
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {t.status === 'completed' && (
              <a href={downloadUrl(`/payments/transactions/${id}/invoice`)} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                <FileDown className="h-4 w-4" aria-hidden="true" /> Download invoice
              </a>
            )}
            {['pending', 'abandoned'].includes(t.status) && can('payments.resend') && (
              <Button variant="secondary" onClick={check} loading={checking}><RefreshCw className="h-4 w-4" /> Check with Cashfree</Button>
            )}
            {t.status === 'completed' && !['pending', 'processed', 'manual'].includes(t.refund?.status) && can('payments.refund') && (
              <Button variant="danger" onClick={() => { setRefund({ amount: String(t.amount), endPlan: true, manual: !t.cfOrderId }); setDialog('refund'); }}>
                <Undo2 className="h-4 w-4" /> Refund
              </Button>
            )}
          </div>
        </>
      )}
      <ActionDialog
        open={dialog === 'refund'}
        onClose={() => setDialog(null)}
        title="Refund this payment"
        description={refund.manual ? 'Paid through a payment link: make the refund in the Cashfree dashboard first, then record it here.' : 'Cashfree sends the money back to the customer’s card / UPI / bank in 5–7 working days.'}
        confirmLabel={refund.manual ? 'Record refund' : 'Refund now'}
        danger
        canSubmit={Number(refund.amount) > 0 && Number(refund.amount) <= (t?.amount || 0)}
        onSubmit={async ({ reason }) => {
          const res = await api(`/payments/transactions/${id}/refund`, { method: 'POST', body: { amount: Number(refund.amount), reason, endPlan: refund.endPlan, manual: refund.manual } });
          toast(res.msg);
          done();
        }}
      >
        <Field label="Amount (₹)" hint={`Up to ${money(t?.amount)} (the total charged).`}>
          <Input type="number" min={1} step="0.01" value={refund.amount} onChange={(e) => setRefund((r) => ({ ...r, amount: e.target.value }))} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={refund.endPlan} onChange={(e) => setRefund((r) => ({ ...r, endPlan: e.target.checked }))} /> End their plan now
        </label>
        {t?.cfOrderId && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={refund.manual} onChange={(e) => setRefund((r) => ({ ...r, manual: e.target.checked }))} /> Already refunded in the Cashfree dashboard (just record it)
          </label>
        )}
      </ActionDialog>
    </Modal>
  );
}
