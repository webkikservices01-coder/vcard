import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// "Continue with Google" on the sign-in and sign-up pages. Shown only when VITE_GOOGLE_CLIENT_ID is
// set (the same id as GOOGLE_CLIENT_ID on the server). Google's own button (Google Identity
// Services) gives an ID token; POST /api/auth/google checks it and signs the person in, making
// their account on the first visit.
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT = 'https://accounts.google.com/gsi/client';

function loadScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let s = document.querySelector(`script[src="${SCRIPT}"]`);
    if (!s) {
      s = document.createElement('script');
      s.src = SCRIPT;
      s.async = true;
      document.head.appendChild(s);
    }
    s.addEventListener('load', () => resolve());
    s.addEventListener('error', () => reject(new Error('Google sign-in could not load')));
  });
}

export default function GoogleSignIn({ isDark, mode = 'signin', onError, onSignedIn }) {
  const box = useRef(null);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return undefined;
    let live = true;
    loadScript()
      .then(() => {
        if (!live || !box.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          ux_mode: 'popup',
          callback: async ({ credential }) => {
            setBusy(true);
            try {
              const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, { credential, acceptTerms: true });
              localStorage.setItem('token', res.data.token);
              onSignedIn?.(res.data);
              navigate(res.data.created ? '/onboarding' : '/dashboard');
            } catch (err) {
              onError?.(err.response?.data?.msg || 'Google sign-in failed. Please try again.');
            } finally {
              setBusy(false);
            }
          },
        });
        window.google.accounts.id.renderButton(box.current, {
          theme: isDark ? 'filled_black' : 'outline',
          size: 'large',
          shape: 'pill',
          text: mode === 'signup' ? 'signup_with' : 'continue_with',
          width: Math.min(360, box.current.offsetWidth || 320),
        });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark, mode]);

  if (!CLIENT_ID) return null;
  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--surface-text-2)' }}>
        <span className="h-px flex-1" style={{ background: 'var(--surface-border)' }} /> or <span className="h-px flex-1" style={{ background: 'var(--surface-border)' }} />
      </div>
      <div ref={box} className={`mt-4 flex justify-center ${busy ? 'pointer-events-none opacity-60' : ''}`} aria-busy={busy} />
      {mode === 'signup' && (
        <p className="mt-2 text-center text-[11px]" style={{ color: 'var(--surface-text-2)' }}>
          By continuing with Google you accept the <a href="/terms-conditions" className="underline">Terms</a> and <a href="/privacy-policy" className="underline">Privacy Policy</a>.
        </p>
      )}
    </div>
  );
}
