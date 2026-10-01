import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ensureCsrf } from './api';

// The signed-in admin and what their role allows. Only for showing / hiding things:
// the server checks every permission again.
const AuthContext = createContext(null);

// "This browser has signed in before." Not a secret (the session is in httpOnly cookies); it only
// lets a first-time visitor see the sign-in form at once instead of waiting for a session check.
const HINT = 'aicardly_admin_signed_in';
const hint = {
  get: () => {
    try {
      return localStorage.getItem(HINT) === '1';
    } catch {
      return true;
    }
  },
  set: (on) => {
    try {
      if (on) localStorage.setItem(HINT, '1');
      else localStorage.removeItem(HINT);
    } catch {
      /* storage blocked */
    }
  },
};

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => ({ loading: hint.get(), admin: null, permissions: [] }));

  const load = useCallback(async () => {
    if (!hint.get()) {
      ensureCsrf().catch(() => {});
      return;
    }
    try {
      await ensureCsrf();
      const me = await api('/auth/me');
      setState({ loading: false, admin: me.admin, permissions: me.permissions });
    } catch {
      hint.set(false);
      setState({ loading: false, admin: null, permissions: [] });
    }
  }, []);

  useEffect(() => {
    load();
    const out = () => {
      hint.set(false);
      setState({ loading: false, admin: null, permissions: [] });
    };
    window.addEventListener('admin:signed-out', out);
    return () => window.removeEventListener('admin:signed-out', out);
  }, [load]);

  const value = useMemo(
    () => ({
      ...state,
      can: (p) => state.permissions.includes(p),
      signedIn: (me) => {
        hint.set(true);
        setState({ loading: false, admin: me.admin, permissions: me.permissions });
      },
      logout: async () => {
        await api('/auth/logout', { method: 'POST' }).catch(() => {});
        hint.set(false);
        setState({ loading: false, admin: null, permissions: [] });
      },
      reload: load,
    }),
    [state, load]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
