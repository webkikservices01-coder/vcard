import { useEffect, useState } from 'react';
import { Save, Send, RotateCcw } from 'lucide-react';
import { api } from '../lib/api';
import { useApi, useFilters } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { dateTime } from '../lib/format';
import { Badge, Button, Card, ErrorBox, Field, Input, Modal, PageHeader, Spinner, Tabs, Textarea, useToast } from '../components/ui';

// Site settings, security, the website chatbot and the wording of the automatic emails.
// Each tab shows only when the admin's permissions allow it.
const Check = ({ checked, onChange, children, disabled }) => (
  <label className="flex items-start gap-2 text-sm text-slate-700">
    <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="mt-0.5 h-4 w-4 accent-brand-600" />
    <span>{children}</span>
  </label>
);

function useSection(data, key) {
  const [v, setV] = useState(null);
  useEffect(() => {
    if (data?.[key]) setV(data[key]);
  }, [data, key]);
  return [v, setV];
}

function SaveBar({ onSave, busy }) {
  return (
    <div className="flex justify-end border-t border-slate-100 pt-4">
      <Button onClick={onSave} loading={busy}><Save className="h-4 w-4" aria-hidden="true" /> Save changes</Button>
    </div>
  );
}

function SiteTab({ data, reload }) {
  const toast = useToast();
  const [v, setV] = useSection(data, 'site');
  const [busy, setBusy] = useState(false);
  if (!v) return <Spinner />;
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const save = async () => {
    setBusy(true);
    try {
      await api('/settings/site', { method: 'PUT', body: { ...v, metalCardPrice: Number(v.metalCardPrice) || 0 } });
      toast('Saved. The website shows it within a minute.');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card title="Website" subtitle="Shown on aicardly.com. Changes appear within about a minute.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Metal NFC card starting price (₹, before GST)" hint="Shown as “From ₹… + GST” on the metal card page. 0 = “Price on quote”."><Input type="number" min={0} value={v.metalCardPrice} onChange={set('metalCardPrice')} /></Field>
        <Field label="Metal card delivery time" hint="e.g. 5–7 working days"><Input value={v.metalCardDelivery} onChange={set('metalCardDelivery')} maxLength={60} /></Field>
        <Field label="Support email"><Input type="email" value={v.supportEmail} onChange={set('supportEmail')} maxLength={200} /></Field>
        <Field label="Support phone"><Input value={v.supportPhone} onChange={set('supportPhone')} maxLength={30} /></Field>
        <Field label="Copy of every AI-booked meeting to" hint="Empty = the server default" className="sm:col-span-2"><Input type="email" value={v.meetingCopyEmail} onChange={set('meetingCopyEmail')} maxLength={200} /></Field>
      </div>
      <fieldset className="mt-5 space-y-3 rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-900">Announcement strip</legend>
        <p className="text-xs text-slate-500">A thin strip at the top of every public page, e.g. an offer or a holiday notice.</p>
        <Check checked={v.announcement.active} onChange={(active) => setV({ ...v, announcement: { ...v.announcement, active } })}>Show the strip</Check>
        <Field label="Text"><Input value={v.announcement.text} onChange={(e) => setV({ ...v, announcement: { ...v.announcement, text: e.target.value } })} maxLength={160} placeholder="Diwali offer: 20% off yearly plans with code DIWALI20" /></Field>
        <Field label="Link (optional)" hint="https://… or a page like /pricing"><Input value={v.announcement.link} onChange={(e) => setV({ ...v, announcement: { ...v.announcement, link: e.target.value } })} maxLength={300} /></Field>
      </fieldset>
      <div className="mt-4"><SaveBar onSave={save} busy={busy} /></div>
    </Card>
  );
}

function SecurityTab({ data, reload }) {
  const toast = useToast();
  const { admin } = useAuth();
  const [v, setV] = useSection(data, 'security');
  const [busy, setBusy] = useState(false);
  if (!v) return <Spinner />;
  const save = async () => {
    setBusy(true);
    try {
      await api('/settings/security', { method: 'PUT', body: { ...v, idleMinutes: Number(v.idleMinutes), captchaAfter: Number(v.captchaAfter) } });
      toast('Security settings saved.');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card title="Admin panel security">
      <div className="space-y-5">
        <div>
          <Check checked={v.require2fa} onChange={(require2fa) => setV({ ...v, require2fa })} disabled={!admin?.totpEnabled && !v.require2fa}>
            <b>Every admin must use two-step sign-in (2FA).</b> Admins without it can only open their account page until they switch it on.
          </Check>
          {!admin?.totpEnabled && <p className="ml-6 mt-1 text-xs text-amber-700">Switch on 2FA for your own account first (My account).</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sign out after no activity for (minutes)" hint="5–240. A warning shows one minute before."><Input type="number" min={5} max={240} value={v.idleMinutes} onChange={(e) => setV({ ...v, idleMinutes: e.target.value })} /></Field>
          <Field label="Picture check after this many failed sign-ins" hint="From one network in 15 minutes. 0 = never."><Input type="number" min={0} max={20} value={v.captchaAfter} onChange={(e) => setV({ ...v, captchaAfter: e.target.value })} /></Field>
        </div>
        <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">Also on: 5 wrong passwords lock an admin for 15 minutes, every action is in the audit log, sessions end after 12 hours, and the panel can be limited to your office IPs (ADMIN_IP_ALLOWLIST on the server).</p>
        <SaveBar onSave={save} busy={busy} />
      </div>
    </Card>
  );
}

function ChatbotTab({ data, reload }) {
  const toast = useToast();
  const [v, setV] = useSection(data, 'cardy');
  const [busy, setBusy] = useState(false);
  if (!v) return <Spinner />;
  const save = async () => {
    setBusy(true);
    try {
      await api('/settings/cardy', { method: 'PUT', body: v });
      toast('Chatbot settings saved. Cardy uses them within a minute.');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card title="Website chatbot (Cardy)" subtitle="The assistant on aicardly.com that answers visitors, takes leads and books demos.">
      <div className="space-y-4">
        <Check checked={v.enabled} onChange={(enabled) => setV({ ...v, enabled })}><b>Cardy is on.</b> When off, the chat button is hidden and visitors see WhatsApp and email instead.</Check>
        <Field label="Welcome line" hint="Empty = the built-in line (“Hi, I'm Cardy from Aicardly…”)"><Textarea value={v.welcome} onChange={(e) => setV({ ...v, welcome: e.target.value })} maxLength={300} /></Field>
        <Field label="Extra knowledge" hint="New offers, features or answers Cardy should know. Plain sentences; Cardy uses only facts written here and on the website. Up to 4,000 characters.">
          <Textarea value={v.extraKnowledge} onChange={(e) => setV({ ...v, extraKnowledge: e.target.value })} maxLength={4000} className="min-h-[160px]" placeholder="Diwali offer until 5 Nov: 20% off yearly plans with code DIWALI20." />
        </Field>
        <Field label="Demo booking link" hint="Empty = the built-in Calendly link. Type off to use the name + phone form instead.">
          <Input value={v.bookingUrl} onChange={(e) => setV({ ...v, bookingUrl: e.target.value.trim() })} maxLength={500} placeholder="https://calendly.com/…" />
        </Field>
        <SaveBar onSave={save} busy={busy} />
      </div>
    </Card>
  );
}

function EmailsTab() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi('/settings/emails');
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState('');
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  if (loading && !data) return <Spinner />;
  const open = (t) => setEdit({ key: t.key, label: t.label, when: t.when, vars: t.vars, defaults: t.defaults, subject: t.custom?.subject || '', heading: t.custom?.heading || '', intro: t.custom?.intro || '', enabled: t.custom ? t.custom.enabled : true });
  const body = () => ({ subject: edit.subject, heading: edit.heading, intro: edit.intro, enabled: edit.enabled });
  const run = async (what, fn) => {
    setBusy(what);
    try {
      await fn();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy('');
    }
  };
  return (
    <>
      <Card padded={false} title="Email templates" subtitle={`Change the subject, heading and first line of the automatic emails. Links, buttons and details stay. ${data?.mailReady ? '' : 'Email sending is not set up on this server, so test emails will not go out.'}`}>
        <ul className="divide-y divide-slate-100">
          {(data?.templates || []).map((t) => (
            <li key={t.key} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-950">{t.label} {t.custom ? (t.custom.enabled ? <Badge color="pink">Edited</Badge> : <Badge color="red">Switched off</Badge>) : <Badge color="slate">Built-in</Badge>}</p>
                <p className="text-xs text-slate-500">{t.when}</p>
                <p className="mt-0.5 truncate text-xs text-slate-700">Subject: {t.custom?.subject || t.defaults.subject}</p>
                {t.custom?.updatedAt && <p className="text-[11px] text-slate-400">Edited {dateTime(t.custom.updatedAt)} by {t.custom.updatedBy}</p>}
              </div>
              <Button size="sm" variant="secondary" onClick={() => open(t)}>Edit</Button>
            </li>
          ))}
        </ul>
      </Card>
      {edit && (
        <Modal
          open
          wide
          title={edit.label}
          onClose={() => setEdit(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => run('reset', async () => { await api(`/settings/emails/${edit.key}`, { method: 'DELETE' }); toast('Back to the built-in text.'); setEdit(null); reload(); })} loading={busy === 'reset'}><RotateCcw className="h-4 w-4" aria-hidden="true" /> Built-in text</Button>
              <Button variant="secondary" onClick={() => run('test', async () => { const r = await api(`/settings/emails/${edit.key}/test`, { method: 'POST', body: body() }); toast(r.msg); })} loading={busy === 'test'}><Send className="h-4 w-4" aria-hidden="true" /> Send me a test</Button>
              <Button onClick={() => run('save', async () => { await api(`/settings/emails/${edit.key}`, { method: 'PUT', body: body() }); toast('Email template saved.'); setEdit(null); reload(); })} loading={busy === 'save'}><Save className="h-4 w-4" aria-hidden="true" /> Save</Button>
            </>
          }
        >
          <p className="text-sm text-slate-600">{edit.when} Leave a box empty to keep the built-in text (shown greyed). You can use: {edit.vars.map((v) => <code key={v} className="mx-0.5 rounded bg-slate-100 px-1 text-xs">{`{${v}}`}</code>)}</p>
          <Field label="Subject"><Input value={edit.subject} onChange={(e) => setEdit({ ...edit, subject: e.target.value })} maxLength={200} placeholder={edit.defaults.subject} /></Field>
          <Field label="Heading"><Input value={edit.heading} onChange={(e) => setEdit({ ...edit, heading: e.target.value })} maxLength={200} placeholder={edit.defaults.heading || '(the email builds its own)'} /></Field>
          <Field label="First paragraph"><Textarea value={edit.intro} onChange={(e) => setEdit({ ...edit, intro: e.target.value })} maxLength={1500} placeholder={edit.defaults.intro || '(none: the email starts with its details)'} /></Field>
          {['welcome', 'rsvp', 'nfcShipped', 'nfcDelivered'].includes(edit.key) && <Check checked={edit.enabled} onChange={(enabled) => setEdit({ ...edit, enabled })}>Send this email</Check>}
        </Modal>
      )}
    </>
  );
}

export default function Settings() {
  const { can } = useAuth();
  const { data, error, reload } = useApi('/settings');
  const tabs = [
    can('settings.manage') && { value: 'site', label: 'Website' },
    can('settings.manage') && { value: 'security', label: 'Security' },
    can('ai.settings') && { value: 'chatbot', label: 'Website chatbot' },
    can('emails.manage') && { value: 'emails', label: 'Email templates' },
  ].filter(Boolean);
  const [f, set] = useFilters({ tab: tabs[0]?.value || 'emails' });
  const tab = tabs.some((t) => t.value === f.tab) ? f.tab : tabs[0]?.value;
  return (
    <>
      <PageHeader title="Settings" subtitle="Website, security, the website chatbot and the automatic emails. Every change is saved in the audit log." />
      <Tabs value={tab} onChange={(t) => set({ tab: t })} tabs={tabs} />
      {error && tab !== 'emails' ? <ErrorBox error={error} onRetry={reload} /> : (
        <>
          {tab === 'site' && <SiteTab data={data} reload={reload} />}
          {tab === 'security' && <SecurityTab data={data} reload={reload} />}
          {tab === 'chatbot' && <ChatbotTab data={data} reload={reload} />}
          {tab === 'emails' && <EmailsTab />}
        </>
      )}
    </>
  );
}
