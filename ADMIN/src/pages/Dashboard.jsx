import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, IdCard, IndianRupee, Eye, Bot, Inbox, Layers, Sparkles, Clock, CheckCircle2, TimerOff, XCircle,
  Mail, MessageCircle, CreditCard, AlertTriangle, LifeBuoy, PackageX, ThumbsUp, ThumbsDown, Radio,
  Table2, LineChart, ArrowRight, ShieldCheck, Activity, Trophy, UserPlus, Wallet, ScrollText,
} from 'lucide-react';
import { useApi } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { money, num, dateTime } from '../lib/format';
import { Badge, Card, ErrorBox, Spinner, Stat, Trend } from '../components/ui';
import { AreaChart, BarList, Funnel, ChartTable } from '../components/charts';

const PERIODS = [7, 30, 90];

const METRICS = [
  { key: 'signups', label: 'Sign-ups', format: num },
  { key: 'revenue', label: 'Revenue', format: (v) => money(v) },
  { key: 'cards', label: 'Cards created', format: num },
  { key: 'views', label: 'Card views', format: num },
  { key: 'aiChats', label: 'AI chats', format: num },
];

const FEATURE_LABEL = { chat: 'Card AI chat', 'platform-chat': 'Cardy (website)', jarvis: 'Jarvis (dashboard)', 'voice-fill': 'Voice fill', theme: 'AI theme designer' };
const TIER_LABEL = { 'DIGITAL CARD': 'Digital Card', 'SMART AI CARD': 'Smart AI Card', 'AI AGENT PRO': 'AI Agent Pro' };

