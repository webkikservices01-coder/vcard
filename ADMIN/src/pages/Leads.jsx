import { useEffect, useState } from 'react';
import { Download, Search, Mail, Phone } from 'lucide-react';
import { api, qs, downloadUrl } from '../lib/api';
import { useApi, useDebounced, useFilters } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { dateTime, num } from '../lib/format';
import { Card, ErrorBox, Input, PageHeader, Pagination, Select, Table, Badge, Stat, useToast } from '../components/ui';

const STATUSES = ['new', 'contacted', 'closed'];
const TONE = { new: 'amber', contacted: 'blue', closed: 'slate' };

export default function Leads() {
  const { can } = useAuth();
  const toast = useToast();
  const [f, set] = useFilters({ q: '', status: '', page: '1' });
  const [search, setSearch] = useState(f.q);
  const q = useDebounced(search);
  useEffect(() => {
    if (q !== f.q) set({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const { data, loading, error, reload } = useApi(`/leads${qs({ ...f, limit: 25 })}`);

  const update = async (lead, status) => {
    try {
      await api(`/leads/${lead._id}`, { method: 'PUT', body: { status } });
      toast(`Marked ${status}.`);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const c = data?.counts || {};
  return (
    <>
      <PageHeader
        title="Leads"
        subtitle="People who asked the Aicardly team to contact them, from Cardy on the website."
        actions={
          can('export.csv') && (
            <a href={downloadUrl('/leads/export', { ...f, page: undefined })} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
            </a>
          )
        }
      />
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Stat label="New — to contact" value={num(c.new)} />
        <Stat label="Contacted" value={num(c.contacted)} />
        <Stat label="Closed" value={num(c.closed)} />
      </div>
      <Card padded={false}>
        <div className="grid gap-2 border-b border-slate-100 p-3 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email, phone, business or message" className="pl-9" aria-label="Search leads" />
          </div>
          <Select value={f.status} onChange={(e) => set({ status: e.target.value })} aria-label="Status">
            <option value="">All leads</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        {error ? (
          <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div>
        ) : (
          <>
            <Table
              loading={loading}
              rows={data?.leads}
              rowKey={(l) => l._id}
              empty="No leads match."
              columns={[
                { key: 'createdAt', label: 'When', render: (l) => <span className="whitespace-nowrap">{dateTime(l.createdAt)}</span> },
                {
                  key: 'name',
                  label: 'Lead',
                  render: (l) => (
                    <div className="min-w-0">
                      <p className="font-medium text-slate-950">{l.name}{l.businessName ? <span className="font-normal text-slate-500"> · {l.businessName}</span> : null}</p>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs">
                        {l.email && <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 text-brand-500 hover:underline"><Mail className="h-3 w-3" aria-hidden="true" />{l.email}</a>}
                        {l.phone && <a href={`https://wa.me/${l.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-brand-500 hover:underline"><Phone className="h-3 w-3" aria-hidden="true" />{l.phone}</a>}
                      </div>
                    </div>
                  ),
                },
                { key: 'need', label: 'Needs', render: (l) => <div className="max-w-xs text-xs"><p className="text-slate-800">{l.need || '—'}</p>{(l.budget || l.timeline) && <p className="mt-0.5 text-slate-500">{[l.budget, l.timeline].filter(Boolean).join(' · ')}</p>}{l.message && <p className="mt-1 whitespace-pre-line text-slate-600">{l.message}</p>}</div> },
                {
                  key: 'status',
                  label: 'Status',
                  render: (l) =>
                    can('leads.update') ? (
                      <Select value={l.status} onChange={(e) => update(l, e.target.value)} className="h-8 w-32 text-xs" aria-label={`Status of ${l.name}`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    ) : (
                      <Badge color={TONE[l.status]}>{l.status}</Badge>
                    ),
                },
              ]}
            />
            <Pagination page={f.page} pages={data?.pages} total={data?.total} onPage={(page) => set({ page })} />
          </>
        )}
      </Card>
    </>
  );
}
