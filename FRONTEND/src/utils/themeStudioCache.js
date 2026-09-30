import axios from 'axios';

// Template Studio data (card + public payload + AI persona), kept in sessionStorage so the
// Theme page opens instantly. The dashboard warms it up in the background.
const API = import.meta.env.VITE_API_URL;
export const THEME_CACHE_KEY = 'aicardly-theme-studio';

export const readThemeCache = () => {
  try {
    return JSON.parse(sessionStorage.getItem(THEME_CACHE_KEY)) || null;
  } catch {
    return null;
  }
};

export const writeThemeCache = (v) => {
  try {
    sessionStorage.setItem(THEME_CACHE_KEY, JSON.stringify(v));
  } catch {
    /* storage full or blocked */
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
