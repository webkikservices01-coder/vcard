import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MessageSquareReply } from 'lucide-react';
import { api, qs } from '../lib/api';
import { useApi, useFilters } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { dateTime, planLabel } from '../lib/format';
import { Badge, Button, Card, ErrorBox, Field, Modal, PageHeader, Pagination, Select, Spinner, StatusBadge, Table, Textarea, useToast } from '../components/ui';

const STATUSES = [
  ['open', 'Open (not answered)'],
  ['in-progress', 'In progress'],
  ['resolved', 'Resolved'],
  ['closed', 'Closed'],
];
const label = (s) => STATUSES.find(([v]) => v === s)?.[1] || s;

export default function Support() {
  const [f, set] = useFilters({ status: '', page: '1' });
  const [params, setParams] = useSearchParams();
  const { data, loading, error, reload } = useApi(`/support${qs({ ...f, limit: 25 })}`);
  const openId = params.get('open') || '';
  const setOpen = (id) => {
    const p = new URLSearchParams(params);
    if (id) p.set('open', id);
    else p.delete('open');
    setParams(p, { replace: true });
  };

  return (
    <>
      <PageHeader title="Support tickets" subtitle="Questions users sent from their dashboard. Open one to read it, reply by email and change its status." />
      <Card padded={false}>
        <div className="border-b border-slate-100 p-3">
          <Select value={f.status} onChange={(e) => set({ status: e.target.value })} className="sm:w-64" aria-label="Status">
            <option value="">All tickets</option>
            {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
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
              onRowClick={(t) => setOpen(t._id)}
              columns={[
                { key: 'subject', label: 'Ticket', primary: true, render: (t) => <div className="max-w-md"><p className="font-medium text-slate-900">{t.subject}</p><p className="line-clamp-2 text-sm text-slate-600">{t.message}</p></div> },
                { key: 'user', label: 'From', render: (t) => (t.userId ? <span><span className="text-slate-900">{t.userId.name}</span><span className="block text-xs text-slate-500">{t.userId.email}</span></span> : 'Deleted account') },
                { key: 'createdAt', label: 'Received', render: (t) => <span className="whitespace-nowrap">{dateTime(t.createdAt)}</span> },
                { key: 'replies', label: 'Replies', render: (t) => (t.replies?.length ? `${t.replies.length}` : <Badge color="amber">None yet</Badge>) },
                { key: 'status', label: 'Status', render: (t) => <StatusBadge value={t.status} /> },
              ]}
            />
            <Pagination page={f.page} pages={data?.pages} total={data?.total} onPage={(page) => set({ page })} />
          </>
        )}
      </Card>
      {openId && <Ticket id={openId} onClose={() => setOpen('')} onChanged={reload} />}
    </>
  );
}

function Ticket({ id, onClose, onChanged }) {
  const { can } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useApi(`/support/${id}`);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const t = data?.ticket;

  const send = async () => {
    setBusy(true);
    try {
      const res = await api(`/support/${id}/reply`, { method: 'POST', body: { message: reply.trim(), status } });
      toast(res.msg);
      setReply('');
      setStatus('');
      reload();
      onChanged();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  const changeStatus = async (s) => {
    try {
      await api(`/support/${id}`, { method: 'PUT', body: { status: s } });
      toast('Status changed.');
      reload();
      onChanged();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <Modal open title={t ? t.subject : 'Ticket'} onClose={onClose} wide>
      {loading && !t ? (
        <Spinner />
      ) : error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <StatusBadge value={t.status} />
            <span className="text-slate-500">{t.category} · received {dateTime(t.createdAt)}</span>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            {t.userId ? (
              <Link to={`/users/${t.userId._id}`} className="text-sm font-semibold text-brand-600 hover:underline">
                {t.userId.name} · {t.userId.email}
              </Link>
            ) : (
              <p className="text-sm text-slate-500">Deleted account</p>
            )}
            {t.userId && <p className="text-xs text-slate-500">{t.userId.phone || 'No phone'} · {planLabel(t.userId.plan || 'Free')}</p>}
            <p className="mt-2 whitespace-pre-line text-sm text-slate-800">{t.message}</p>
            {t.attachFile && <a href={t.attachFile} target="_blank" rel="noreferrer noopener" className="mt-1 inline-block text-xs text-brand-600 hover:underline">Attachment</a>}
          </div>
          {t.replies?.map((r, i) => (
            <div key={i} className="ml-6 rounded-xl bg-brand-50 p-3">
              <p className="text-xs font-semibold text-slate-700">{r.by || 'Team'} · {dateTime(r.at)} {r.emailed ? '· emailed' : '· not emailed'}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{r.message}</p>
            </div>
          ))}
          {can('support.update') && (
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <Field label="Reply (emailed to the user and saved here)">
                <Textarea value={reply} onChange={(e) => setReply(e.target.value)} maxLength={4000} rows={4} placeholder="Hi, thanks for writing in…" />
              </Field>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-60" aria-label="Status after replying">
                  <option value="">Status after reply: {t.status === 'open' ? 'In progress' : label(t.status)}</option>
                  {STATUSES.map(([v, l]) => <option key={v} value={v}>Then: {l}</option>)}
                </Select>
                <Button onClick={send} loading={busy} disabled={reply.trim().length < 2}><MessageSquareReply className="h-4 w-4" /> Send reply</Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                Change status without replying:
                {STATUSES.filter(([v]) => v !== t.status).map(([v, l]) => (
                  <Button key={v} size="sm" variant="secondary" onClick={() => changeStatus(v)}>{l}</Button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
