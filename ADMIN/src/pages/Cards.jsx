import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, EyeOff, Eye, ExternalLink, Link2, Search, Trash2 } from 'lucide-react';
import { useApi, useDebounced, useFilters } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { useAuth } from '../lib/auth';
import { dateTime, num, plural } from '../lib/format';
import { Badge, Button, Card, DefList, ErrorBox, Field, FilterBar, Input, Modal, PageHeader, Pagination, Select, Spinner, StatusBadge, Table, useToast } from '../components/ui';
import ActionDialog from '../components/ActionDialog';
import ExportButton from '../components/ExportButton';

const DEFAULTS = { q: '', payment: '', delivered: '', owner: '', visibility: '', from: '', to: '', sort: 'createdAt', order: 'desc', page: '1' };

// Template ids as names.
const TEMPLATE = {
  'webkik-signature': 'Webkik Signature', 'aurora-ai': 'Aurora AI', 'minimal-pro': 'Minimal Pro', 'luxe-noir': 'Luxe Noir', 'split-hero-corporate': 'Split Hero',
  'neo-brutal': 'Neo Brutal', 'soft-bento-wellness': 'Soft Bento', 'creator-reel': 'Creator Reel', 'dev-terminal': 'Dev Terminal', 'editorial-architect': 'Editorial',
};
const templateName = (id) => TEMPLATE[id] || id || '—';

function Visibility({ c }) {
  if (c.hidden) return <Badge color="red">Hidden by admin</Badge>;
  if (c.ownerDeleted) return <Badge color="red">Owner deleted</Badge>;
  if (c.owner?.status === 'removed') return <Badge color="slate">Owner removed</Badge>;
  return <Badge color="green">Live</Badge>;
}

