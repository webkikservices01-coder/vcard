import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { qs } from '../lib/api';
import { useApi, useDebounced, useFilters } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { dateTime, num, words, actionLabel } from '../lib/format';
import ExportButton from '../components/ExportButton';
import { Badge, Card, ErrorBox, Input, PageHeader, Pagination, Select, Stat, Table, Tabs } from '../components/ui';

const LEVEL = { info: 'slate', warn: 'amber', error: 'red' };

function AppLogs({ f, set }) {
  const [search, setSearch] = useState(f.q);
  const q = useDebounced(search);
  useEffect(() => {
    if (q !== f.q) set({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const { data, loading, error, reload } = useApi(`/logs${qs({ q: f.q, level: f.level, type: f.type })}`);
  return (
    <>
      {data && (
        <div className="mb-4 grid grid-cols-3 gap-3">
          <Stat label="Errors (24h)" value={num(data.last24h?.error)} />
          <Stat label="Warnings (24h)" value={num(data.last24h?.warn)} />
          <Stat label="Email (SMTP)" value={data.mail ? 'set up' : 'not set up'} />
        </div>
      )}
      <Card padded={false}>
        <div className="grid gap-2 border-b border-slate-100 p-3 sm:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Message, email or event" className="pl-9" aria-label="Search logs" />
          </div>
          <Select value={f.level} onChange={(e) => set({ level: e.target.value })} aria-label="Level">
            <option value="">All levels</option>
            <option value="error">Errors</option>
            <option value="warn">Warnings</option>
            <option value="info">Info</option>
          </Select>
          <Select value={f.type} onChange={(e) => set({ type: e.target.value })} aria-label="Event type">
            <option value="">All events</option>
            <option value="auth">Sign-in / sign-up</option>
            <option value="mail">Email</option>
            <option value="payment">Plan payments</option>
            <option value="card_order">Card orders</option>
            <option value="http">Server errors</option>
            <option value="cardy">Cardy feedback (👍/👎)</option>
            <option value="cashfree">Cashfree</option>
            <option value="trial">Free trial / upgrade links</option>
          </Select>
        </div>
        {error ? (
          <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div>
        ) : (
          <Table
            loading={loading}
            rows={data?.logs}
            rowKey={(l) => l._id}
            empty="No events (kept for 30 days)."
            columns={[
              { key: 'createdAt', label: 'When', render: (l) => <span className="whitespace-nowrap">{dateTime(l.createdAt)}</span> },
              { key: 'level', label: 'Level', render: (l) => <Badge color={LEVEL[l.level]}>{words(l.level)}</Badge> },
              { key: 'type', label: 'Event', render: (l) => <span className="text-xs" title={l.type}>{actionLabel(l.type)}</span> },
              { key: 'msg', label: 'Message', render: (l) => <div className="max-w-lg"><p>{l.msg}</p>{l.email && <p className="text-xs text-slate-500">{l.email}</p>}</div> },
            ]}
          />
        )}
      </Card>
    </>
  );
}

function AiUsage({ f, set }) {
  const { can } = useAuth();
  const { data, loading, error, reload } = useApi(`/ai-usage${qs({ page: f.page, limit: 50 })}`);
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  return (
    <>
      {data && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Requests" value={num(data.total)} />
          <Stat label="Input tokens" value={num(data.summary.inputTokens)} />
          <Stat label="Output tokens" value={num(data.summary.outputTokens)} />
          <Stat label="Cost (USD)" value={`$${Number(data.summary.costUsd || 0).toFixed(2)}`} />
        </div>
      )}
      <Card padded={false} actions={can('export.csv') && <ExportButton path="/ai-usage/export" label="Export (.xlsx)" what="AI usage (with user names and emails)" />} title="AI requests">
        <Table
          loading={loading}
          rows={data?.logs}
          rowKey={(l) => l._id}
          columns={[
            { key: 'createdAt', label: 'When', render: (l) => <span className="whitespace-nowrap">{dateTime(l.createdAt)}</span> },
            { key: 'route', label: 'Feature', render: (l) => words(l.route) },
            { key: 'user', label: 'User', render: (l) => (l.userId ? `${l.userId.name} (${l.userId.email})` : '—') },
            { key: 'vcard', label: 'Card', render: (l) => l.vcardId?.username || '—' },
            { key: 'model', label: 'Model', render: (l) => <span className="text-xs">{l.model}</span> },
            { key: 'tokens', label: 'Tokens in / out', render: (l) => `${num(l.inputTokens)} / ${num(l.outputTokens)}` },
            { key: 'cost', label: 'Cost', render: (l) => `$${Number(l.costUsd || 0).toFixed(4)}` },
          ]}
        />
        <Pagination page={f.page} pages={data?.pages} total={data?.total} onPage={(page) => set({ page })} />
      </Card>
    </>
  );
}

export default function Logs() {
  const [f, set] = useFilters({ tab: 'app', q: '', level: '', type: '', page: '1' });
  return (
    <>
      <PageHeader title="App logs" subtitle="Site events (sign-ins, emails, payments, errors) and AI usage." />
      <Tabs value={f.tab} onChange={(tab) => set({ tab, q: '', level: '', type: '' })} tabs={[{ value: 'app', label: 'Events' }, { value: 'ai', label: 'AI usage' }]} />
      {f.tab === 'app' ? <AppLogs f={f} set={set} /> : <AiUsage f={f} set={set} />}
    </>
  );
}
