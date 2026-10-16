import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Star, Trash2 } from 'lucide-react';
import { api, qs } from '../lib/api';
import { useApi, useDebounced, useFilters } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { dateOnly } from '../lib/format';
import { Badge, Button, Card, ErrorBox, Field, FilterBar, Input, Modal, PageHeader, Pagination, Table, Tabs, Textarea, useToast } from '../components/ui';
import ActionDialog from '../components/ActionDialog';

// Customer stories on aicardly.com (only published + consented ones show), and the reviews on
// customers' cards, which the team can remove when they're unsuitable.
const EMPTY = { name: '', role: '', company: '', quote: '', rating: 5, photo: '', cardLink: '', consent: false, published: false, order: 0 };
const Stars = ({ n }) => <span className="inline-flex text-amber-500" aria-label={`${n} stars`}>{Array.from({ length: n || 0 }, (_, i) => <Star key={i} className="h-3 w-3 fill-current" aria-hidden="true" />)}</span>;

function Stories() {
  const { can } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useApi('/content/testimonials');
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const manage = can('content.manage');
  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const save = async () => {
    setBusy(true);
    try {
      const body = { name: edit.name, role: edit.role, company: edit.company, quote: edit.quote, rating: Number(edit.rating) || 5, photo: edit.photo, cardLink: edit.cardLink, consent: !!edit.consent, published: !!edit.published, order: Number(edit.order) || 0 };
      await api(edit._id ? `/content/testimonials/${edit._id}` : '/content/testimonials', { method: edit._id ? 'PUT' : 'POST', body });
      toast(body.published ? 'Saved and shown on the website.' : 'Saved (not shown on the website).');
      setEdit(null);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  const remove = async (t) => {
    if (!window.confirm(`Delete the story from ${t.name}?`)) return;
    try {
      await api(`/content/testimonials/${t._id}`, { method: 'DELETE' });
      toast('Deleted.');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  };
  const columns = [
    { key: 'name', label: 'Customer', primary: true, render: (t) => <div><p className="font-medium text-slate-950">{t.name}</p><p className="text-xs text-slate-500">{[t.role, t.company].filter(Boolean).join(', ')}</p></div> },
    { key: 'quote', label: 'Story', wide: true, render: (t) => <div className="max-w-md text-xs"><Stars n={t.rating} /><p className="mt-1 text-slate-700">“{t.quote}”</p>{t.cardLink && <p className="mt-1 text-brand-600">aicardly.com{t.cardLink}</p>}</div> },
    { key: 'state', label: 'On the website', render: (t) => (t.published ? <Badge color="green">Shown</Badge> : <Badge color="slate">Hidden</Badge>) },
    { key: 'consent', label: 'Consent', render: (t) => (t.consent ? <Badge color="green">Yes</Badge> : <Badge color="amber">Not yet</Badge>) },
    { key: 'actions', label: '', render: (t) => manage && <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}><Button size="sm" variant="secondary" onClick={() => setEdit({ ...EMPTY, ...t })}>Edit</Button><Button size="sm" variant="ghost" onClick={() => remove(t)} aria-label={`Delete ${t.name}`}><Trash2 className="h-3.5 w-3.5" /></Button></div> },
  ];
  return (
    <>
      <Card padded={false} title="Customer stories on aicardly.com" subtitle="Shown on the home page only when published and the customer agreed. Use real customers with their consent." actions={manage && <Button size="sm" onClick={() => setEdit({ ...EMPTY })}><Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add a story</Button>}>
        {error ? <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div> : <Table loading={loading} rows={data?.testimonials} rowKey={(t) => t._id} empty="No stories yet. Add a real customer's words (with their consent) to show them on the home page." columns={columns} />}
      </Card>
      {edit && (
        <Modal open wide title={edit._id ? `Edit story from ${edit.name}` : 'Add a customer story'} onClose={() => setEdit(null)} footer={<><Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save} loading={busy} disabled={edit.name.trim().length < 2 || edit.quote.trim().length < 10}>Save</Button></>}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Customer name *"><Input value={edit.name} onChange={set('name')} maxLength={80} /></Field>
            <Field label="Role"><Input value={edit.role} onChange={set('role')} maxLength={80} placeholder="Founder" /></Field>
            <Field label="Company"><Input value={edit.company} onChange={set('company')} maxLength={120} /></Field>
            <Field label="Rating"><Input type="number" min={1} max={5} value={edit.rating} onChange={set('rating')} /></Field>
            <Field label="Their words *" hint="10–600 characters, exactly as they said it" className="sm:col-span-2"><Textarea value={edit.quote} onChange={set('quote')} maxLength={600} /></Field>
            <Field label="Photo link (https)"><Input value={edit.photo} onChange={set('photo')} maxLength={500} placeholder="https://…" /></Field>
            <Field label="Their Aicardly card" hint="e.g. /citi-glass (shown as a live example)"><Input value={edit.cardLink} onChange={set('cardLink')} maxLength={120} /></Field>
            <Field label="Order (lower shows first)"><Input type="number" min={0} value={edit.order} onChange={set('order')} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={edit.consent} onChange={set('consent')} className="h-4 w-4 accent-brand-600" /> The customer agreed to be shown on the website</label>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={edit.published} onChange={set('published')} disabled={!edit.consent} className="h-4 w-4 accent-brand-600" /> Show it on the website</label>
        </Modal>
      )}
    </>
  );
}

function Reviews() {
  const { can } = useAuth();
  const toast = useToast();
  const [f, set] = useFilters({ tab: 'reviews', q: '', page: '1' });
  const [search, setSearch] = useState(f.q);
  const q = useDebounced(search);
  useEffect(() => {
    if (q !== f.q) set({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const { data, loading, error, reload } = useApi(`/content/reviews${qs({ q: f.q, page: f.page, limit: 25 })}`);
  const [removing, setRemoving] = useState(null);
  const columns = [
    { key: 'name', label: 'Review by', primary: true, render: (r) => <div><p className="font-medium text-slate-950">{r.name}</p><Stars n={r.rating} /></div> },
    { key: 'review', label: 'Review', wide: true, render: (r) => <p className="max-w-md whitespace-pre-line text-xs text-slate-700">{r.review}</p> },
    { key: 'card', label: 'On card', render: (r) => (r.card ? <span><span className="text-slate-900">{r.card.name || r.card.username}</span><a href={`https://aicardly.com/${r.card.username}`} target="_blank" rel="noreferrer noopener" className="block text-xs text-brand-600">/{r.card.username}</a>{r.card.ownerId && <Link to={`/users/${r.card.ownerId}`} className="text-xs text-slate-500 hover:underline">owner</Link>}</span> : 'Deleted card') },
    { key: 'createdAt', label: 'Added', render: (r) => dateOnly(r.createdAt) },
    { key: 'actions', label: '', render: (r) => can('content.manage') && <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setRemoving(r); }}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove</Button> },
  ];
  return (
    <Card padded={false} title="Reviews on customers' cards" subtitle="Card owners add these themselves. Remove a review that is fake, unrelated or a complaint shown as a 5-star review.">
      <FilterBar className="sm:grid-cols-1">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Card link, owner, reviewer or words in the review" className="pl-9" aria-label="Search reviews" />
        </div>
      </FilterBar>
      {error ? <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div> : (
        <>
          <Table loading={loading} rows={data?.reviews} rowKey={(r) => r.id} empty="No reviews match." columns={columns} />
          <Pagination page={f.page} pages={data?.pages} total={data?.total} onPage={(page) => set({ page })} />
        </>
      )}
      <ActionDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="Remove this review"
        danger
        confirmLabel="Remove review"
        description={removing && `Removes the review by ${removing.name} from /${removing.card?.username}. The card owner can add it again.`}
        onSubmit={async ({ reason }) => {
          await api(`/content/reviews/${removing.id}`, { method: 'DELETE', body: { reason } });
          toast('Review removed.');
          reload();
        }}
      />
    </Card>
  );
}

export default function Content() {
  const [f, set] = useFilters({ tab: 'stories' });
  return (
    <>
      <PageHeader title="Testimonials & content" subtitle="What customers say: stories on aicardly.com and reviews on their cards." />
      <Tabs value={f.tab} onChange={(tab) => set({ tab, q: '', page: '1' })} tabs={[{ value: 'stories', label: 'Website stories' }, { value: 'reviews', label: 'Reviews on cards' }]} />
      {f.tab === 'reviews' ? <Reviews /> : <Stories />}
    </>
  );
}
