import { useEffect, useState } from 'react';
import { Search, Plus, Truck, Mail, Phone, ExternalLink } from 'lucide-react';
import { api, qs } from '../lib/api';
import { useApi, useDebounced, useFilters } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { dateTime, dateOnly, money, num } from '../lib/format';
import { Badge, Button, Card, ErrorBox, Field, FilterBar, Input, Modal, PageHeader, Pagination, Select, Stat, Table, Textarea, useToast } from '../components/ui';
import ExportButton from '../components/ExportButton';

// Metal NFC card orders: from the website order form, or added here. Move each one along and add
// the courier + tracking; the customer is emailed when it ships and when it's delivered.
const LABEL = { new: 'New', confirmed: 'Confirmed', design: 'Design', printing: 'Printing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
const TONE = { new: 'amber', confirmed: 'blue', design: 'blue', printing: 'blue', shipped: 'pink', delivered: 'green', cancelled: 'slate' };
const NEXT = { new: 'confirmed', confirmed: 'design', design: 'printing', printing: 'shipped', shipped: 'delivered' };
const SOURCE = { form: 'Website order form', 'pro-plan': 'AI Agent Pro plan', manual: 'Added by the team' };
const EMPTY = { name: '', phone: '', email: '', company: '', cardLink: '', quantity: 1, design: '', address: { line1: '', line2: '', city: '', state: '', pincode: '' }, amount: 0, paid: false, notes: '' };

function OrderForm({ value, onChange }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const setA = (k) => (e) => onChange({ ...value, address: { ...value.address, [k]: e.target.value } });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Customer name *"><Input value={value.name} onChange={set('name')} maxLength={80} /></Field>
      <Field label="Company"><Input value={value.company} onChange={set('company')} maxLength={120} /></Field>
      <Field label="Phone / WhatsApp"><Input value={value.phone} onChange={set('phone')} maxLength={30} inputMode="tel" /></Field>
      <Field label="Email (for shipping updates)"><Input type="email" value={value.email} onChange={set('email')} maxLength={200} /></Field>
      <Field label="Card link the NFC chip opens" hint="e.g. aicardly.com/citi-glass"><Input value={value.cardLink} onChange={set('cardLink')} maxLength={200} /></Field>
      <Field label="Quantity"><Input type="number" min={1} max={500} value={value.quantity} onChange={set('quantity')} /></Field>
      <Field label="Design (finish, logo, name to engrave)" className="sm:col-span-2"><Textarea value={value.design} onChange={set('design')} maxLength={1000} /></Field>
      <Field label="Address line 1" className="sm:col-span-2"><Input value={value.address?.line1 || ''} onChange={setA('line1')} maxLength={160} autoComplete="address-line1" /></Field>
      <Field label="Address line 2" className="sm:col-span-2"><Input value={value.address?.line2 || ''} onChange={setA('line2')} maxLength={160} autoComplete="address-line2" /></Field>
      <Field label="City"><Input value={value.address?.city || ''} onChange={setA('city')} maxLength={80} /></Field>
      <Field label="State"><Input value={value.address?.state || ''} onChange={setA('state')} maxLength={80} /></Field>
      <Field label="PIN code"><Input value={value.address?.pincode || ''} onChange={setA('pincode')} maxLength={6} inputMode="numeric" /></Field>
      <Field label="Amount agreed (₹, incl. GST)"><Input type="number" min={0} value={value.amount} onChange={set('amount')} /></Field>
      <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2"><input type="checkbox" checked={!!value.paid} onChange={set('paid')} className="h-4 w-4 accent-brand-600" /> Payment received</label>
      <Field label="Team notes (not shown to the customer)" className="sm:col-span-2"><Textarea value={value.notes} onChange={set('notes')} maxLength={2000} /></Field>
    </div>
  );
}

