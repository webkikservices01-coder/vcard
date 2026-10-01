import axios from 'axios';

// Template Studio data (card + public payload + AI persona), kept in sessionStorage so the
// Theme page opens instantly. The dashboard warms it up in the background.
const API = import.meta.env.VITE_API_URL;
export const THEME_CACHE_KEY = 'aicardly-theme-studio';

// The signed-in account (from the token), so one account never sees another's cached card
// after a sign-out / sign-in or a new sign-up in the same tab.
const currentUserId = () => {
  try {
    const t = localStorage.getItem('token') || '';
    return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).userId || '';
  } catch {
    return '';
  }
};

export const readThemeCache = () => {
  try {
    const v = JSON.parse(sessionStorage.getItem(THEME_CACHE_KEY)) || null;
    if (!v || !v.owner || v.owner !== currentUserId()) return null;
    return v;
  } catch {
    return null;
  }
};

export const writeThemeCache = (v) => {
  try {
    sessionStorage.setItem(THEME_CACHE_KEY, JSON.stringify({ ...v, owner: currentUserId() }));
  } catch {
    /* storage full or blocked */
  }
};

export const clearThemeCache = () => {
  try {
    sessionStorage.removeItem(THEME_CACHE_KEY);
  } catch {
    /* storage blocked */
  }
};

// Loads everything the studio shows. Returns { card, payload, aiPersona } (payload null when no card).
export async function loadThemeStudio() {
  const headers = { 'x-auth-token': localStorage.getItem('token') };
  const { data: card } = await axios.get(`${API}/api/vcard/me`, { headers });
  let payload = { card };
  let aiPersona = null;
  if (card.username) {
    const [pub, ai] = await Promise.allSettled([
      axios.get(`${API}/api/vcard/public/${card.username}`),
      axios.get(`${API}/api/ai/public/${card.username}`),
    ]);
    if (pub.status === 'fulfilled') payload = pub.value.data;
    if (ai.status === 'fulfilled') aiPersona = ai.value.data;
  }
  writeThemeCache({ payload, aiPersona });
  return { card, payload, aiPersona };
}

// Fills the cache once per session, if it is empty.
export function warmThemeStudio() {
  if (readThemeCache() || !localStorage.getItem('token')) return;
  loadThemeStudio().catch(() => {});
}
