// Set when an admin opened this dashboard with "Sign in as user" (pages/Impersonate.jsx);
// DashboardLayout shows a banner with an exit button while it is set.
const KEY = 'aicardly_impersonating';

export function getImpersonating() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
}

// "Sign in as user" (admin) must not sign the admin's own site account out of this browser:
// their token is kept aside and put back on "Exit admin view".
const PREV = 'aicardly_own_token';
export function keepOwnSession() {
  try {
    if (!localStorage.getItem(KEY) && localStorage.getItem('token')) localStorage.setItem(PREV, localStorage.getItem('token'));
  } catch {
    /* storage blocked */
  }
}
// Puts the admin's own session back; true when there was one.
export function restoreOwnSession() {
  try {
    const own = localStorage.getItem(PREV);
    localStorage.removeItem(PREV);
    if (own) localStorage.setItem('token', own);
    else localStorage.removeItem('token');
    return !!own;
  } catch {
    return false;
  }
}

// Leaves "Sign in as user": back to the admin's own site account if they had one, else sign-in.
export function exitImpersonation() {
  setImpersonating(null);
  try {
    sessionStorage.removeItem('aicardly-theme-studio');
  } catch {
    /* storage blocked */
  }
  window.location.assign(restoreOwnSession() ? '/dashboard' : '/login');
}

export function setImpersonating(user) {
  try {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  } catch {
    /* only the banner depends on it */
  }
}
