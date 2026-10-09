import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { qs } from '../lib/api';
import { useApi, useDebounced, useFilters } from '../lib/hooks';
import { dateTime, actionLabel } from '../lib/format';
import { Badge, Card, ErrorBox, Input, PageHeader, Pagination, Select, Table } from '../components/ui';

const DEFAULTS = { q: '', action: '', success: '', from: '', page: '1' };
const GROUPS = [
  ['', 'All actions'],
  ['auth', 'Sign-ins & security'],
  ['user', 'Users (block, remove, credits)'],
  ['plan', 'Plans'],
  ['payment', 'Payment links'],
  ['card', 'Card delivery'],
  ['admin', 'Admin accounts'],
  ['export', 'Exports'],
  ['support', 'Support tickets'],
];

export default function Audit() {
  const [f, set] = useFilters(DEFAULTS);
  const [search, setSearch] = useState(f.q);
  const q = useDebounced(search);
  useEffect(() => {
    if (q !== f.q) set({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const { data, loading, error, reload } = useApi(`/audit${qs({ ...f, limit: 50 })}`);

  return (
    <>
      <PageHeader title="Audit log" subtitle="Every admin action and sign-in: who, what, on what, when and from where." />
      <Card padded={false}>
        <div className="grid gap-2 border-b border-slate-100 p-3 sm:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Summary, admin email or IP" className="pl-9" aria-label="Search" />
          </div>
          <Select value={f.action} onChange={(e) => set({ action: e.target.value })} aria-label="Action">
            {GROUPS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Select value={f.success} onChange={(e) => set({ success: e.target.value })} aria-label="Result">
            <option value="">Any result</option>
            <option value="true">Succeeded</option>
            <option value="false">Failed / refused</option>
          </Select>
        </div>
        {error ? (
          <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div>
        ) : (
          <>
            <Table
              loading={loading}
              rows={data?.logs}
              rowKey={(l) => l._id}
              empty="Nothing logged yet."
              columns={[
                { key: 'createdAt', label: 'When', render: (l) => <span className="whitespace-nowrap">{dateTime(l.createdAt)}</span> },
                { key: 'admin', label: 'Who', render: (l) => <div><p className="text-slate-900">{l.adminEmail || '—'}</p><p className="text-xs text-slate-500">{l.adminRole}</p></div> },
                { key: 'action', label: 'Action', render: (l) => <Badge color={l.success ? 'slate' : 'red'}>{actionLabel(l.action)}</Badge> },
                { key: 'summary', label: 'What', render: (l) => <div className="max-w-md"><p>{l.summary}</p>{l.meta?.reason && <p className="mt-0.5 text-xs text-slate-500">Reason: {l.meta.reason}</p>}{l.targetType && <p className="mt-0.5 text-xs text-slate-400">{l.targetType} {l.targetId}</p>}</div> },
                { key: 'ip', label: 'From', render: (l) => <span className="font-mono text-xs">{l.ip || '—'}</span> },
              ]}
            />
            <Pagination page={f.page} pages={data?.pages} total={data?.total} onPage={(page) => set({ page })} />
          </>
        )}
      </Card>
    </>
  );
}
