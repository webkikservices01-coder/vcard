import { useState } from 'react';
import { Plus, TicketPercent } from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { dateOnly, money, num } from '../lib/format';
import { Badge, Button, Card, ErrorBox, Field, Input, Modal, PageHeader, Select, Table, useToast } from '../components/ui';

// Discount codes for plan checkout. The discount comes off the plan price; GST is added after.
const EMPTY = { code: '', kind: 'percent', value: 10, plans: [], billing: 'any', maxUses: 0, oncePerUser: true, startsAt: '', expiresAt: '', active: true, note: '' };
const day = (d) => (d ? String(new Date(d).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })) : '');

function state(c) {
  const now = Date.now();
  if (!c.active) return ['Off', 'slate'];
  if (c.expiresAt && new Date(c.expiresAt) < now) return ['Expired', 'slate'];
  if (c.startsAt && new Date(c.startsAt) > now) return ['Scheduled', 'blue'];
  if (c.maxUses && c.usedCount >= c.maxUses) return ['Used up', 'amber'];
  return ['Active', 'green'];
}

export default function Coupons() {
  const { can } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useApi('/coupons');
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const manage = can('coupons.manage');
  const plans = data?.plans || [];
  const planName = (id) => plans.find((p) => p.id === id)?.name || id;

  const save = async () => {
    setBusy(true);
    try {
      const body = { ...edit, value: Number(edit.value), maxUses: Number(edit.maxUses) || 0, startsAt: edit.startsAt || '', expiresAt: edit.expiresAt || '' };
      for (const k of ['_id', 'usedCount', 'createdAt', 'updatedAt', 'createdBy', '__v', 'orders', 'revenue', 'discountGiven']) delete body[k];
      await api(edit._id ? `/coupons/${edit._id}` : '/coupons', { method: edit._id ? 'PUT' : 'POST', body });
      toast(edit._id ? 'Coupon saved.' : `Coupon ${body.code.toUpperCase()} created.`);
      setEdit(null);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  const remove = async (c) => {
    if (!window.confirm(c.usedCount ? `${c.code} has been used, so it will be switched off (kept for old invoices).` : `Delete coupon ${c.code}?`)) return;
    try {
      const r = await api(`/coupons/${c._id}`, { method: 'DELETE' });
      toast(r.kept ? `${c.code} switched off.` : `${c.code} deleted.`);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  };
  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const togglePlan = (id) => setEdit({ ...edit, plans: edit.plans.includes(id) ? edit.plans.filter((p) => p !== id) : [...edit.plans, id] });

  const columns = [
    { key: 'code', label: 'Code', primary: true, render: (c) => <div><p className="font-mono font-semibold text-slate-950">{c.code}</p>{c.note && <p className="text-xs text-slate-500">{c.note}</p>}</div> },
    { key: 'value', label: 'Discount', render: (c) => (c.kind === 'percent' ? `${c.value}% off` : `${money(c.value)} off`) },
    { key: 'plans', label: 'Plans', render: (c) => <span className="text-xs">{c.plans?.length ? c.plans.map(planName).join(', ') : 'All plans'}{c.billing !== 'any' ? ` · ${c.billing} only` : ''}</span> },
    { key: 'used', label: 'Used', render: (c) => <span>{num(c.usedCount)}{c.maxUses ? ` / ${num(c.maxUses)}` : ''}</span> },
    { key: 'revenue', label: 'Paid orders', render: (c) => <span className="text-xs">{num(c.orders)} · {money(c.revenue)}<span className="block text-slate-500">{money(c.discountGiven)} given off</span></span> },
    { key: 'dates', label: 'Valid', render: (c) => <span className="whitespace-nowrap text-xs">{c.startsAt ? dateOnly(c.startsAt) : 'Now'} → {c.expiresAt ? dateOnly(c.expiresAt) : 'no end'}</span> },
    { key: 'state', label: 'Status', render: (c) => { const [l, t] = state(c); return <Badge color={t}>{l}</Badge>; } },
    {
      key: 'actions',
      label: '',
      render: (c) => manage && (
        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="secondary" onClick={() => setEdit({ ...EMPTY, ...c, startsAt: day(c.startsAt), expiresAt: day(c.expiresAt) })}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => remove(c)}>{c.usedCount ? 'Switch off' : 'Delete'}</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Coupons"
        subtitle="Discount codes customers type at checkout on the Plans page or the upgrade link. The discount comes off the plan price, then 18% GST is added."
        actions={manage && <Button onClick={() => setEdit({ ...EMPTY })}><Plus className="h-4 w-4" aria-hidden="true" /> New coupon</Button>}
      />
      <Card padded={false}>
        {error ? <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div> : <Table loading={loading} rows={data?.coupons} rowKey={(c) => c._id} empty="No coupons yet." columns={columns} />}
      </Card>
      {edit && (
        <Modal open wide title={edit._id ? `Edit ${edit.code}` : 'New coupon'} onClose={() => setEdit(null)} footer={<><Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save} loading={busy} disabled={!/^[A-Za-z0-9_-]{3,30}$/.test(edit.code) || !(Number(edit.value) > 0)}><TicketPercent className="h-4 w-4" aria-hidden="true" /> Save coupon</Button></>}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Code *" hint="3–30 letters or numbers, e.g. DIWALI20"><Input value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase().replace(/\s/g, '') })} maxLength={30} className="font-mono uppercase" /></Field>
            <Field label="Note for the team"><Input value={edit.note} onChange={set('note')} maxLength={200} placeholder="Diwali offer" /></Field>
            <Field label="Discount type">
              <Select value={edit.kind} onChange={set('kind')}><option value="percent">Percentage (%)</option><option value="flat">Fixed amount (₹)</option></Select>
            </Field>
            <Field label={edit.kind === 'percent' ? 'Percentage off *' : 'Rupees off *'}><Input type="number" min={1} max={edit.kind === 'percent' ? 100 : 100000} value={edit.value} onChange={set('value')} /></Field>
            <Field label="Works on billing">
              <Select value={edit.billing} onChange={set('billing')}><option value="any">Monthly and yearly</option><option value="monthly">Monthly only</option><option value="yearly">Yearly only</option></Select>
            </Field>
            <Field label="Total uses allowed" hint="0 = no limit"><Input type="number" min={0} value={edit.maxUses} onChange={set('maxUses')} /></Field>
            <Field label="Starts on" hint="Empty = from now"><Input type="date" value={edit.startsAt || ''} onChange={set('startsAt')} /></Field>
            <Field label="Ends on" hint="Empty = never"><Input type="date" value={edit.expiresAt || ''} onChange={set('expiresAt')} /></Field>
          </div>
          <fieldset>
            <legend className="mb-1 text-xs font-medium text-slate-600">Plans (none ticked = every plan)</legend>
            <div className="flex flex-wrap gap-3">
              {plans.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={edit.plans.includes(p.id)} onChange={() => togglePlan(p.id)} className="h-4 w-4 accent-brand-600" /> {p.name}</label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={edit.oncePerUser} onChange={set('oncePerUser')} className="h-4 w-4 accent-brand-600" /> One use per customer</label>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={edit.active} onChange={set('active')} className="h-4 w-4 accent-brand-600" /> Coupon is on</label>
        </Modal>
      )}
    </>
  );
}
