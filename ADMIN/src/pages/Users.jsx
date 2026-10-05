import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Search, UserPlus, Wand2, Ban, CheckCircle2, UserX, RotateCcw, Trash2, X } from 'lucide-react';
import { useApi, useDebounced, useFilters } from '../lib/hooks';
import { qs, downloadUrl } from '../lib/api';
import { useAuth } from '../lib/auth';
import { dateOnly, money } from '../lib/format';
import { Button, Card, ErrorBox, Field, Input, PageHeader, Pagination, Select, StatusBadge, Table, Badge, useToast } from '../components/ui';
import ActionDialog from '../components/ActionDialog';
import { api } from '../lib/api';

const DEFAULTS = { q: '', status: '', plan: '', from: '', to: '', sort: 'createdAt', order: 'desc', page: '1' };

export default function UsersPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [f, set] = useFilters(DEFAULTS);
  const [search, setSearch] = useState(f.q);
  // The search bar at the top can change ?q= while this page is open.
  const [lastQ, setLastQ] = useState(f.q);
  if (f.q !== lastQ) {
    setLastQ(f.q);
    setSearch(f.q);
  }
  const q = useDebounced(search);
  useEffect(() => {
    if (q !== f.q) set({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const params = { ...f, limit: 25 };
  const { data, loading, error, reload } = useApi(`/users${qs(params)}`);
  const plans = useApi('/plans');
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [nu, setNu] = useState({ name: '', email: '', phone: '', password: '', emailVerified: true });
  const setNuField = (k) => (e) => setNu((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const genPassword = () => {
    const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#%';
    setNu((x) => ({ ...x, password: Array.from(crypto.getRandomValues(new Uint8Array(14)), (b) => abc[b % abc.length]).join('') }));
  };
  const createUser = async ({ reason }) => {
    const res = await api('/users', { method: 'POST', body: { ...nu, reason } });
    toast(res.msg);
    setNu({ name: '', email: '', phone: '', password: '', emailVerified: true });
    navigate(`/users/${res.id}`);
  };

  // Bulk selection: id → email. Kept while you open a user and come back, change page or
  // filters (saved for this browser tab); cleared only by "Clear" or after a bulk action.
  const SEL_KEY = 'aicardly_admin_user_sel';
  const [sel, setSelState] = useState(() => {
    try {
      return new Map(JSON.parse(sessionStorage.getItem(SEL_KEY) || '[]'));
    } catch {
      return new Map();
    }
  });
  const setSel = (next) => {
    setSelState(next);
    try {
      if (next.size) sessionStorage.setItem(SEL_KEY, JSON.stringify([...next]));
      else sessionStorage.removeItem(SEL_KEY);
    } catch {
      /* storage blocked: selection just isn't remembered */
    }
  };
  const [bulk, setBulk] = useState(null); // block | unblock | remove | restore | purge
  const rows = data?.users || [];
  const allOn = rows.length > 0 && rows.every((u) => sel.has(u.id));
  const toggle = (u) => {
    const n = new Map(sel);
    if (n.has(u.id)) n.delete(u.id);
    else n.set(u.id, u.email);
    setSel(n);
  };
  const togglePage = () => {
    const n = new Map(sel);
    if (allOn) rows.forEach((u) => n.delete(u.id));
    else rows.forEach((u) => n.set(u.id, u.email));
    setSel(n);
  };
  const canBulk = can('users.block') || can('users.delete') || can('users.purge');
  const runBulk = async ({ reason }) => {
    const res = await api('/users/bulk', { method: 'POST', body: { ids: [...sel.keys()], action: bulk, reason, confirm: bulk === 'purge' ? `DELETE ${sel.size}` : '' } });
    toast(res.msg, res.failed?.length ? 'error' : 'success');
    setSel(new Map());
    reload();
  };
  const BULK = {
    block: { title: 'Block users', desc: 'They are signed out at once and cannot sign in or create cards until unblocked.', label: 'Block', danger: true },
    unblock: { title: 'Unblock users', desc: 'They can sign in again.', label: 'Unblock', reasonRequired: false },
    remove: { title: 'Remove users', desc: 'Soft delete: the accounts cannot be used and their public cards are hidden. You can restore them later.', label: 'Remove', danger: true },
    restore: { title: 'Restore users', desc: 'Their accounts and public cards come back.', label: 'Restore', reasonRequired: false },
    purge: { title: 'Delete permanently', desc: 'Deletes the accounts, their cards and everything on them. This cannot be undone. Payment records are kept for accounting.', label: 'Delete forever', danger: true },
  };

  const columns = [
    ...(canBulk
      ? [{
          key: 'pick',
          label: <input type="checkbox" aria-label="Select all users on this page" checked={allOn} onChange={togglePage} className="h-4 w-4 cursor-pointer accent-pink-600" />,
          className: 'w-12',
          // The whole cell toggles the tick (a near miss must not open the user's page).
          render: (u) => (
            <label onClick={(e) => e.stopPropagation()} className="-mx-4 -my-3 flex min-h-[60px] cursor-pointer items-start px-4 py-3">
              <input type="checkbox" aria-label={`Select ${u.email}`} checked={sel.has(u.id)} onChange={() => toggle(u)} className="h-4 w-4 cursor-pointer accent-pink-600" />
            </label>
          ),
        }]
      : []),
    {
      key: 'name',
      label: 'User',
      render: (u) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{u.name}</p>
          <p className="text-xs text-slate-500">{u.email}</p>
          {u.phone && <p className="text-xs text-slate-500">{u.phone}</p>}
        </div>
      ),
    },
    { key: 'createdAt', label: 'Signed up', render: (u) => dateOnly(u.createdAt) },
    {
      key: 'plan',
      label: 'Plan',
      render: (u) => (
        <div>
          <p className="text-slate-900">{u.planName}</p>
          {u.planActive && <p className="text-xs text-slate-500">{u.planStart ? `${dateOnly(u.planStart)} → ` : 'until '}{dateOnly(u.planExpiry)}</p>}
        </div>
      ),
    },
    { key: 'cardsCount', label: 'Cards', className: 'text-right', render: (u) => u.cardsCount },
    { key: 'totalPaid', label: 'Paid', className: 'text-right', render: (u) => money(u.totalPaid) },
    {
      key: 'status',
      label: 'Status',
      render: (u) => (
        <div className="flex flex-wrap gap-1">
          <StatusBadge value={u.status} />
          {u.emailVerified === false && <Badge color="amber">unverified</Badge>}
          {u.freeCardCredits > 0 && <Badge color="pink">{u.freeCardCredits} credit{u.freeCardCredits > 1 ? 's' : ''}</Badge>}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Everyone who signed up on the site."
        actions={
          <>
          {can('users.create') && (
            <Button onClick={() => setCreating(true)}>
              <UserPlus className="h-4 w-4" aria-hidden="true" /> New user
            </Button>
          )}
          {can('export.csv') && (
            <a href={downloadUrl('/users/export', { ...f, page: undefined })} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-surface px-4 text-sm font-medium text-slate-800 hover:bg-slate-50">
              <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
            </a>
          )}
          </>
        }
      />
      <Card padded={false}>
        <div className="grid gap-2 border-b border-slate-100 p-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email or phone" className="pl-9" aria-label="Search users" />
          </div>
          <Select value={f.status} onChange={(e) => set({ status: e.target.value })} aria-label="Status">
            <option value="">Active + blocked</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="removed">Removed</option>
            <option value="all">All (incl. removed)</option>
          </Select>
          <Select value={f.plan} onChange={(e) => set({ plan: e.target.value })} aria-label="Plan">
            <option value="">Any plan</option>
            <option value="paid">Any running plan</option>
            <option value="free">Free / expired</option>
            {(plans.data?.tiers || []).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
          <Input type="date" value={f.from ? f.from.slice(0, 10) : ''} onChange={(e) => set({ from: e.target.value })} aria-label="Signed up from" title="Signed up from" />
          <Input type="date" value={f.to ? f.to.slice(0, 10) : ''} onChange={(e) => set({ to: e.target.value ? `${e.target.value}T23:59:59` : '' })} aria-label="Signed up until" title="Signed up until" />
          <Select value={`${f.sort}:${f.order}`} onChange={(e) => { const [sort, order] = e.target.value.split(':'); set({ sort, order }); }} aria-label="Sort" className="lg:col-span-2">
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="name:asc">Name A–Z</option>
            <option value="email:asc">Email A–Z</option>
            <option value="planExpiry:desc">Plan ends last</option>
            <option value="planExpiry:asc">Plan ends first</option>
          </Select>
        </div>
        {error ? (
          <div className="p-4">
            <ErrorBox error={error} onRetry={reload} />
          </div>
        ) : (
          <>
            {sel.size > 0 && (
              <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-slate-200 bg-surface-2 px-4 py-2.5 text-sm">
                <span className="mr-1 font-semibold text-slate-900">{sel.size} selected</span>
                {can('users.block') && <Button size="sm" variant="secondary" onClick={() => setBulk('block')}><Ban className="h-3.5 w-3.5" /> Block</Button>}
                {can('users.block') && <Button size="sm" variant="secondary" onClick={() => setBulk('unblock')}><CheckCircle2 className="h-3.5 w-3.5" /> Unblock</Button>}
                {can('users.delete') && <Button size="sm" variant="secondary" onClick={() => setBulk('remove')}><UserX className="h-3.5 w-3.5" /> Remove</Button>}
                {can('users.delete') && <Button size="sm" variant="secondary" onClick={() => setBulk('restore')}><RotateCcw className="h-3.5 w-3.5" /> Restore</Button>}
                {can('users.purge') && <Button size="sm" variant="danger" onClick={() => setBulk('purge')}><Trash2 className="h-3.5 w-3.5" /> Delete permanently</Button>}
                <button type="button" onClick={() => setSel(new Map())} className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"><X className="h-3.5 w-3.5" /> Clear</button>
              </div>
            )}
            <Table columns={columns} rows={data?.users} loading={loading} empty="No users match these filters." onRowClick={(u) => navigate(`/users/${u.id}`)} />
            <Pagination page={f.page} pages={data?.pages} total={data?.total} onPage={(page) => set({ page })} />
          </>
        )}
      </Card>

      {bulk && (
        <ActionDialog
          open
          onClose={() => setBulk(null)}
          title={`${BULK[bulk].title} (${sel.size})`}
          description={
            <>
              {BULK[bulk].desc}
              <span className="mt-2 block max-h-28 overflow-y-auto rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                {[...sel.values()].join(', ')}
              </span>
            </>
          }
          confirmLabel={BULK[bulk].label}
          danger={BULK[bulk].danger}
          reasonRequired={BULK[bulk].reasonRequired !== false}
          confirmText={bulk === 'purge' ? `DELETE ${sel.size}` : undefined}
          onSubmit={runBulk}
        />
      )}

      <ActionDialog
        open={creating}
        onClose={() => setCreating(false)}
        title="New user"
        description="Creates an Aicardly account for a customer. Leave the password empty to email them a link to choose their own (valid 1 hour); they then build their card, or you do it for them with “Sign in as user”."
        confirmLabel="Create account"
        reasonRequired={false}
        reasonLabel="Note (saved in the audit log, optional)"
        canSubmit={nu.name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(nu.email.trim()) && (!nu.password || nu.password.length >= 8)}
        onSubmit={createUser}
      >
        <Field label="Full name">
          <Input value={nu.name} onChange={setNuField('name')} maxLength={80} autoComplete="off" />
        </Field>
        <Field label="Email (used to sign in)">
          <Input type="email" value={nu.email} onChange={setNuField('email')} maxLength={200} autoComplete="off" />
        </Field>
        <Field label="Mobile / WhatsApp (optional)" hint="With country code, e.g. +91 98123 45678.">
          <Input type="tel" value={nu.phone} onChange={setNuField('phone')} maxLength={30} autoComplete="off" />
        </Field>
        <Field label="Password (optional)" hint="Empty = they get an email to set it. At least 8 characters.">
          <div className="flex gap-2">
            <Input value={nu.password} onChange={setNuField('password')} maxLength={128} autoComplete="new-password" className="font-mono" />
            <Button type="button" variant="secondary" onClick={genPassword} aria-label="Generate a strong password"><Wand2 className="h-4 w-4" /></Button>
          </div>
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={nu.emailVerified} onChange={setNuField('emailVerified')} /> Email already verified (they can sign in straight away)
        </label>
      </ActionDialog>
    </>
  );
}