export default function Cards() {
  const { can } = useAuth();
  const toast = useToast();
  const [f, set] = useFilters(DEFAULTS);
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(f.q);
  const q = useDebounced(search);
  useEffect(() => {
    if (q !== f.q) set({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const { data, loading, error, reload } = useApi(`/cards${qs({ ...f, limit: 25 })}`);
  const openId = params.get('open') || '';
  const setOpen = (id) => {
    const p = new URLSearchParams(params);
    if (id) p.set('open', id);
    else p.delete('open');
    setParams(p, { replace: true });
  };
  const [cleanup, setCleanup] = useState(false);

  const sortBy = (key) => set({ sort: key, order: f.sort === key && f.order === 'desc' ? 'asc' : 'desc' });
  const arrow = (key) => (f.sort === key ? (f.order === 'desc' ? ' ↓' : ' ↑') : '');
  const head = (key, label) => (
    <button type="button" onClick={() => sortBy(key)} className="uppercase tracking-wider hover:text-slate-900">
      {label}{arrow(key)}
    </button>
  );

  const columns = [
    {
      key: 'card',
      label: head('name', 'Card'),
      primary: true,
      render: (c) => (
        <div className="flex items-start gap-3">
          {c.previewImage || c.profilePic ? (
            <img src={c.previewImage || c.profilePic} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" loading="lazy" />
          ) : (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs text-slate-400">—</span>
          )}
          <div className="min-w-0">
            <p className="font-medium text-slate-900">{c.name || c.username}</p>
            <p className="text-xs text-slate-500">{[c.designation, c.company].filter(Boolean).join(' · ') || '—'}</p>
            <p className="text-xs text-brand-600">/{c.username}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Visibility c={c} />
              {!c.validLink && <Badge color="amber">Link needs fixing</Badge>}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Created by',
      render: (c) =>
        c.owner ? (
          <Link to={`/users/${c.owner.id}`} onClick={(e) => e.stopPropagation()} className="block hover:underline">
            <span className="text-slate-900">{c.owner.name}</span>
            <span className="block text-xs text-slate-500">{c.owner.email}</span>
          </Link>
        ) : (
          <span className="text-slate-400">Deleted account</span>
        ),
    },
    { key: 'createdAt', label: head('createdAt', 'Created'), render: (c) => <span className="whitespace-nowrap">{dateTime(c.createdAt)}</span> },
    { key: 'theme', label: 'Template', mobile: false, render: (c) => <span className="text-xs">{templateName(c.theme)}</span> },
    { key: 'payment', label: 'Card order', render: (c) => <StatusBadge value={c.paymentStatus} /> },
    { key: 'views', label: head('views', 'Views'), className: 'text-right', render: (c) => num(c.views) },
  ];

  return (
    <>
      <PageHeader
        title="Cards"
        subtitle="Every card, who made it, whether it is live, and its card order."
        actions={can('export.csv') && <ExportButton path="/cards/export" params={f} what="the cards list" />}
      />

      {data?.orphans > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-[14rem] flex-1">
            {plural(data.orphans, 'card')} belong{data.orphans === 1 ? 's' : ''} to accounts that were deleted. They are no longer shown on the site, but their data is still stored.
          </span>
          <Button size="sm" variant="secondary" onClick={() => set({ owner: 'deleted' })}>Show them</Button>
          {can('users.purge') && (
            <Button size="sm" variant="danger" onClick={() => setCleanup(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete them
            </Button>
          )}
        </div>
      )}

      <Card padded={false}>
        <FilterBar className="sm:grid-cols-2 lg:grid-cols-6" active={[f.payment, f.delivered, f.owner, f.visibility, f.from].filter(Boolean).length}>
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Card link, name, company, owner" className="pl-9" aria-label="Search cards" />
          </div>
          <Select value={f.visibility} onChange={(e) => set({ visibility: e.target.value })} aria-label="Visible on the site">
            <option value="">Live or not</option>
            <option value="public">Live on the site</option>
            <option value="hidden">Hidden by admin</option>
          </Select>
          <Select value={f.owner} onChange={(e) => set({ owner: e.target.value })} aria-label="Owner">
            <option value="">Any owner</option>
            <option value="active">Active owner</option>
            <option value="blocked">Blocked owner</option>
            <option value="removed">Removed owner</option>
            <option value="deleted">Deleted account</option>
          </Select>
          <Select value={f.payment} onChange={(e) => set({ payment: e.target.value })} aria-label="Card order">
            <option value="">Any card order</option>
            <option value="none">No order yet</option>
            <option value="PENDING_PAYMENT">Pending</option>
            <option value="PAID">Paid</option>
            <option value="EXPIRED">Expired</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
          <Select value={`${f.sort}:${f.order}`} onChange={(e) => { const [sort, order] = e.target.value.split(':'); set({ sort, order }); }} aria-label="Sort">
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="views:desc">Most views</option>
            <option value="name:asc">Name A–Z</option>
            <option value="username:asc">Link A–Z</option>
          </Select>
        </FilterBar>
        {error ? (
          <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div>
        ) : (
          <>
            <Table columns={columns} rows={data?.cards} loading={loading} empty="No cards match these filters." onRowClick={(c) => setOpen(c.id)} />
            <Pagination page={f.page} pages={data?.pages} total={data?.total} onPage={(page) => set({ page })} />
          </>
        )}
      </Card>

      {openId && <CardDetail id={openId} onClose={() => setOpen('')} onChanged={reload} />}

      <ActionDialog
        open={cleanup}
        onClose={() => setCleanup(false)}
        title={`Delete ${plural(data?.orphans || 0, 'card')} of deleted accounts`}
        description="Deletes these cards and everything on them (services, gallery, enquiries, chats). Their accounts are already gone, so nobody can use them. This can't be undone."
        confirmLabel="Delete cards"
        danger
        confirmText="DELETE"
        onSubmit={async ({ reason }) => {
          const res = await api('/cards/cleanup-orphans', { method: 'POST', body: { reason } });
          toast(res.msg);
          reload();
        }}
      />
    </>
  );
}

function CardDetail({ id, onClose, onChanged }) {
  const { can } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useApi(`/cards/${id}`);
  const [dialog, setDialog] = useState(null);
  const [link, setLink] = useState('');
  const c = data?.card;
  const done = () => {
    reload();
    onChanged();
  };
  return (
    <Modal open title={c ? c.name || `/${c.username}` : 'Card'} onClose={onClose} wide>
      {loading && !c ? (
        <Spinner />
      ) : error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Visibility c={c} />
            {!c.validLink && <Badge color="amber">Link needs fixing</Badge>}
            <a href={c.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
              aicardly.com/{c.username} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
          {c.hidden && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">Hidden {dateTime(c.hiddenAt)}{c.hiddenReason ? `: ${c.hiddenReason}` : ''}. Visitors see “not found”.</p>}
          <DefList
            items={[
              ['Name on card', c.name || '—'],
              ['Role', [c.designation, c.company].filter(Boolean).join(' · ') || '—'],
              ['Owner', c.owner ? <Link key="o" to={`/users/${c.owner.id}`} className="text-brand-600 hover:underline">{c.owner.name} ({c.owner.email})</Link> : 'Deleted account'],
              ['Template', templateName(c.theme)],
              ['Created', dateTime(c.createdAt)],
              ['Last edited', dateTime(c.updatedAt)],
              ['Views / QR scans', `${num(c.views)} / ${num(c.scans)}`],
              ['Card order', <StatusBadge key="p" value={c.paymentStatus} />],
              ['Content', `${c.counts.Product} services/products · ${c.counts.Portfolio} portfolio · ${c.counts.Gallery} gallery · ${c.counts.Testimonial} testimonials`],
              ['Enquiries received', num(c.counts.Enquiry)],
            ]}
          />
          {c.links?.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Contact links on the card</p>
              <ul className="space-y-1 text-sm">
                {c.links.slice(0, 12).map((l, i) => (
                  <li key={i} className="break-all text-slate-700"><span className="text-slate-500">{l.title || l.type}:</span> {l.url}</li>
                ))}
              </ul>
            </div>
          )}
          {c.bio && <p className="whitespace-pre-line rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{c.bio}</p>}
          {can('cards.moderate') && (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              {c.hidden ? (
                <Button variant="secondary" onClick={() => setDialog('show')}><Eye className="h-4 w-4" /> Show on the site again</Button>
              ) : (
                <Button variant="danger" onClick={() => setDialog('hide')}><EyeOff className="h-4 w-4" /> Hide this card</Button>
              )}
              <Button variant="secondary" onClick={() => { setLink(c.validLink ? c.username : c.username.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')); setDialog('link'); }}>
                <Link2 className="h-4 w-4" /> Change link
              </Button>
            </div>
          )}
        </>
      )}
      <ActionDialog
        open={dialog === 'hide'}
        onClose={() => setDialog(null)}
        title="Hide this card"
        description="The card stays in the owner's dashboard, but anyone opening the link sees “not found” until you show it again. Use it for wrong, abusive or reported cards."
        confirmLabel="Hide card"
        danger
        onSubmit={async ({ reason }) => {
          const res = await api(`/cards/${id}/visibility`, { method: 'POST', body: { hidden: true, reason } });
          toast(res.msg);
          done();
        }}
      />
      <ActionDialog
        open={dialog === 'show'}
        onClose={() => setDialog(null)}
        title="Show this card again"
        confirmLabel="Show card"
        onSubmit={async ({ reason }) => {
          const res = await api(`/cards/${id}/visibility`, { method: 'POST', body: { hidden: false, reason } });
          toast(res.msg);
          done();
        }}
      />
      <ActionDialog
        open={dialog === 'link'}
        onClose={() => setDialog(null)}
        title="Change the card link"
        description="The old link stops working. Tell the owner, and reprint any QR code that used it."
        confirmLabel="Change link"
        canSubmit={/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(link) && link.length >= 3 && link !== c?.username}
        onSubmit={async ({ reason }) => {
          const res = await api(`/cards/${id}/link`, { method: 'POST', body: { username: link, reason } });
          toast(res.msg);
          done();
        }}
      >
        <Field label="New link" hint="3–30 lowercase letters, numbers or hyphens.">
          <div className="flex items-center gap-1 text-sm text-slate-500">
            aicardly.com/
            <Input value={link} onChange={(e) => setLink(e.target.value.toLowerCase())} maxLength={30} autoComplete="off" />
          </div>
        </Field>
      </ActionDialog>
    </Modal>
  );
}