const greeting = () => {
  const h = Number(new Date().toLocaleString('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }));
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

// A system check: icon + words, never colour alone.
function HealthRow({ ok, warn, icon: Icon, label, detail, to }) {
  const state = ok ? { tone: 'text-emerald-700 bg-emerald-50', word: 'OK', I: CheckCircle2 } : warn ? { tone: 'text-amber-800 bg-amber-50', word: 'Check', I: AlertTriangle } : { tone: 'text-red-700 bg-red-50', word: 'Action needed', I: XCircle };
  const body = (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-slate-50">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500"><Icon className="h-4 w-4" aria-hidden="true" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        <span className="block truncate text-xs text-slate-500">{detail}</span>
      </span>
      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${state.tone}`}>
        <state.I className="h-3 w-3" aria-hidden="true" /> {state.word}
      </span>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

function Avatar({ name, src }) {
  if (src) return <img src={src} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" loading="lazy" />;
  const init = String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  return <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{init || '?'}</span>;
}

export default function Dashboard() {
  const { admin, can } = useAuth();
  const [days, setDays] = useState(30);
  const [metric, setMetric] = useState('signups');
  const [asTable, setAsTable] = useState(false);
  const { data: d, loading, error, reload } = useApi(`/dashboard?days=${days}`);

  if (error) return <ErrorBox error={error} onRetry={reload} />;
  if (!d) return <Spinner label="Loading your dashboard" />;

  const k = d.kpis;
  const m = METRICS.find((x) => x.key === metric);
  const series = d.series[metric] || [];
  const seriesTotal = series.reduce((a, p) => a + p.value, 0);
  const periodWord = `last ${days} days`;

  return (
    <div className={loading ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
      {/* Hero */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-surface p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
              {num(k.views.liveNow)} visitor{k.views.liveNow === 1 ? '' : 's'} on cards right now
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {greeting()}, <span className="text-brand-gradient">{admin?.name?.split(' ')[0]}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">Here's how Aicardly is doing — {periodWord} (IST), compared with the {days} days before.</p>
          </div>
          <div className="inline-flex rounded-xl border border-slate-200 bg-surface-2 p-1" role="group" aria-label="Period">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDays(p)}
                aria-pressed={days === p}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all ${days === p ? 'bg-brand-gradient text-white shadow-brand' : 'text-slate-600 hover:text-slate-950'}`}
              >
                {p}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Headline numbers */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat hero label="New users" value={num(k.users.period)} icon={UserPlus} tone="brand" trend={<Trend now={k.users.period} prev={k.users.prev} />} sub={`${num(k.users.today)} today · ${num(k.users.total)} total`} />
        <Stat hero label="Revenue" value={money(k.revenue.period)} icon={IndianRupee} tone="brand" trend={<Trend now={k.revenue.period} prev={k.revenue.prev} />} sub={`${money(k.revenue.total)} all time`} />
        <Stat hero label="Cards created" value={num(k.cards.period)} icon={IdCard} tone="brand" trend={<Trend now={k.cards.period} prev={k.cards.prev} />} sub={`${num(k.cards.total)} cards total`} />
        <Stat hero label="Card views" value={num(k.views.period)} icon={Eye} tone="brand" trend={<Trend now={k.views.period} prev={k.views.prev} />} sub="people opening cards" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="AI chats on cards" value={num(k.aiChats.period)} icon={Bot} trend={<Trend now={k.aiChats.period} prev={k.aiChats.prev} />} sub={`${num(k.aiChats.messages)} messages`} />
        <Stat label="Leads & enquiries" value={num(k.leads.period)} icon={Inbox} sub={`${num(k.leads.newCardy)} new website leads`} />
        <Stat label="Active paid plans" value={num(k.activePlans)} icon={Layers} sub="running right now" />
        <Stat label="AI cost" value={`$${d.ai.cost.period.toFixed(2)}`} icon={Sparkles} trend={<Trend now={d.ai.cost.period} prev={d.ai.cost.prev} invert />} sub={periodWord} />
      </div>

      {/* Trend chart + funnel */}
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title={m.label}
          subtitle={`${m.format(seriesTotal)} in the ${periodWord}`}
          icon={LineChart}
          actions={
            <>
              <div className="flex flex-wrap gap-1" role="tablist" aria-label="Metric">
                {METRICS.map((x) => (
                  <button
                    key={x.key}
                    type="button"
                    role="tab"
                    aria-selected={metric === x.key}
                    onClick={() => setMetric(x.key)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${metric === x.key ? 'bg-slate-900 text-surface' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                    {x.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setAsTable((t) => !t)} className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label={asTable ? 'Show as chart' : 'Show as table'} title={asTable ? 'Show as chart' : 'Show as table'}>
                {asTable ? <LineChart className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
              </button>
            </>
          }
        >
          {asTable ? <ChartTable data={series} format={m.format} label={m.label} /> : <AreaChart data={series} format={m.format} label={m.label} />}
        </Card>

        <Card title="Card order funnel" subtitle={"All time · people at each step of “Get my card”"} icon={Trophy}>
          <Funnel steps={d.funnel} />
        </Card>
      </div>

      {/* Payments, plans, AI */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Card payments" subtitle="24-hour payment links" icon={Wallet} actions={can('payments.view') && <Link to="/payments" className="text-xs font-semibold text-brand-500 hover:underline">Open</Link>}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Paid', value: d.payments.paid, I: CheckCircle2, to: '/payments?status=PAID' },
              { label: 'Waiting', value: d.payments.pending, I: Clock, to: '/payments?status=PENDING_PAYMENT' },
              { label: 'Expired', value: d.payments.expired, I: TimerOff, to: '/payments?status=EXPIRED' },
              { label: 'Failed', value: d.payments.failed, I: XCircle, to: '/payments?status=FAILED' },
            ].map((p) => (
              <Link key={p.label} to={p.to} className="rounded-xl border border-slate-200 bg-surface-2 p-3 transition-colors hover:border-slate-300">
                <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><p.I className="h-3.5 w-3.5" aria-hidden="true" /> {p.label}</p>
                <p className="mt-1 text-xl font-semibold text-slate-950 tabular-nums">{num(p.value)}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Paid plans by tier" subtitle="Running right now" icon={Layers} actions={can('plans.view') && <Link to="/plans?tab=subs" className="text-xs font-semibold text-brand-500 hover:underline">Open</Link>}>
          <BarList items={Object.entries(TIER_LABEL).map(([tier, label]) => ({ label, value: d.plans[tier] || 0 }))} format={num} showShare emptyText="No paid plans running." />
        </Card>

        <Card title="AI at work" subtitle={periodWord} icon={Bot}>
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-surface-2 p-2.5">
              <p className="flex items-center justify-center gap-1 text-[11px] text-slate-500"><ThumbsUp className="h-3 w-3" aria-hidden="true" /> Cardy helpful</p>
              <p className="mt-0.5 text-lg font-semibold text-slate-950 tabular-nums">{num(d.ai.cardyFeedback.up)}</p>
            </div>
            <div className="rounded-xl bg-surface-2 p-2.5">
              <p className="flex items-center justify-center gap-1 text-[11px] text-slate-500"><ThumbsDown className="h-3 w-3" aria-hidden="true" /> Not helpful</p>
              <p className="mt-0.5 text-lg font-semibold text-slate-950 tabular-nums">{num(d.ai.cardyFeedback.down)}</p>
            </div>
            <div className="rounded-xl bg-surface-2 p-2.5" title="Visitors' 0–10 rating of card AI chats">
              <p className="text-[11px] text-slate-500">Chat rating</p>
              <p className="mt-0.5 text-lg font-semibold text-slate-950 tabular-nums">{d.ai.nps ? `${d.ai.nps.avg}/10` : '—'}</p>
            </div>
          </div>
          <BarList items={d.ai.byFeature.map((f) => ({ label: FEATURE_LABEL[f.feature] || f.feature, value: f.requests }))} format={(v) => `${num(v)} req`} emptyText="No AI requests in this period." />
        </Card>
      </div>

      {/* Top cards, recent sign-ups, recent payments */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Most viewed cards" subtitle={periodWord} icon={Eye} padded={false}>
          {d.topCards.length ? (
            <ul className="divide-y divide-slate-100">
              {d.topCards.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-4 text-xs font-bold text-slate-400 tabular-nums">{i + 1}</span>
                  <Avatar name={c.name} src={c.photo} />
                  <div className="min-w-0 flex-1">
                    <a href={`https://aicardly.com/${c.username}`} target="_blank" rel="noreferrer noopener" className="block truncate text-sm font-medium text-slate-900 hover:underline">{c.name}</a>
                    <p className="truncate text-xs text-slate-500">/{c.username} · {num(c.totalViews)} all time</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-950 tabular-nums">{num(c.views)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No card views in this period.</p>
          )}
        </Card>

        <Card title="Newest users" icon={Users} padded={false} actions={can('users.view') && <Link to="/users" className="text-xs font-semibold text-brand-500 hover:underline">All users</Link>}>
          <ul className="divide-y divide-slate-100">
            {d.recent.signups.map((u) => (
              <li key={u.id}>
                <Link to={`/users/${u.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
                  <Avatar name={u.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{u.name}</p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge color={u.plan === 'Free Trial' ? 'slate' : 'pink'}>{TIER_LABEL[u.plan] || 'Free'}</Badge>
                    <p className="mt-1 text-[11px] text-slate-400">{dateTime(u.at)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Latest payments" icon={CreditCard} padded={false} actions={can('payments.view') && <Link to="/payments" className="text-xs font-semibold text-brand-500 hover:underline">All payments</Link>}>
          {d.recent.payments.length ? (
            <ul className="divide-y divide-slate-100">
              {d.recent.payments.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"><IndianRupee className="h-4 w-4" aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{p.user?.name || 'Deleted user'}</p>
                    <p className="truncate text-xs text-slate-500">{TIER_LABEL[p.kind] || p.kind} · {dateTime(p.at)}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-950 tabular-nums">{money(p.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No payments yet.</p>
          )}
        </Card>
      </div>

      {/* Health, leads, activity */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="System health" subtitle="Live checks" icon={ShieldCheck}>
          <div className="-mx-2 space-y-0.5">
            <HealthRow ok={d.health.email} icon={Mail} label="Email (SMTP)" detail={d.health.email ? 'Verification, payment & delivery emails go out' : 'Not set up — emails are not sent'} />
            <HealthRow ok={d.health.whatsapp} icon={MessageCircle} label="WhatsApp" detail={d.health.whatsapp ? 'Payment links and cards go out on WhatsApp' : 'Not set up — cards go by email only'} />
            <HealthRow ok={d.health.payments} icon={CreditCard} label="Razorpay payment links" detail={d.health.payments ? 'Card payments are on' : 'Not set up — no payment links'} />
            <HealthRow ok={!d.health.stuckDeliveries} icon={PackageX} label="Card deliveries" detail={d.health.stuckDeliveries ? `${d.health.stuckDeliveries} paid card(s) not delivered yet` : 'Every paid card was delivered'} to={d.health.stuckDeliveries && can('payments.view') ? '/payments?status=PAID' : undefined} />
            <HealthRow ok={!d.health.errors24h} warn={d.health.errors24h > 0 && d.health.errors24h < 10} icon={Activity} label="Errors (24h)" detail={`${num(d.health.errors24h)} errors · ${num(d.health.warnings24h)} warnings`} to={can('logs.view') ? '/logs?level=error' : undefined} />
            <HealthRow ok={!d.health.openTickets} warn icon={LifeBuoy} label="Support tickets" detail={`${num(d.health.openTickets)} open`} to={can('support.view') ? '/support?status=open' : undefined} />
          </div>
        </Card>

        <Card title="Website leads" subtitle="From Cardy's contact form" icon={Inbox} padded={false} actions={can('leads.view') && <Link to="/leads" className="text-xs font-semibold text-brand-500 hover:underline">All leads</Link>}>
          {d.leads.recent.length ? (
            <ul className="divide-y divide-slate-100">
              {d.leads.recent.map((l) => (
                <li key={l._id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={l.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{l.name}{l.businessName ? ` · ${l.businessName}` : ''}</p>
                    <p className="truncate text-xs text-slate-500">{l.need || l.email || l.phone}</p>
                  </div>
                  <Badge color={l.status === 'new' ? 'amber' : l.status === 'contacted' ? 'blue' : 'slate'}>{l.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No leads yet.</p>
          )}
          <p className="border-t border-slate-100 px-5 py-2.5 text-xs text-slate-500">{num(d.leads.cardEnquiries)} enquiries sent to card owners in the {periodWord}.</p>
        </Card>

        <Card title="Admin activity" icon={ScrollText} padded={false} actions={can('audit.view') && <Link to="/audit" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:underline">Audit log <ArrowRight className="h-3 w-3" /></Link>}>
          {d.recent.activity.length ? (
            <ul className="divide-y divide-slate-100">
              {d.recent.activity.map((a) => (
                <li key={a.id} className="px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Badge color={a.success ? 'slate' : 'red'}>{a.action}</Badge>
                    <span className="ml-auto text-[11px] text-slate-400">{dateTime(a.createdAt)}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-600">{a.summary}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-500">{can('audit.view') ? 'No admin activity yet.' : 'Visible to admins.'}</p>
          )}
        </Card>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Radio className="h-3 w-3" aria-hidden="true" /> Numbers update each time you open this page or change the period.
      </p>
    </div>
  );
}
