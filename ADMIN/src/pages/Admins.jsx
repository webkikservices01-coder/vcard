import { useState } from 'react';
import { Plus, KeyRound, Unlock } from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { dateTime } from '../lib/format';
import { Badge, Button, Card, ErrorBox, Field, Input, Modal, PageHeader, Select, Table, useToast } from '../components/ui';

const ROLE_LABEL = { super_admin: 'Super admin', admin: 'Admin', support: 'Support' };
const ROLE_HELP = {
  super_admin: 'Everything, including admins and permanent deletes.',
  admin: 'Users, plans, credits, exports, logs. No admin management.',
  support: 'View everything; resend links and cards; update tickets.',
};

function NewAdmin({ roles, onClose, onSaved }) {
  const toast = useToast();
  const [v, setV] = useState({ name: '', email: '', role: 'support', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await api('/admins', { method: 'POST', body: v });
      toast('Admin created. Share the password with them privately; they can change it.');
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const setField = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  return (
    <Modal open onClose={onClose} title="New admin" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={save} loading={busy}>Create</Button></>}>
      <Field label="Name"><Input value={v.name} onChange={setField('name')} /></Field>
      <Field label="Email"><Input type="email" value={v.email} onChange={setField('email')} autoComplete="off" /></Field>
      <Field label="Role" hint={ROLE_HELP[v.role]}>
        <Select value={v.role} onChange={setField('role')}>
          {roles.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </Select>
      </Field>
      <Field label="Temporary password" hint="At least 12 characters.">
        <Input type="password" value={v.password} onChange={setField('password')} autoComplete="new-password" />
      </Field>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
    </Modal>
  );
}

function ResetPassword({ admin, onClose }) {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [reset2fa, setReset2fa] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await api(`/admins/${admin.id}/reset-password`, { method: 'POST', body: { newPassword: password, reset2fa } });
      toast(res.msg);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open onClose={onClose} title={`Reset password — ${admin.email}`} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={save} loading={busy}>Reset</Button></>}>
      <Field label="New password" hint="At least 12 characters. They are signed out everywhere.">
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
      </Field>
      {admin.totpEnabled && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={reset2fa} onChange={(e) => setReset2fa(e.target.checked)} /> Also switch off their 2FA (lost phone)
        </label>
      )}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
    </Modal>
  );
}

export default function Admins() {
  const { admin: me } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useApi('/admins');
  const [creating, setCreating] = useState(false);
  const [resetting, setResetting] = useState(null);

  const patch = async (a, body, msg) => {
    try {
      await api(`/admins/${a.id}`, { method: 'PATCH', body });
      toast(msg);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  };
  const unlock = async (a) => {
    try {
      await api(`/admins/${a.id}/unlock`, { method: 'POST' });
      toast('Unlocked.');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  if (error) return <ErrorBox error={error} onRetry={reload} />;
  return (
    <>
      <PageHeader title="Admins" subtitle="Who can use this panel, and what they can do." actions={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New admin</Button>} />
      <Card padded={false}>
        <Table
          loading={loading}
          rows={data?.admins}
          columns={[
            { key: 'name', label: 'Admin', render: (a) => <div><p className="font-medium text-slate-900">{a.name}{a.id === me.id && <span className="ml-1 text-xs text-slate-400">(you)</span>}</p><p className="text-xs text-slate-500">{a.email}</p></div> },
            {
              key: 'role',
              label: 'Role',
              render: (a) =>
                a.id === me.id ? (
                  ROLE_LABEL[a.role]
                ) : (
                  <Select value={a.role} onChange={(e) => window.confirm(`Change ${a.email} to ${ROLE_LABEL[e.target.value]}? They will be signed out.`) && patch(a, { role: e.target.value }, 'Role changed.')} className="h-8 w-36 text-xs" aria-label={`Role of ${a.email}`}>
                    {data.roles.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                  </Select>
                ),
            },
            { key: 'status', label: 'Status', render: (a) => <div className="flex flex-wrap gap-1"><Badge color={a.isActive ? 'green' : 'slate'}>{a.isActive ? 'active' : 'deactivated'}</Badge>{a.totpEnabled && <Badge color="blue">2FA</Badge>}{a.locked && <Badge color="red">locked</Badge>}</div> },
            { key: 'lastLoginAt', label: 'Last sign-in', render: (a) => dateTime(a.lastLoginAt) },
            {
              key: 'actions',
              label: '',
              render: (a) =>
                a.id !== me.id && (
                  <div className="flex flex-wrap justify-end gap-1">
                    {a.locked && <Button size="sm" variant="secondary" onClick={() => unlock(a)}><Unlock className="h-3.5 w-3.5" /> Unlock</Button>}
                    <Button size="sm" variant="secondary" onClick={() => setResetting(a)}><KeyRound className="h-3.5 w-3.5" /> Reset password</Button>
                    <Button size="sm" variant={a.isActive ? 'danger' : 'secondary'} onClick={() => window.confirm(`${a.isActive ? 'Deactivate' : 'Reactivate'} ${a.email}?`) && patch(a, { isActive: !a.isActive }, a.isActive ? 'Deactivated and signed out.' : 'Reactivated.')}>
                      {a.isActive ? 'Deactivate' : 'Reactivate'}
                    </Button>
                  </div>
                ),
            },
          ]}
        />
      </Card>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {Object.entries(ROLE_HELP).map(([r, t]) => (
          <div key={r} className="rounded-xl border border-slate-200 bg-surface p-4 text-sm">
            <p className="font-medium text-slate-900">{ROLE_LABEL[r]}</p>
            <p className="mt-1 text-slate-500">{t}</p>
          </div>
        ))}
      </div>
      {creating && <NewAdmin roles={data?.roles || []} onClose={() => setCreating(false)} onSaved={reload} />}
      {resetting && <ResetPassword admin={resetting} onClose={() => setResetting(null)} />}
    </>
  );
}
