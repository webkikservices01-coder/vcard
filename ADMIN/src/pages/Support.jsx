import { Link } from 'react-router-dom';
import { api, qs } from '../lib/api';
import { useApi, useFilters } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { dateTime } from '../lib/format';
import { Card, ErrorBox, PageHeader, Pagination, Select, StatusBadge, Table, useToast } from '../components/ui';

const STATUSES = ['open', 'in-progress', 'resolved', 'closed'];

export default function Support() {
  const { can } = useAuth();
  const toast = useToast();
  const [f, set] = useFilters({ status: '', page: '1' });
  const { data, loading, error, reload } = useApi(`/support${qs({ ...f, limit: 25 })}`);

  const update = async (t, status) => {
    try {
      await api(`/support/${t._id}`, { method: 'PUT', body: { status } });
      toast('Ticket updated.');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <>
      <PageHeader title="Support tickets" subtitle="Questions users sent from their dashboard." />
      <Card padded={false}>
        <div className="border-b border-slate-100 p-3">
          <Select value={f.status} onChange={(e) => set({ status: e.target.value })} className="sm:w-56" aria-label="Status">
            <option value="">All tickets</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        {error ? (
          <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div>
        ) : (
          <>
            <Table
              loading={loading}
              rows={data?.tickets}
              rowKey={(t) => t._id}
              empty="No tickets."
              columns={[
                { key: 'createdAt', label: 'Received', render: (t) => <span className="whitespace-nowrap">{dateTime(t.createdAt)}</span> },
                { key: 'user', label: 'From', render: (t) => (t.userId ? <Link to={`/users/${t.userId._id}`} className="hover:underline"><span className="text-slate-900">{t.userId.name}</span><span className="block text-xs text-slate-500">{t.userId.email}</span></Link> : '—') },
                { key: 'subject', label: 'Ticket', render: (t) => <div className="max-w-md"><p className="font-medium text-slate-900">{t.subject}</p><p className="text-xs text-slate-500">{t.category}</p><p className="mt-1 whitespace-pre-line text-sm text-slate-600">{t.message}</p>{t.attachFile && <a href={t.attachFile} target="_blank" rel="noreferrer noopener" className="text-xs text-brand-600 hover:underline">Attachment</a>}</div> },
                {
                  key: 'status',
                  label: 'Status',
                  render: (t) =>
                    can('support.update') ? (
                      <Select value={t.status} onChange={(e) => update(t, e.target.value)} className="h-8 w-36 text-xs" aria-label="Ticket status">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    ) : (
                      <StatusBadge value={t.status} />
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
