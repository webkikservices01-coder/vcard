import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, ExternalLink, Search } from 'lucide-react';
import { useApi, useDebounced, useFilters } from '../lib/hooks';
import { qs, downloadUrl } from '../lib/api';
import { useAuth } from '../lib/auth';
import { dateTime } from '../lib/format';
import { Card, ErrorBox, Input, PageHeader, Pagination, Select, StatusBadge, Table, Badge } from '../components/ui';

const DEFAULTS = { q: '', payment: '', delivered: '', from: '', to: '', page: '1' };

export default function Cards() {
  const { can } = useAuth();
  const [f, set] = useFilters(DEFAULTS);
  const [search, setSearch] = useState(f.q);
  const q = useDebounced(search);
  useEffect(() => {
    if (q !== f.q) set({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const { data, loading, error, reload } = useApi(`/cards${qs({ ...f, limit: 25 })}`);

  const columns = [
    {
      key: 'card',
      label: 'Card',
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
            <a href={c.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline">
              /{c.username} <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Created by',
      render: (c) =>
        c.owner ? (
          <Link to={`/users/${c.owner.id}`} className="block hover:underline">
            <span className="text-slate-900">{c.owner.name}</span>
            <span className="block text-xs text-slate-500">{c.owner.email}</span>
            {c.owner.status !== 'active' && <Badge color="red">{c.owner.status}</Badge>}
          </Link>
        ) : (
          <span className="text-slate-400">deleted user</span>
        ),
    },
    { key: 'createdAt', label: 'Created', render: (c) => <span className="whitespace-nowrap">{dateTime(c.createdAt)}</span> },
    { key: 'theme', label: 'Template', render: (c) => <span className="text-xs">{c.theme}</span> },
    { key: 'payment', label: 'Payment', render: (c) => <StatusBadge value={c.paymentStatus} /> },
    { key: 'delivered', label: 'Delivered', render: (c) => (c.delivered ? <div><StatusBadge value={c.deliveryStatus} /><p className="mt-1 text-xs text-slate-500">{dateTime(c.deliveredAt)}</p></div> : <StatusBadge value={c.deliveryStatus || 'no'} />) },
    { key: 'views', label: 'Views', className: 'text-right', render: (c) => c.views },
  ];

  return (
    <>
      <PageHeader
        title="Cards"
        subtitle="Every card, who made it, and whether it was paid for and delivered."
        actions={
          can('export.csv') && (
            <a href={downloadUrl('/cards/export', { ...f, page: undefined })} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-surface px-4 text-sm font-medium text-slate-800 hover:bg-slate-50">
              <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
            </a>
          )
        }
      />
      <Card padded={false}>
        <div className="grid gap-2 border-b border-slate-100 p-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Card link, name, company, owner" className="pl-9" aria-label="Search cards" />
          </div>
          <Select value={f.payment} onChange={(e) => set({ payment: e.target.value })} aria-label="Payment">
            <option value="">Any payment</option>
            <option value="none">No order yet</option>
            <option value="PENDING_PAYMENT">Pending</option>
            <option value="PAID">Paid</option>
            <option value="EXPIRED">Expired</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
          <Select value={f.delivered} onChange={(e) => set({ delivered: e.target.value })} aria-label="Delivered">
            <option value="">Delivered or not</option>
            <option value="yes">Delivered</option>
            <option value="no">Not delivered</option>
          </Select>
          <Input type="date" value={f.from ? f.from.slice(0, 10) : ''} onChange={(e) => set({ from: e.target.value })} aria-label="Created from" title="Created from" />
        </div>
        {error ? (
          <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div>
        ) : (
          <>
            <Table columns={columns} rows={data?.cards} loading={loading} empty="No cards match these filters." />
            <Pagination page={f.page} pages={data?.pages} total={data?.total} onPage={(page) => set({ page })} />
          </>
        )}
      </Card>
    </>
  );
}
