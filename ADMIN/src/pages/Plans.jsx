import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Search } from 'lucide-react';
import { api, qs } from '../lib/api';
import { useApi, useDebounced, useFilters } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { dateOnly, money } from '../lib/format';
import { Badge, Button, Card, ErrorBox, Field, Input, Modal, PageHeader, Pagination, Select, StatusBadge, Table, Tabs, Textarea, useToast } from '../components/ui';

const EMPTY = { code: '', name: '', tier: 'DIGITAL CARD', price: 0, durationDays: 365, cardLimit: 1, description: '' };

function PlanForm({ plan, tiers, onClose, onSaved }) {
  const toast = useToast();
  const [v, setV] = useState(plan || EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const edit = !!plan?._id;
  const setField = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const body = { name: v.name, tier: v.tier, price: Number(v.price), durationDays: Number(v.durationDays), cardLimit: Number(v.cardLimit), description: v.description };
      if (edit) await api(`/plans/${plan._id}`, { method: 'PUT', body });
      else await api('/plans', { method: 'POST', body: { ...body, code: v.code } });
      toast(edit ? 'Plan saved.' : 'Plan created.');
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={edit ? `Edit ${plan.name}` : 'New plan'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={busy}>{edit ? 'Save' : 'Create plan'}</Button>
        </>
      }
    >
      {!edit && (
        <Field label="Code" hint="Short id, e.g. diwali-offer (can't be changed later)">
          <Input value={v.code} onChange={setField('code')} />
        </Field>
      )}
      <Field label="Name">
        <Input value={v.name} onChange={setField('name')} />
      </Field>
      <Field label="Unlocks features of" hint="The app's features (AI chat, voice fill…) follow these three tiers.">
        <Select value={v.tier} onChange={setField('tier')}>
          {tiers.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Price (₹)"><Input type="number" min={0} value={v.price} onChange={setField('price')} /></Field>
        <Field label="Days"><Input type="number" min={1} max={3650} value={v.durationDays} onChange={setField('durationDays')} /></Field>
        <Field label="Card limit"><Input type="number" min={0} max={1000} value={v.cardLimit} onChange={setField('cardLimit')} /></Field>
      </div>
      <Field label="Description (optional)">
        <Textarea value={v.description} onChange={setField('description')} maxLength={500} />
      </Field>
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
        These plans are what admins grant. The website&apos;s checkout still charges the prices listed on the pricing page.
      </p>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
    </Modal>
  );
}

function PlanList() {
  const { can } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useApi('/plans');
  const [editing, setEditing] = useState(null);
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const toggle = async (p) => {
    try {
      await api(`/plans/${p._id}/${p.isActive ? 'disable' : 'enable'}`, { method: 'POST' });
      toast(p.isActive ? 'Plan disabled.' : 'Plan enabled.');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <Card
      padded={false}
      title="Plans admins can grant"
      actions={can('plans.manage') && <Button size="sm" onClick={() => setEditing({})}><Plus className="h-4 w-4" /> New plan</Button>}
    >
      <Table
        loading={loading}
        rows={data?.plans}
        rowKey={(p) => p._id}
        empty="No plans yet. Run npm run admin:migrate in BACKEND to add the website's plans."
        columns={[
          { key: 'name', label: 'Plan', render: (p) => <div><p className="font-medium text-slate-900">{p.name}</p><p className="text-xs text-slate-500">{p.code}</p></div> },
          { key: 'tier', label: 'Unlocks', render: (p) => <div><p>{p.tier}</p><p className="text-xs text-slate-500">{data.activeUsersByTier?.[p.tier] || 0} users on this tier now</p></div> },
          { key: 'price', label: 'Price', render: (p) => money(p.price) },
          { key: 'durationDays', label: 'Duration', render: (p) => `${p.durationDays} days` },
          { key: 'cardLimit', label: 'Card limit', render: (p) => p.cardLimit },
          { key: 'isActive', label: 'Status', render: (p) => <Badge color={p.isActive ? 'green' : 'slate'}>{p.isActive ? 'enabled' : 'disabled'}</Badge> },
          {
            key: 'actions',
            label: '',
            render: (p) =>
              can('plans.manage') && (
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="secondary" onClick={() => toggle(p)}>{p.isActive ? 'Disable' : 'Enable'}</Button>
                </div>
              ),
          },
        ]}
      />
      {editing && <PlanForm plan={editing._id ? editing : null} tiers={data?.tiers || []} onClose={() => setEditing(null)} onSaved={reload} />}
    </Card>
  );
}

const SUB_DEFAULTS = { tab: 'plans', q: '', state: '', source: '', page: '1' };

function Subscriptions({ f, set }) {
  const [search, setSearch] = useState(f.q);
  const q = useDebounced(search);
  useEffect(() => {
    if (q !== f.q) set({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const { data, loading, error, reload } = useApi(`/plans/subscriptions${qs({ q: f.q, state: f.state, source: f.source, page: f.page, limit: 25 })}`);
  return (
    <Card padded={false}>
      <div className="grid gap-2 border-b border-slate-100 p-3 sm:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="User or plan name" className="pl-9" aria-label="Search" />
        </div>
        <Select value={f.state} onChange={(e) => set({ state: e.target.value })} aria-label="State">
          <option value="">Any state</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
          <option value="replaced">Replaced</option>
        </Select>
        <Select value={f.source} onChange={(e) => set({ source: e.target.value })} aria-label="Source">
          <option value="">Any source</option>
          <option value="purchase">Bought online</option>
          <option value="admin_grant">Admin grant</option>
          <option value="complimentary">Complimentary</option>
          <option value="backfill">Older records</option>
        </Select>
      </div>
      {error ? (
        <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div>
      ) : (
        <>
          <Table
            loading={loading}
            rows={data?.subscriptions}
            empty="No plan records match."
            columns={[
              { key: 'user', label: 'User', render: (s) => (s.user ? <Link to={`/users/${s.user.id}`} className="hover:underline"><span className="text-slate-900">{s.user.name}</span><span className="block text-xs text-slate-500">{s.user.email}</span></Link> : '—') },
              { key: 'plan', label: 'Plan', render: (s) => <div><p>{s.planName}</p>{s.planName !== s.tier && <p className="text-xs text-slate-500">unlocks {s.tier}</p>}</div> },
              { key: 'source', label: 'How', render: (s) => <div><p className="text-xs">{s.source.replace('_', ' ')}{s.amount ? ` · ${money(s.amount)}` : ''}</p>{s.grantedBy && <p className="text-xs text-slate-500">by {s.grantedBy.email}</p>}</div> },
              { key: 'period', label: 'Bought / given → expiry', render: (s) => <span className="whitespace-nowrap">{dateOnly(s.startAt)} → {dateOnly(s.endAt)}</span> },
              { key: 'state', label: 'State', render: (s) => <StatusBadge value={s.state} /> },
              { key: 'renewed', label: 'Renewal', render: (s) => (s.renewed ? <Badge color="green">renewed</Badge> : <span className="text-xs text-slate-400">not renewed</span>) },
            ]}
          />
          <Pagination page={f.page} pages={data?.pages} total={data?.total} onPage={(page) => set({ page })} />
        </>
      )}
    </Card>
  );
}

export default function Plans() {
  const [f, set] = useFilters(SUB_DEFAULTS);
  return (
    <>
      <PageHeader title="Plans" subtitle="Plan definitions, and who has which plan." />
      <Tabs value={f.tab} onChange={(tab) => set({ tab, q: '', state: '', source: '' })} tabs={[{ value: 'plans', label: 'Plans' }, { value: 'subs', label: 'Who has which plan' }]} />
      {f.tab === 'plans' ? <PlanList /> : <Subscriptions f={f} set={set} />}
    </>
  );
}