function StatusDialog({ order, onClose, onDone }) {
  const toast = useToast();
  const [s, setS] = useState(() => ({ status: NEXT[order.status] || order.status, note: '', courier: order.courier || '', trackingNumber: order.trackingNumber || '', trackingUrl: order.trackingUrl || '', expectedDelivery: order.expectedDelivery ? String(order.expectedDelivery).slice(0, 10) : '', email: true }));
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setS({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const save = async () => {
    setBusy(true);
    try {
      const r = await api(`/orders/${order._id}/status`, { method: 'POST', body: s });
      toast(`Order ${order.number}: ${LABEL[s.status]}${r.emailed ? ' · customer emailed' : ''}`);
      onDone();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  const mails = ['shipped', 'delivered'].includes(s.status);
  return (
    <Modal open title={`Update ${order.number}`} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={save} loading={busy}>Save</Button></>}>
      <Field label="New status">
        <Select value={s.status} onChange={set('status')}>
          {Object.entries(LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
      </Field>
      {s.status === 'shipped' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Courier *"><Input value={s.courier} onChange={set('courier')} placeholder="Blue Dart, Delhivery…" maxLength={80} /></Field>
          <Field label="Tracking number *"><Input value={s.trackingNumber} onChange={set('trackingNumber')} maxLength={80} /></Field>
          <Field label="Tracking link" className="sm:col-span-2"><Input value={s.trackingUrl} onChange={set('trackingUrl')} placeholder="https://…" maxLength={500} /></Field>
          <Field label="Expected delivery"><Input type="date" value={s.expectedDelivery} onChange={set('expectedDelivery')} /></Field>
        </div>
      )}
      <Field label="Note (kept in the order history)"><Textarea value={s.note} onChange={set('note')} maxLength={500} /></Field>
      {mails && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={s.email} onChange={set('email')} className="h-4 w-4 accent-brand-600" disabled={!order.email} />
          {order.email ? `Email ${order.email} about it` : 'No email on this order, so the customer is not emailed'}
        </label>
      )}
    </Modal>
  );
}

export default function Orders() {
  const { can } = useAuth();
  const toast = useToast();
  const [f, set] = useFilters({ q: '', status: '', page: '1' });
  const [search, setSearch] = useState(f.q);
  const q = useDebounced(search);
  useEffect(() => {
    if (q !== f.q) set({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const { data, loading, error, reload } = useApi(`/orders${qs({ q: f.q, status: f.status, page: f.page, limit: 25 })}`);
  const [editing, setEditing] = useState(null); // order being added / edited
  const [moving, setMoving] = useState(null);
  const [open, setOpen] = useState(null); // order detail
  const [busy, setBusy] = useState(false);
  const manage = can('orders.manage');

  const save = async () => {
    setBusy(true);
    try {
      const body = { ...editing, quantity: Number(editing.quantity) || 1, amount: Number(editing.amount) || 0 };
      delete body._id;
      if (editing._id) await api(`/orders/${editing._id}`, { method: 'PUT', body: pick(body) });
      else await api('/orders', { method: 'POST', body: pick(body) });
      toast(editing._id ? 'Order saved.' : 'Order added.');
      setEditing(null);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const c = data?.counts || {};
  const columns = [
    {
      key: 'number',
      label: 'Order',
      primary: true,
      render: (o) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-950">{o.number} · {o.name}{o.company ? <span className="font-normal text-slate-500"> · {o.company}</span> : null}</p>
          <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
            {o.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" aria-hidden="true" />{o.phone}</span>}
            {o.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" aria-hidden="true" />{o.email}</span>}
          </div>
        </div>
      ),
    },
    { key: 'createdAt', label: 'Ordered', render: (o) => <span className="whitespace-nowrap">{dateOnly(o.createdAt)}</span> },
    { key: 'quantity', label: 'Qty', render: (o) => num(o.quantity) },
    { key: 'amount', label: 'Amount', render: (o) => (o.amount ? <span>{money(o.amount)} {o.paid ? <Badge color="green">Paid</Badge> : <Badge color="amber">Unpaid</Badge>}</span> : <span className="text-slate-400">—</span>) },
    { key: 'status', label: 'Status', render: (o) => <Badge color={TONE[o.status]}>{LABEL[o.status]}</Badge> },
    { key: 'tracking', label: 'Tracking', render: (o) => (o.trackingNumber ? <span className="text-xs">{o.courier} · {o.trackingNumber}</span> : <span className="text-slate-400">—</span>) },
    {
      key: 'actions',
      label: '',
      render: (o) => (
        <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
          {manage && NEXT[o.status] && <Button size="sm" onClick={() => setMoving(o)}><Truck className="h-3.5 w-3.5" aria-hidden="true" /> {LABEL[NEXT[o.status]]}</Button>}
          {manage && <Button size="sm" variant="secondary" onClick={() => setEditing({ ...EMPTY, ...o, address: { ...EMPTY.address, ...(o.address || {}) } })}>Edit</Button>}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Metal NFC card orders"
        subtitle="Orders from the website order form and the ones the team adds. Move each order along; customers get an email when it ships and when it's delivered."
        actions={
          <div className="flex flex-wrap gap-2">
            {can('export.csv') && <ExportButton path="/orders/export" params={{ q: f.q, status: f.status }} what="the NFC orders list" />}
            {manage && <Button onClick={() => setEditing({ ...EMPTY })}><Plus className="h-4 w-4" aria-hidden="true" /> New order</Button>}
          </div>
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="New, to confirm" value={num(c.new)} />
        <Stat label="In production" value={num((c.confirmed || 0) + (c.design || 0) + (c.printing || 0))} />
        <Stat label="Shipped" value={num(c.shipped)} />
        <Stat label="Delivered" value={num(c.delivered)} />
      </div>
      <Card padded={false}>
        <FilterBar className="sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Order number, name, phone, email, tracking" className="pl-9" aria-label="Search orders" />
          </div>
          <Select value={f.status} onChange={(e) => set({ status: e.target.value })} aria-label="Status">
            <option value="">All orders</option>
            {Object.entries(LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </FilterBar>
        {error ? (
          <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div>
        ) : (
          <>
            <Table loading={loading} rows={data?.orders} rowKey={(o) => o._id} onRowClick={setOpen} empty="No orders yet. Orders from the website's metal card form appear here." columns={columns} />
            <Pagination page={f.page} pages={data?.pages} total={data?.total} onPage={(page) => set({ page })} />
          </>
        )}
      </Card>

      {editing && (
        <Modal open wide title={editing._id ? `Edit ${editing.number}` : 'New metal card order'} onClose={() => setEditing(null)} footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} loading={busy} disabled={String(editing.name || '').trim().length < 2}>Save</Button></>}>
          <OrderForm value={editing} onChange={setEditing} />
        </Modal>
      )}
      {moving && <StatusDialog order={moving} onClose={() => setMoving(null)} onDone={() => { setMoving(null); reload(); }} />}
      {open && (
        <Modal open wide title={`${open.number} · ${open.name}`} onClose={() => setOpen(null)} footer={manage && <Button onClick={() => { setMoving(open); setOpen(null); }}><Truck className="h-4 w-4" aria-hidden="true" /> Update status</Button>}>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <p><span className="text-slate-500">Status:</span> <Badge color={TONE[open.status]}>{LABEL[open.status]}</Badge></p>
            <p><span className="text-slate-500">From:</span> {SOURCE[open.source] || open.source}</p>
            <p><span className="text-slate-500">Quantity:</span> {open.quantity}</p>
            <p><span className="text-slate-500">Amount:</span> {open.amount ? `${money(open.amount)} (${open.paid ? 'paid' : 'unpaid'})` : '—'}</p>
            {open.cardLink && <p className="sm:col-span-2"><span className="text-slate-500">Card link:</span> {open.cardLink}</p>}
            {open.design && <p className="whitespace-pre-line sm:col-span-2"><span className="text-slate-500">Design:</span> {open.design}</p>}
            <p className="sm:col-span-2"><span className="text-slate-500">Address:</span> {[open.address?.line1, open.address?.line2, open.address?.city, open.address?.state, open.address?.pincode].filter(Boolean).join(', ') || '—'}</p>
            {open.trackingNumber && (
              <p className="sm:col-span-2">
                <span className="text-slate-500">Shipping:</span> {open.courier} · {open.trackingNumber}
                {open.trackingUrl && <a href={open.trackingUrl} target="_blank" rel="noreferrer noopener" className="ml-2 inline-flex items-center gap-1 text-brand-600 hover:underline">Track <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>}
                {open.expectedDelivery && <span className="text-slate-500"> · expected {dateOnly(open.expectedDelivery)}</span>}
              </p>
            )}
            {open.notes && <p className="whitespace-pre-line sm:col-span-2"><span className="text-slate-500">Team notes:</span> {open.notes}</p>}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">History</p>
            <ol className="space-y-2 border-l border-slate-200 pl-4">
              {[...(open.history || [])].reverse().map((h, i) => (
                <li key={i} className="text-sm">
                  <Badge color={TONE[h.status]}>{LABEL[h.status] || h.status}</Badge> <span className="text-xs text-slate-500">{dateTime(h.at)} · {h.by}{h.emailed ? ' · customer emailed' : ''}</span>
                  {h.note && <p className="mt-0.5 text-slate-700">{h.note}</p>}
                </li>
              ))}
            </ol>
          </div>
        </Modal>
      )}
    </>
  );
}

const pick = (o) => {
  const keys = ['name', 'phone', 'email', 'company', 'cardLink', 'quantity', 'design', 'address', 'amount', 'paid', 'notes'];
  return Object.fromEntries(keys.map((k) => [k, o[k]]));
};
