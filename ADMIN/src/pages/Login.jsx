import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Button, Field, Input } from '../components/ui';

export default function Login() {
  const { signedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [challenge, setChallenge] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (!challenge) {
        const res = await api('/auth/login', { method: 'POST', body: { email, password } });
        if (res.twoFactorRequired) {
          setChallenge(res.challenge);
          setPassword('');
        } else signedIn(res);
      } else {
        signedIn(await api('/auth/login/2fa', { method: 'POST', body: { challenge, code } }));
      }
    } catch (err) {
      if (err.code === 'ADMIN_2FA_EXPIRED') {
        setChallenge('');
        setCode('');
      }
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-brand">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            <span className="text-brand-gradient">Ai</span>cardly Admin
          </h1>
          <p className="mt-1 text-sm text-slate-500">{challenge ? 'Enter the 6-digit code from your authenticator app.' : 'Sign in with your admin account.'}</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-200 bg-surface/90 p-7 shadow-2xl backdrop-blur-xl">
          {!challenge ? (
            <>
              <Field label="Email">
                <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
              </Field>
              <Field label="Password">
                <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </Field>
            </>
          ) : (
            <Field label="Authentication code">
              <Input inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required autoFocus className="text-center text-lg tracking-[0.4em]" />
            </Field>
          )}
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          <Button type="submit" className="w-full" loading={busy}>
            {challenge ? 'Verify' : 'Sign in'}
          </Button>
          {challenge && (
            <button type="button" className="w-full text-center text-xs text-slate-500 hover:text-slate-700" onClick={() => { setChallenge(''); setCode(''); setError(''); }}>
              Use a different account
            </button>
          )}
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">Admin access only. Every action is logged.</p>
      </div>
    </div>
  );
}
