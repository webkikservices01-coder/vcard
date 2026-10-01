import { useState } from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Badge, Button, Card, DefList, Field, Input, PageHeader, useToast } from '../components/ui';
import { dateTime } from '../lib/format';

const ROLE_LABEL = { super_admin: 'Super admin', admin: 'Admin', support: 'Support' };

function ChangePassword() {
  const toast = useToast();
  const [v, setV] = useState({ currentPassword: '', newPassword: '', repeat: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (v.newPassword !== v.repeat) return setError('The new passwords do not match.');
    setBusy(true);
    setError('');
    try {
      const res = await api('/auth/password', { method: 'POST', body: { currentPassword: v.currentPassword, newPassword: v.newPassword } });
      toast(res.msg);
      setV({ currentPassword: '', newPassword: '', repeat: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const setField = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  return (
    <Card title="Change password">
      <form onSubmit={submit} className="space-y-3">
        <Field label="Current password"><Input type="password" autoComplete="current-password" value={v.currentPassword} onChange={setField('currentPassword')} required /></Field>
        <Field label="New password" hint="At least 12 characters."><Input type="password" autoComplete="new-password" value={v.newPassword} onChange={setField('newPassword')} required minLength={12} /></Field>
        <Field label="Repeat new password"><Input type="password" autoComplete="new-password" value={v.repeat} onChange={setField('repeat')} required /></Field>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
        <Button type="submit" loading={busy}>Change password</Button>
      </form>
    </Card>
  );
}

function TwoFactor() {
  const { admin, reload } = useAuth();
  const toast = useToast();
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const call = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (admin.totpEnabled) {
    return (
      <Card title="Two-factor authentication" actions={<Badge color="green">on</Badge>}>
        <p className="mb-3 text-sm text-slate-600">Sign-in asks for a code from your authenticator app. To switch it off, confirm with your password and a current code.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Password"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></Field>
          <Field label="Code"><Input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} /></Field>
        </div>
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
        <Button variant="secondary" className="mt-3" loading={busy} disabled={!password || code.length !== 6} onClick={() => call(async () => { await api('/auth/2fa/disable', { method: 'POST', body: { password, code } }); toast('2FA switched off.'); setPassword(''); setCode(''); await reload(); })}>
          <ShieldOff className="h-4 w-4" /> Switch off 2FA
        </Button>
      </Card>
    );
  }

  return (
    <Card title="Two-factor authentication" actions={<Badge color="amber">off</Badge>}>
      {!setup ? (
        <>
          <p className="mb-3 text-sm text-slate-600">Strongly recommended: a code from Google Authenticator, Authy or 1Password is needed at every sign-in.</p>
          {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          <Button loading={busy} onClick={() => call(async () => setSetup(await api('/auth/2fa/setup', { method: 'POST' })))}>
            <ShieldCheck className="h-4 w-4" /> Set up 2FA
          </Button>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">1. Scan this QR code in your authenticator app.</p>
          <img src={setup.qr} alt="QR code for your authenticator app" className="h-44 w-44 rounded-lg border border-slate-200" />
          <p className="text-xs text-slate-500">Can&apos;t scan? Enter this key: <span className="select-all font-mono">{setup.secret}</span></p>
          <p className="text-sm text-slate-600">2. Type the 6-digit code it shows.</p>
          <Field label="Code"><Input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="max-w-[160px] text-center tracking-[0.3em]" /></Field>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          <Button loading={busy} disabled={code.length !== 6} onClick={() => call(async () => { await api('/auth/2fa/enable', { method: 'POST', body: { code } }); toast('2FA is on.'); setSetup(null); setCode(''); await reload(); })}>
            Turn on 2FA
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function Account() {
  const { admin } = useAuth();
  return (
    <>
      <PageHeader title="My account" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Profile">
          <DefList items={[['Name', admin.name], ['Email', admin.email], ['Role', ROLE_LABEL[admin.role] || admin.role], ['Last sign-in', dateTime(admin.lastLoginAt)]]} />
        </Card>
        <TwoFactor />
        <ChangePassword />
      </div>
    </>
  );
}
