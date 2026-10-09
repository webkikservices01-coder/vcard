import axios from 'axios';
import { clearThemeCache } from './themeStudioCache';

// Signed-in sessions: the site token is a JWT valid for 7 days. Once it has expired (or the
// backend rejects it) the user is signed out and sent to /login?expired=1, instead of seeing an
// empty dashboard full of "Failed to load" errors.

// Seconds since epoch when the token stops working, or 0 when it can't be read.
function tokenExpiry(token) {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(part.padEnd(part.length + ((4 - (part.length % 4)) % 4), '=')));
    return typeof exp === 'number' ? exp : 0;
  } catch {
    return 0;
  }
}

// True when there is a token and it has not expired yet.
export function hasValidSession() {
  let token;
  try {
    token = localStorage.getItem('token');
  } catch {
    return false;
  }
  if (!token) return false;
  const exp = tokenExpiry(token);
  return !exp || exp * 1000 > Date.now();
}

let leaving = false;
export function endSession() {
  if (leaving) return;
  leaving = true;
  try {
    localStorage.removeItem('token');
  } catch {
    /* storage blocked */
  }
  clearThemeCache();
  window.location.replace('/login?expired=1');
}

// Any signed-in API call that comes back 401 means the session is over.
let installed = false;
export function installSessionGuard() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  axios.interceptors.response.use(
    (res) => res,
    (err) => {
      const h = err?.config?.headers;
      const sentToken = (typeof h?.get === 'function' ? h.get('x-auth-token') : null) || h?.['x-auth-token'];
      const onDashboard = /^\/(dashboard|onboarding)(\/|$)/.test(window.location.pathname);
      if (err?.response?.status === 401 && sentToken && onDashboard) endSession();
      return Promise.reject(err);
    },
  );
}
