import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Search } from 'lucide-react';
import { api, qs } from '../lib/api';
import { useApi, useDebounced, useFilters } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { dateOnly, money, planLabel, words, plural } from '../lib/format';
import ActionDialog from '../components/ActionDialog';
import { Badge, Button, Card, ErrorBox, Field, FilterBar, Input, Modal, PageHeader, Pagination, Select, StatusBadge, Table, Tabs, Textarea, useToast } from '../components/ui';

const EMPTY = { code: '', name: '', tier: 'DIGITAL CARD', price: 0, durationDays: 365, cardLimit: 1, description: '' };

function PlanForm({ plan, tiers, onClose, onSaved }) {
  const toast = useToast();
  const [v, setV] = useState(plan || EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const edit = !!plan?._id;
  // Website plans: price, days, tier and card limit follow the website price list.
  const locked = !!plan?.fromWebsite;
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
      <Field label="Unlocks features of" hint="The app's features (AI chat, AI calls, themes) follow these three tiers.">
        <Select value={v.tier} onChange={setField('tier')} disabled={locked}>
          {tiers.map((t) => <option key={t} value={t}>{planLabel(t)}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Price before GST (₹)"><Input type="number" min={0} value={v.price} onChange={setField('price')} disabled={locked} /></Field>
        <Field label="Days"><Input type="number" min={1} max={3650} value={v.durationDays} onChange={setField('durationDays')} disabled={locked} /></Field>
        <Field label="Card limit"><Input type="number" min={0} max={1000} value={v.cardLimit} onChange={setField('cardLimit')} disabled={locked} /></Field>
      </div>
      <Field label="Description (optional)">
        <Textarea value={v.description} onChange={setField('description')} maxLength={500} />
      </Field>
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
        {locked
          ? 'This plan is on the website. Its price, length and card limit always match the website pricing page and checkout, so they can only change there.'
          : 'Custom plans are for admins to grant (offers, partners). Online checkout only sells the website plans.'}
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
  const [toggling, setToggling] = useState(null);
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const info = data?.tierInfo || {};

  return (
    <Card
      padded={false}
      title="Plans"
      subtitle="Website plans (prices before 18% GST) and custom plans admins can grant"
      actions={can('plans.manage') && <Button size="sm" onClick={() => setEditing({})}><Plus className="h-4 w-4" /> New plan</Button>}
    >
      <Table
        loading={loading}
        rows={data?.plans}
        rowKey={(p) => p._id}
        empty="No plans yet. The website plans appear here automatically; ask the developer if this list stays empty."
        columns={[
          { key: 'name', label: 'Plan', render: (p) => <div><p className="font-medium text-slate-900">{planLabel(p.name)}</p><p className="text-xs text-slate-500">{p.fromWebsite ? 'On the website' : 'Custom (admin grants only)'}</p></div> },
          { key: 'tier', label: 'Unlocks', render: (p) => { const t = info[p.tier] || {}; return <div><p>{planLabel(p.tier)}</p><p className="text-xs text-slate-500">{t.chats === 'unlimited' ? 'Unlimited' : t.chats} AI chats/month · {t.themes} theme{t.themes === 1 ? '' : 's'}{t.nfcCard ? ' · metal NFC card' : ''}</p><p className="text-xs text-slate-500">{plural(data.activeUsersByTier?.[p.tier] || 0, 'user')} on this tier now</p></div>; } },
          { key: 'price', label: 'Price', render: (p) => <div><p>{money(p.price)} <span className="text-xs text-slate-500">+ GST</span></p><p className="text-xs text-slate-500">{money(p.totalWithGst)} with 18% GST</p></div> },
          { key: 'durationDays', label: 'Length', render: (p) => (p.durationDays === 365 ? '1 year' : p.durationDays === 30 ? '1 month' : `${p.durationDays} days`) },
          { key: 'cardLimit', label: 'Cards', render: (p) => p.cardLimit },
          { key: 'isActive', label: 'Status', render: (p) => <Badge color={p.isActive ? 'green' : 'slate'}>{p.isActive ? 'Enabled' : 'Disabled'}</Badge> },
          {
            key: 'actions',
            label: '',
            render: (p) =>
              can('plans.manage') && (
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="secondary" onClick={() => setToggling(p)}>{p.isActive ? 'Disable' : 'Enable'}</Button>
                </div>
              ),
          },
        ]}
      />
      {editing && <PlanForm plan={editing._id ? editing : null} tiers={data?.tiers || []} onClose={() => setEditing(null)} onSaved={reload} />}
      {toggling && (
        <ActionDialog
          open
          onClose={() => setToggling(null)}
          title={toggling.isActive ? `Disable ${planLabel(toggling.name)}` : `Enable ${planLabel(toggling.name)}`}
          description={toggling.isActive ? 'Admins can no longer grant this plan. People who already have it keep it until it ends. The website checkout is not affected.' : 'Admins can grant this plan again.'}
          confirmLabel={toggling.isActive ? 'Disable plan' : 'Enable plan'}
          danger={toggling.isActive}
          reasonRequired={toggling.isActive}
          onSubmit={async ({ reason }) => {
            await api(`/plans/${toggling._id}/${toggling.isActive ? 'disable' : 'enable'}`, { method: 'POST', body: { reason } });
            toast(toggling.isActive ? 'Plan disabled.' : 'Plan enabled.');
            reload();
          }}
        />
      )}
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
      <FilterBar className="sm:grid-cols-4" active={[f.state, f.source].filter(Boolean).length}>
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
      </FilterBar>
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
              { key: 'plan', label: 'Plan', render: (s) => <div><p>{planLabel(s.planName)}</p>{!String(s.planName).startsWith(s.tier) && <p className="text-xs text-slate-500">unlocks {planLabel(s.tier)}</p>}</div> },
              { key: 'source', label: 'How', render: (s) => <div><p className="text-xs">{words(s.source)}{s.amount ? ` · ${money(s.amount)}` : ''}</p>{s.grantedBy && <p className="text-xs text-slate-500">by {s.grantedBy.email}</p>}</div> },
              { key: 'period', label: 'Bought / given → expiry', render: (s) => <span className="whitespace-nowrap">{dateOnly(s.startAt)} → {new Date(s.endAt).getFullYear() >= 2099 ? 'never (lifetime)' : dateOnly(s.endAt)}</span> },
              { key: 'state', label: 'State', render: (s) => <StatusBadge value={s.state} /> },
              { key: 'renewed', label: 'Renewal', render: (s) => (s.renewed ? <Badge color="green">Renewed</Badge> : <span className="text-xs text-slate-400">Not renewed</span>) },
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
