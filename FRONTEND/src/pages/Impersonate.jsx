import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, Loader2 } from 'lucide-react';
import { setImpersonating, keepOwnSession } from '../utils/impersonation';
import { clearThemeCache } from '../utils/themeStudioCache';

// Opened from the admin panel ("Sign in as user"): swaps the one-time code in the URL fragment
// for a short session as that user and opens their dashboard. The fragment never reaches a server
// log, and the code works once, for a minute.
export default function Impersonate() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const code = new URLSearchParams(window.location.hash.slice(1)).get('code') || '';
    // Drop the code from the address bar and history.
    window.history.replaceState(null, '', '/impersonate');
    axios
      .post(`${import.meta.env.VITE_API_URL}/api/auth/impersonate`, { code })
      .then((res) => {
        keepOwnSession();
        localStorage.setItem('token', res.data.token);
        setImpersonating(res.data.user);
        clearThemeCache();
        navigate('/dashboard', { replace: true });
      })
      .catch((err) => setError(err.response?.data?.msg || 'This link is invalid or has expired.'));
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6 font-['Inter']" style={{ background: 'var(--surface-bg, #07090E)', color: 'var(--surface-text, #e2e8f0)' }}>
      {error ? (
        <div className="max-w-sm text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" aria-hidden="true" />
          <p className="mb-4 text-sm">{error}</p>
          <Link to="/login" className="text-sm font-semibold text-pink-500 hover:underline">Go to sign in</Link>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Opening the dashboard…
        </p>
      )}
    </div>
  );
}
