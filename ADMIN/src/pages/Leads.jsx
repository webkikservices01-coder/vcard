import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Mail, Phone } from 'lucide-react';
import { api, qs } from '../lib/api';
import { useApi, useDebounced, useFilters } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { dateTime, num } from '../lib/format';
import { Card, ErrorBox, FilterBar, Input, PageHeader, Pagination, Select, Table, Tabs, Badge, Stat, useToast } from '../components/ui';
import ExportButton from '../components/ExportButton';

const STATUSES = [['new', 'New'], ['contacted', 'Contacted'], ['closed', 'Closed']];
const TONE = { new: 'amber', contacted: 'blue', closed: 'slate' };
const SOURCE = { chatbot: 'Website chatbot', 'metal-card': 'Metal card order form', contact: 'Contact page' };

const ContactLinks = ({ email, phone }) => (
  <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs">
    {email && <a href={`mailto:${email}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-brand-500 hover:underline"><Mail className="h-3 w-3" aria-hidden="true" />{email}</a>}
    {phone && <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-brand-500 hover:underline"><Phone className="h-3 w-3" aria-hidden="true" />{phone}</a>}
  </div>
);

export default function Leads() {
  const { can } = useAuth();
  const toast = useToast();
  const [f, set] = useFilters({ tab: 'leads', q: '', status: '', page: '1' });
  const [search, setSearch] = useState(f.q);
  const q = useDebounced(search);
  useEffect(() => {
    if (q !== f.q) set({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const enquiries = f.tab === 'enquiries';
  const { data, loading, error, reload } = useApi(enquiries ? `/leads/enquiries${qs({ q: f.q, page: f.page, limit: 25 })}` : `/leads${qs({ q: f.q, status: f.status, page: f.page, limit: 25 })}`);

  const update = async (lead, status) => {
    try {
      await api(`/leads/${lead._id}`, { method: 'PUT', body: { status } });
      toast(`Marked as ${status}.`);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const c = data?.counts || {};
  const leadColumns = [
    {
      key: 'name',
      label: 'Lead',
      primary: true,
      render: (l) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-950">{l.name}{l.businessName ? <span className="font-normal text-slate-500"> · {l.businessName}</span> : null}</p>
          <ContactLinks email={l.email} phone={l.phone} />
        </div>
      ),
    },
    { key: 'createdAt', label: 'When', render: (l) => <span className="whitespace-nowrap">{dateTime(l.createdAt)}</span> },
    { key: 'source', label: 'From', render: (l) => <span className="text-xs">{SOURCE[l.source] || l.source || 'Website chatbot'}</span> },
    { key: 'need', label: 'Needs', wide: true, render: (l) => <div className="max-w-xs text-xs"><p className="text-slate-800">{l.need || '—'}</p>{(l.budget || l.timeline) && <p className="mt-0.5 text-slate-500">{[l.budget, l.timeline].filter(Boolean).join(' · ')}</p>}{l.message && <p className="mt-1 whitespace-pre-line text-slate-600">{l.message}</p>}</div> },
    {
      key: 'status',
      label: 'Status',
      render: (l) =>
        can('leads.update') ? (
          <Select value={l.status} onChange={(e) => update(l, e.target.value)} className="h-8 w-32 text-xs" aria-label={`Status of ${l.name}`}>
            {STATUSES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </Select>
        ) : (
          <Badge color={TONE[l.status]}>{STATUSES.find(([v]) => v === l.status)?.[1] || l.status}</Badge>
        ),
    },
  ];
  const enquiryColumns = [
    { key: 'name', label: 'Visitor', primary: true, render: (e) => <div><p className="font-medium text-slate-950">{e.name}</p><ContactLinks email={e.email} phone={e.phone} /></div> },
    { key: 'createdAt', label: 'When', render: (e) => <span className="whitespace-nowrap">{dateTime(e.createdAt)}</span> },
    { key: 'card', label: 'Sent to card', render: (e) => (e.card ? <span><span className="text-slate-900">{e.card.name || e.card.username}</span><span className="block text-xs text-brand-600">/{e.card.username}</span>{e.card.ownerId && <Link to={`/users/${e.card.ownerId}`} className="text-xs text-slate-500 hover:underline">owner</Link>}</span> : 'Deleted card') },
    { key: 'message', label: 'Message', wide: true, render: (e) => <p className="max-w-sm whitespace-pre-line text-xs text-slate-700">{e.message}</p> },
    { key: 'read', label: 'Owner read it', render: (e) => (e.read ? <Badge color="green">Yes</Badge> : <Badge color="slate">Not yet</Badge>) },
  ];

  return (
    <>
      <PageHeader
        title="Leads & enquiries"
        subtitle={enquiries ? 'Messages visitors sent to card owners through the form on a card. The owner gets each one by email.' : 'People who asked the Aicardly team to contact them: website chatbot, contact page and metal card order form.'}
        actions={can('export.csv') && !enquiries && <ExportButton path="/leads/export" params={{ q: f.q, status: f.status }} what="the leads list" />}
      />
      <Tabs
        value={f.tab}
        onChange={(tab) => { setSearch(''); set({ tab, q: '', status: '' }); }}
        tabs={[{ value: 'leads', label: 'Leads for the team' }, { value: 'enquiries', label: 'Enquiries to card owners' }]}
      />
      {!enquiries && (
        <div className="mb-4 grid grid-cols-3 gap-3">
          <Stat label="New, to contact" value={num(c.new)} />
          <Stat label="Contacted" value={num(c.contacted)} />
          <Stat label="Closed" value={num(c.closed)} />
        </div>
      )}
      <Card padded={false}>
        <FilterBar className="sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={enquiries ? 'Visitor, card or message' : 'Name, email, phone, business or message'} className="pl-9" aria-label="Search" />
          </div>
          {!enquiries && (
            <Select value={f.status} onChange={(e) => set({ status: e.target.value })} aria-label="Status">
              <option value="">All leads</option>
              {STATUSES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </Select>
          )}
        </FilterBar>
        {error ? (
          <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div>
        ) : (
          <>
            <Table loading={loading} rows={enquiries ? data?.enquiries : data?.leads} rowKey={(l) => l._id || l.id} empty={enquiries ? 'No enquiries yet.' : 'No leads match.'} columns={enquiries ? enquiryColumns : leadColumns} />
            <Pagination page={f.page} pages={data?.pages} total={data?.total} onPage={(page) => set({ page })} />
          </>
        )}
      </Card>
    </>
  );
}
