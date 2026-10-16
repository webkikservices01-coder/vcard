import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ExternalLink, EyeOff, Eye } from 'lucide-react';
import { api, qs } from '../lib/api';
import { useApi, useDebounced, useFilters } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { dateOnly, num } from '../lib/format';
import { Badge, Button, Card, ErrorBox, FilterBar, Input, PageHeader, Pagination, Select, Stat, Table, useToast } from '../components/ui';
import ActionDialog from '../components/ActionDialog';

// Every digital invite (weddings, birthdays, festival wishes …): owner, views, replies. The team
// can take one offline when it breaks the rules, and put it back.
const STATE = { live: ['Live', 'green'], draft: ['Draft (owner hid it)', 'slate'], hidden: ['Taken offline', 'red'] };
const OCCASION = { wedding: 'Wedding', engagement: 'Engagement', anniversary: 'Anniversary', birthday: 'Birthday', diwali: 'Diwali party', housewarming: 'Griha Pravesh', babyshower: 'Baby shower', wishes: 'Festival wishes' };

export default function Invites() {
  const { can } = useAuth();
  const toast = useToast();
  const [f, set] = useFilters({ q: '', state: '', page: '1' });
  const [search, setSearch] = useState(f.q);
  const q = useDebounced(search);
  useEffect(() => {
    if (q !== f.q) set({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const { data, loading, error, reload } = useApi(`/invites${qs({ q: f.q, state: f.state, page: f.page, limit: 25 })}`);
  const [toggle, setToggle] = useState(null);

  const columns = [
    { key: 'names', label: 'Invite', primary: true, render: (i) => <div><p className="font-medium text-slate-950">{i.names || '—'}</p><a href={`https://aicardly.com/invite/${i.link}`} target="_blank" rel="noreferrer noopener" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline">/invite/{i.link} <ExternalLink className="h-3 w-3" aria-hidden="true" /></a></div> },
    { key: 'occasion', label: 'Occasion', render: (i) => <span className="text-xs">{OCCASION[i.occasion] || i.occasion}<span className="block text-slate-500">{i.template}</span></span> },
    { key: 'owner', label: 'Made by', render: (i) => (i.owner ? <Link to={`/users/${i.owner.id}`} onClick={(e) => e.stopPropagation()} className="text-sm hover:underline">{i.owner.name}<span className="block text-xs text-slate-500">{i.owner.email}</span></Link> : '—') },
    { key: 'stats', label: 'Views · replies', render: (i) => <span className="text-xs">{num(i.views)} views · {num(i.replies)} replies{i.guests ? ` (${num(i.guests)} guests)` : ''}{i.wishes ? ` · ${num(i.wishes)} wishes` : ''}</span> },
    { key: 'createdAt', label: 'Created', render: (i) => dateOnly(i.createdAt) },
    { key: 'state', label: 'Status', render: (i) => <div><Badge color={STATE[i.state][1]}>{STATE[i.state][0]}</Badge>{i.hiddenReason && <p className="mt-0.5 max-w-[180px] text-xs text-slate-500">{i.hiddenReason}</p>}</div> },
    {
      key: 'actions',
      label: '',
      render: (i) => can('invites.moderate') && i.state !== 'draft' && (
        <Button size="sm" variant={i.state === 'hidden' ? 'secondary' : 'ghost'} onClick={(e) => { e.stopPropagation(); setToggle(i); }}>
          {i.state === 'hidden' ? <><Eye className="h-3.5 w-3.5" aria-hidden="true" /> Put back online</> : <><EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> Take offline</>}
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Digital invites" subtitle="Invites and greetings customers made: weddings, birthdays, Diwali, festival wishes and more." />
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Stat label="Live invites" value={num(data?.counts?.live)} />
        <Stat label="All invites" value={num(data?.counts?.all)} />
      </div>
      <Card padded={false}>
        <FilterBar className="sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Names, link, design or owner's email" className="pl-9" aria-label="Search invites" />
          </div>
          <Select value={f.state} onChange={(e) => set({ state: e.target.value })} aria-label="Status">
            <option value="">All invites</option>
            <option value="live">Live</option>
            <option value="draft">Drafts</option>
            <option value="hidden">Taken offline</option>
          </Select>
        </FilterBar>
        {error ? <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div> : (
          <>
            <Table loading={loading} rows={data?.invites} rowKey={(i) => i.id} empty="No invites match." columns={columns} />
            <Pagination page={f.page} pages={data?.pages} total={data?.total} onPage={(page) => set({ page })} />
          </>
        )}
      </Card>
      <ActionDialog
        open={!!toggle}
        onClose={() => setToggle(null)}
        title={toggle?.state === 'hidden' ? 'Put this invite back online' : 'Take this invite offline'}
        danger={toggle?.state !== 'hidden'}
        confirmLabel={toggle?.state === 'hidden' ? 'Put back online' : 'Take offline'}
        description={toggle && (toggle.state === 'hidden' ? `/invite/${toggle.link} opens again for guests.` : `Guests opening /invite/${toggle.link} see "not found" until you put it back. The owner can't switch it on themselves.`)}
        onSubmit={async ({ reason }) => {
          await api(`/invites/${toggle.id}/visibility`, { method: 'POST', body: { hidden: toggle.state !== 'hidden', reason } });
          toast(toggle.state === 'hidden' ? 'Invite is online again.' : 'Invite taken offline.');
          reload();
        }}
      />
    </>
  );
}
