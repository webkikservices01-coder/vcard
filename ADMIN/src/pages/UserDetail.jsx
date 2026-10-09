import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Infinity as InfinityIcon, ArrowLeft, Ban, CheckCircle2, ExternalLink, Gift, Layers, RotateCcw, Trash2, UserX, CalendarPlus, Repeat, XCircle, Pencil, LogIn, LogOut, Mail, MailCheck, Send, FlaskConical } from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { dateOnly, dateTime, money, timeLeft, planLabel, words } from '../lib/format';
import { Badge, Button, Card, DefList, ErrorBox, Field, Input, PageHeader, Select, Spinner, StatusBadge, Table } from '../components/ui';
import { useToast } from '../components/ui';
import ActionDialog from '../components/ActionDialog';
import OrderActions from '../components/OrderActions';

const SITE = 'https://aicardly.com';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useApi(`/users/${id}`);
  const plansApi = useApi(can('users.plan') ? '/plans' : null);
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({});

  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const { user, cards, orders, transactions, plans, notifications } = data;
  const activePlans = (plansApi.data?.plans || []).filter((p) => p.isActive);

  const run = (path, body, method = 'POST') => async ({ reason }) => {
    const res = await api(`/users/${id}${path}`, { method, body: { ...body, reason } });
    toast(res.msg || 'Done.');
    if (method === 'DELETE') navigate('/users');
    else reload();
  };

  const open = (name, initial = {}) => {
    setForm(initial);
    setDialog(name);
  };
  const close = () => setDialog(null);
  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  // Only the fields that changed are sent.
  const profileChanges = () => {
    const out = {};
    if ((form.name || '').trim() !== user.name) out.name = (form.name || '').trim();
    if ((form.email || '').trim().toLowerCase() !== String(user.email).toLowerCase()) out.email = (form.email || '').trim();
    if ((form.phone || '').trim() !== (user.phone || '')) out.phone = (form.phone || '').trim();
    if (form.emailVerified !== (user.emailVerified !== false)) out.emailVerified = form.emailVerified;
    return out;
  };
  const impersonate = async ({ reason }) => {
    // Opened before the request, while the click still counts as a user action (no popup block).
    const win = window.open('about:blank', '_blank');
    try {
      const res = await api(`/users/${id}/impersonate`, { method: 'POST', body: { reason } });
      if (win) {
        win.opener = null;
        win.location.href = res.url;
      } else window.location.href = res.url;
      toast('Their dashboard opened in a new tab. Every change there is made as this user.');
    } catch (err) {
      win?.close();
      throw err;
    }
  };
  const planPicker = (
    <Field label="Plan">
      <Select value={form.planId || ''} onChange={(e) => setForm((f) => ({ ...f, planId: e.target.value }))}>
        <option value="">Choose a plan…</option>
        {activePlans.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} — {money(p.price)} + GST · {p.durationDays} days · unlocks {planLabel(p.tier)}
          </option>
        ))}
      </Select>
    </Field>
  );
  const daysField = (label, hint) => (
    <Field label={label} hint={hint}>
      <Input type="number" min={1} max={3650} value={form.days || ''} onChange={(e) => setForm((f) => ({ ...f, days: e.target.value }))} />
    </Field>
  );

  const orderColumns = [
    { key: 'createdAt', label: 'Link sent', render: (o) => dateTime(o.linkSentAt) },
    { key: 'amount', label: 'Amount', render: (o) => (o.complimentary ? <Badge color="pink">Free credit</Badge> : money(o.amount)) },
    {
      key: 'status',
      label: 'Payment',
      render: (o) => (
        <div>
          <StatusBadge value={o.status} />
          {o.status === 'PENDING_PAYMENT' && <p className="mt-1 text-xs text-slate-500">{timeLeft(o.expiresAt)}</p>}
          {o.paidAt && <p className="mt-1 text-xs text-slate-500">paid {dateTime(o.paidAt)}</p>}
        </div>
      ),
    },
    { key: 'gateway', label: 'Gateway ID', render: (o) => <span className="font-mono text-xs">{o.razorpayPaymentId || o.paymentLinkId || '—'}</span> },
    {
      key: 'delivery',
      label: 'Delivery',
      render: (o) => (
        <div>
          <StatusBadge value={o.delivery?.status} />
          {o.delivery?.lastError && <p className="mt-1 max-w-[220px] text-xs text-red-600">{o.delivery.lastError}</p>}
        </div>
      ),
    },
    { key: 'actions', label: '', render: (o) => <OrderActions order={o} onDone={reload} /> },
  ];

  return (
    <>
      <Link to="/users" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Users
      </Link>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {user.name} <StatusBadge value={user.status} />
            {user.emailVerified === false && <Badge color="amber">Email not verified</Badge>}
            {user.isTest && <Badge color="blue">Test account</Badge>}
          </span>
        }
        subtitle={`${user.email}${user.phone ? ` · ${user.phone}` : ''}`}
        actions={
          <>
            {can('users.impersonate') && user.status === 'active' && (
              <Button onClick={() => open('impersonate')}><LogIn className="h-4 w-4" /> Sign in as user</Button>
            )}
            {can('users.block') && user.status !== 'removed' &&
              (user.isBlocked ? (
                <Button variant="secondary" onClick={() => open('unblock')}><CheckCircle2 className="h-4 w-4" /> Unblock</Button>
              ) : (
                <Button variant="secondary" onClick={() => open('block')}><Ban className="h-4 w-4" /> Block</Button>
              ))}
            {can('users.delete') &&
              (user.deletedAt ? (
                <Button variant="secondary" onClick={() => open('restore')}><RotateCcw className="h-4 w-4" /> Restore</Button>
              ) : (
                <Button variant="secondary" onClick={() => open('remove')}><UserX className="h-4 w-4" /> Remove</Button>
              ))}
            {can('users.purge') && <Button variant="danger" onClick={() => open('purge')}><Trash2 className="h-4 w-4" /> Delete permanently</Button>}
          </>
        }
      />

      {user.isBlocked && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          Blocked {dateTime(user.blockedAt)}{user.blockedReason ? ` — ${user.blockedReason}` : ''}. They can't sign in or create cards.
        </p>
      )}
      {user.deletedAt && <p className="mb-4 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700">Removed {dateTime(user.deletedAt)}. Their account and public card are hidden.</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title="Profile"
          className="lg:col-span-2"
          actions={
            <div className="flex flex-wrap justify-end gap-1">
              {can('users.edit') && (
                <Button size="sm" onClick={() => open('profile', { name: user.name, email: user.email, phone: user.phone || '', emailVerified: user.emailVerified !== false })}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              )}
              {can('users.reset_link') && (
                <Button size="sm" variant="secondary" onClick={() => open('resetLink')}>
                  <Mail className="h-3.5 w-3.5" /> Email reset link
                </Button>
              )}
              {can('users.reset_link') && user.emailVerified === false && (
                <Button size="sm" variant="secondary" onClick={() => open('verifyLink')}>
                  <MailCheck className="h-3.5 w-3.5" /> Resend verification
                </Button>
              )}
              {can('users.password') && (
                <Button size="sm" variant="secondary" onClick={() => open('signout')}>
                  <LogOut className="h-3.5 w-3.5" /> Sign out everywhere
                </Button>
              )}
              {can('users.edit') && (
                <Button size="sm" variant="secondary" onClick={() => open('test')}>
                  <FlaskConical className="h-3.5 w-3.5" /> {user.isTest ? 'Not a test account' : 'Mark as test'}
                </Button>
              )}
            </div>
          }
        >
          <DefList
            items={[
              ['Name', user.name],
              ['Email', <span key="e" className="inline-flex flex-wrap items-center gap-2">{user.email}{user.emailVerified === false ? <Badge color="amber">not verified</Badge> : <Badge color="green">verified</Badge>}</span>],
              ['Phone (WhatsApp)', user.phone || '—'],
              ['Signed up', dateTime(user.createdAt)],
              ['Terms accepted', user.consentAt ? dateTime(user.consentAt) : '—'],
              ['Total paid', money(user.totalPaid)],
              ['Card limit', user.cardLimit ?? 1],
              ['Free card credits', user.freeCardCredits || 0],
            ]}
          />
        </Card>
        <Card
          title="Plan"
          actions={
            can('users.plan') && (
              <div className="flex flex-wrap gap-1">
                <Button size="sm" onClick={() => open('grant', { type: 'free' })}><Gift className="h-3.5 w-3.5" /> Grant</Button>
                {user.planActive && <Button size="sm" variant="secondary" onClick={() => open('extend')}><CalendarPlus className="h-3.5 w-3.5" /> Extend</Button>}
                <Button size="sm" variant="secondary" onClick={() => open('change')}><Repeat className="h-3.5 w-3.5" /> Change</Button>
                {user.planActive && <Button size="sm" variant="secondary" onClick={() => open('revoke')}><XCircle className="h-3.5 w-3.5" /> Revoke</Button>}
                {!user.lifetimeFixed && <Button size="sm" variant="secondary" onClick={() => open('lifetime')}><InfinityIcon className="h-3.5 w-3.5" /> {user.lifetime ? 'Remove lifetime' : 'Lifetime'}</Button>}
              </div>
            )
          }
        >
          <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-900">{user.planActive ? (user.plan && user.plan !== 'Free Trial' ? user.plan : 'AI AGENT PRO') : 'Free Trial'}{user.lifetime && <Badge color="green">Lifetime</Badge>}</p>
          <p className="text-sm text-slate-500">{user.lifetime ? (user.lifetimeFixed ? 'Never expires (permanent account)' : 'Never expires') : user.planActive ? `until ${dateOnly(user.planExpiry)} (${timeLeft(user.planExpiry)})` : user.planExpiry ? `ended ${dateOnly(user.planExpiry)}` : 'No paid plan'}</p>
          {!user.planActive && (
            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <b>Payment link:</b>{' '}
              {user.upgrade?.sentAt
                ? `sent ${dateOnly(user.upgrade.sentAt)} · email ${user.upgrade.email || '—'} · SMS ${user.upgrade.sms || '—'}${user.upgrade.error ? ` (${user.upgrade.error})` : ''}`
                : 'not sent yet (goes out automatically 24 hours after the first card)'}
              {can('users.plan') && !user.upgrade?.trialEndsAt && (
                <Button size="sm" variant="secondary" className="mt-2 mr-2" onClick={() => open('endTrial')}>
                  <XCircle className="h-3.5 w-3.5" /> End trial now
                </Button>
              )}
              {can('users.plan') && (
                <Button size="sm" variant="secondary" className="mt-2" onClick={() => open('upgradeLink')}>
                  <Send className="h-3.5 w-3.5" /> {user.upgrade?.sentAt ? 'Send payment link again' : 'Send payment link now'}
                </Button>
              )}
            </div>
          )}
          {can('users.credits') && (
            <Button size="sm" variant="secondary" className="mt-4" onClick={() => open('credits', { credits: 1, cardLimit: user.cardLimit ?? 1 })}>
              <Layers className="h-3.5 w-3.5" /> Free cards / credits
            </Button>
          )}
        </Card>
      </div>

      <Card title={`Cards (${cards.length})`} className="mt-4">
        {!cards.length ? (
          <p className="text-sm text-slate-500">No card created yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => {
              const delivered = orders.find((o) => String(o.card) === String(c._id) && o.delivery?.imageUrl);
              return (
                <div key={c._id} className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="flex aspect-[16/9] items-center justify-center bg-slate-100">
                    {delivered?.delivery.imageUrl ? (
                      <img src={delivered.delivery.imageUrl} alt={`Card of ${c.personalInfo?.name || c.username}`} className="h-full w-full object-cover" loading="lazy" />
                    ) : c.personalInfo?.profilePic ? (
                      <img src={c.personalInfo.profilePic} alt="" className="h-16 w-16 rounded-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-xs text-slate-400">No preview yet</span>
                    )}
                  </div>
                  <div className="p-3 text-sm">
                    <p className="font-medium text-slate-900">{c.personalInfo?.name || c.username}</p>
                    <p className="text-xs text-slate-500">{[c.personalInfo?.designation, c.personalInfo?.company].filter(Boolean).join(' · ') || '—'}</p>
                    <p className="mt-1 text-xs text-slate-500">Created {dateOnly(c.createdAt)} · {c.viewCount || 0} views · template {c.theme}</p>
                    <a href={`${SITE}/${c.username}`} target="_blank" rel="noreferrer noopener" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
                      aicardly.com/{c.username} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="Card payments (Razorpay links)" className="mt-4" padded={false}>
        <Table columns={orderColumns} rows={orders} empty="No card orders yet." />
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Plan history" padded={false}>
          <Table
            rows={plans}
            rowKey={(p) => p._id}
            empty="No plan history."
            columns={[
              { key: 'planName', label: 'Plan', render: (p) => <div><p className="text-slate-900">{planLabel(p.planName)}</p><p className="text-xs text-slate-500">{words(p.source)}{p.grantedBy ? ` by ${p.grantedBy.email}` : ''}</p></div> },
              { key: 'period', label: 'Period', render: (p) => `${dateOnly(p.startAt)} → ${dateOnly(p.endAt)}` },
              { key: 'status', label: 'State', render: (p) => <StatusBadge value={p.status === 'active' && new Date(p.endAt) <= new Date() ? 'expired' : p.status} /> },
              { key: 'reason', label: 'Reason', render: (p) => <span className="text-xs">{p.reason || '—'}</span> },
            ]}
          />
        </Card>
        <Card title="Plan purchases (Cashfree)" padded={false}>
          <Table
            rows={transactions}
            rowKey={(t) => t._id}
            empty="No plan purchases."
            columns={[
              { key: 'createdAt', label: 'Date', render: (t) => dateTime(t.createdAt) },
              { key: 'plan', label: 'Plan', render: (t) => `${planLabel(t.plan)} (${t.billingType})` },
              { key: 'amount', label: 'Amount', render: (t) => money(t.amount) },
              { key: 'status', label: 'Status', render: (t) => <StatusBadge value={t.status} /> },
            ]}
          />
        </Card>
      </div>

      <Card title="Email & WhatsApp messages" className="mt-4" padded={false}>
        <Table
          rows={notifications}
          empty="No messages sent yet."
          columns={[
            { key: 'createdAt', label: 'When', render: (n) => dateTime(n.createdAt) },
            { key: 'type', label: 'Message', render: (n) => words(n.type) },
            { key: 'channel', label: 'Channel', render: (n) => <Badge color={n.channel === 'whatsapp' ? 'green' : 'blue'}>{n.channel}</Badge> },
            { key: 'to', label: 'To', render: (n) => <span className="text-xs">{n.to || '—'}</span> },
            { key: 'status', label: 'Status', render: (n) => <div><StatusBadge value={n.status} />{n.error && <p className="mt-1 max-w-[260px] text-xs text-red-600">{n.error}</p>}</div> },
          ]}
        />
      </Card>

      {/* ─── Dialogs ─── */}
      <ActionDialog
        open={dialog === 'impersonate'}
        onClose={close}
        title={`Sign in as ${user.name}`}
        description="Opens their Aicardly dashboard in a new tab for 2 hours, so you can edit their cards, services and settings for them. Everything you do there is saved as this user, and this sign-in is recorded in the audit log."
        confirmLabel="Open their dashboard"
        onSubmit={impersonate}
      />
      <ActionDialog
        open={dialog === 'profile'}
        onClose={close}
        title="Edit profile"
        description="Changes the account (sign-in email, name, WhatsApp number). Their public cards keep their own name and contact details; change those from “Sign in as user”."
        confirmLabel="Save changes"
        canSubmit={Object.keys(profileChanges()).length > 0 && (form.name || '').trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((form.email || '').trim())}
        onSubmit={({ reason }) => run('/profile', profileChanges())({ reason })}
      >
        <Field label="Full name">
          <Input value={form.name || ''} onChange={setField('name')} maxLength={80} autoComplete="off" />
        </Field>
        <Field label="Email (used to sign in)" hint={form.email && form.email.trim().toLowerCase() !== String(user.email).toLowerCase() ? 'They will sign in with the new email from now on.' : undefined}>
          <Input type="email" value={form.email || ''} onChange={setField('email')} maxLength={200} autoComplete="off" />
        </Field>
        <Field label="Mobile / WhatsApp" hint="With country code, e.g. +91 98123 45678. Cards and payment links are sent here.">
          <Input type="tel" value={form.phone || ''} onChange={setField('phone')} maxLength={30} autoComplete="off" />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={!!form.emailVerified} onChange={setField('emailVerified')} /> Email verified (they can sign in)
        </label>
      </ActionDialog>
      <ActionDialog open={dialog === 'resetLink'} onClose={close} title="Email a password reset link" description={`Sends ${user.email} a link (valid 1 hour) to choose a new password themselves.`} confirmLabel="Send link" reasonRequired={false} onSubmit={run('/email-link', { kind: 'reset' })} />
      <ActionDialog open={dialog === 'verifyLink'} onClose={close} title="Resend verification email" description={`Sends ${user.email} a new link (valid 24 hours) to verify their email. To let them in without it, use Edit → Email verified.`} confirmLabel="Send link" reasonRequired={false} onSubmit={run('/email-link', { kind: 'verify' })} />
      <ActionDialog open={dialog === 'signout'} onClose={close} title="Sign out everywhere" description="Every device where this user is signed in is signed out. Their password stays the same." confirmLabel="Sign out" reasonRequired={false} onSubmit={run('/signout')} />
      <ActionDialog open={dialog === 'block'} onClose={close} title="Block user" description="They are signed out at once and can't sign in or create cards until unblocked." confirmLabel="Block" danger onSubmit={run('/block')} />
      <ActionDialog open={dialog === 'unblock'} onClose={close} title="Unblock user" confirmLabel="Unblock" reasonRequired={false} onSubmit={run('/unblock')} />
      <ActionDialog open={dialog === 'remove'} onClose={close} title="Remove user" description="Soft delete: the account can't be used and their public card is hidden. You can restore it later." confirmLabel="Remove" danger onSubmit={run('/remove')} />
      <ActionDialog open={dialog === 'restore'} onClose={close} title="Restore user" confirmLabel="Restore" reasonRequired={false} onSubmit={run('/restore')} />
      <ActionDialog
        open={dialog === 'purge'}
        onClose={close}
        title="Delete permanently"
        description="Deletes the account, cards and everything on them. This can't be undone. Payment records are kept for accounting."
        confirmLabel="Delete forever"
        danger
        confirmText={user.email}
        onSubmit={({ reason }) => run('', { confirmEmail: user.email }, 'DELETE')({ reason })}
      />
      <ActionDialog open={dialog === 'grant'} onClose={close} title="Grant a plan" description="If the same tier is already running, the days are added on top." confirmLabel="Grant plan" canSubmit={!!form.planId} onSubmit={run('/plan/grant', { planId: form.planId, days: form.days ? Number(form.days) : undefined, type: form.type })}>
        {planPicker}
        {daysField('Days (leave empty for the plan’s own duration)')}
        <Field label="Type">
          <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            <option value="free">Free grant</option>
            <option value="complimentary">Complimentary</option>
          </Select>
        </Field>
      </ActionDialog>
      <ActionDialog open={dialog === 'extend'} onClose={close} title="Extend plan" confirmLabel="Extend" canSubmit={Number(form.days) > 0} onSubmit={run('/plan/extend', { days: Number(form.days) })}>
        {daysField('Add days', `Currently until ${dateOnly(user.planExpiry)}`)}
      </ActionDialog>
      <ActionDialog open={dialog === 'change'} onClose={close} title="Change plan" description="Keeps the current end date unless you give a number of days." confirmLabel="Change plan" canSubmit={!!form.planId} onSubmit={run('/plan/change', { planId: form.planId, days: form.days ? Number(form.days) : undefined })}>
        {planPicker}
        {daysField('Days from today (optional)')}
      </ActionDialog>
      <ActionDialog open={dialog === 'upgradeLink'} onClose={close} title="Send payment link" description="Emails a link to choose any plan and pay (no login), and Cashfree texts a Smart AI Card monthly payment link to the user's Indian mobile number. Paying either one switches the card back on." confirmLabel="Send now" reasonRequired={false} onSubmit={run('/upgrade-link', {})} />
      <ActionDialog open={dialog === 'lifetime'} onClose={close} title={user.lifetime ? 'Remove lifetime' : 'Make lifetime'} description={user.lifetime ? 'The plan follows its expiry date again.' : 'The plan never expires. With no paid plan the user gets AI Agent Pro.'} confirmLabel={user.lifetime ? 'Remove lifetime' : 'Make lifetime'} onSubmit={run('/lifetime', { lifetime: !user.lifetime })} />
      <ActionDialog open={dialog === 'endTrial'} onClose={close} title="End the free trial now" description="The card pauses right away (visitors see that it's paused) and the payment link goes out by email and SMS, if it hasn't already. Paying switches the card back on." confirmLabel="End trial now" reasonRequired={false} onSubmit={run('/end-trial', {})} />
      <ActionDialog open={dialog === 'revoke'} onClose={close} title="Revoke plan" description="The user goes back to the free tier right away." confirmLabel="Revoke" danger onSubmit={run('/plan/revoke')} />
      <ActionDialog open={dialog === 'test'} onClose={close} title={user.isTest ? 'Not a test account' : 'Mark as test account'} description={user.isTest ? 'This account counts in the dashboard numbers again.' : 'For team and test accounts: it stays as it is, but its signups, cards and payments are left out of the dashboard numbers.'} confirmLabel={user.isTest ? 'Count it again' : 'Mark as test'} onSubmit={run('/test', { isTest: !user.isTest })} />
      <ActionDialog
        open={dialog === 'credits'}
        onClose={close}
        title="Free cards / credits"
        description={`Each credit makes one "Get my card" order free: the card is delivered on WhatsApp + email without a payment link. Has ${user.freeCardCredits || 0} now.`}
        confirmLabel="Save"
        onSubmit={run('/credits', { credits: Number(form.credits) || 0, cardLimit: form.cardLimit === '' ? undefined : Number(form.cardLimit) })}
      >
        <Field label="Credits to add (negative to take away)">
          <Input type="number" min={-100} max={100} value={form.credits ?? ''} onChange={(e) => setForm((f) => ({ ...f, credits: e.target.value }))} />
        </Field>
        <Field label="Card limit" hint="Shown on the user's dashboard.">
          <Input type="number" min={0} max={1000} value={form.cardLimit ?? ''} onChange={(e) => setForm((f) => ({ ...f, cardLimit: e.target.value }))} />
        </Field>
      </ActionDialog>
    </>
  );
}
