// Talks to /api/admin on the same origin. Auth lives in httpOnly cookies set by the server; this
// file only repeats the CSRF cookie in a header and refreshes the session once when it expires.
// Nothing about the session is kept in localStorage.
const API = '/api/admin';
const CSRF_COOKIE = 'aicardly_admin_csrf';

export class ApiError extends Error {
  constructor(message, status, code, data) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

const readCookie = (name) =>
  document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1) || '';

export async function ensureCsrf() {
  if (!readCookie(CSRF_COOKIE)) await fetch(`${API}/auth/csrf`, { credentials: 'same-origin' });
}

let refreshing = null;
function refreshSession() {
  refreshing =
    refreshing ||
    fetch(`${API}/auth/refresh`, { method: 'POST', credentials: 'same-origin', headers: { 'X-CSRF-Token': readCookie(CSRF_COOKIE) } })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  return refreshing;
}

const SESSION_CODES = new Set(['ADMIN_TOKEN_EXPIRED', 'ADMIN_AUTH_REQUIRED']);

export async function api(path, { method = 'GET', body, retry = true } = {}) {
  const changing = method !== 'GET';
  if (changing) await ensureCsrf();
  const res = await fetch(API + path, {
    method,
    credentials: 'same-origin',
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(changing && { 'X-CSRF-Token': readCookie(CSRF_COOKIE) }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok) return data;

  if (res.status === 401 && retry && SESSION_CODES.has(data.code) && !path.startsWith('/auth/login')) {
    if (await refreshSession()) return api(path, { method, body, retry: false });
    window.dispatchEvent(new Event('admin:signed-out'));
  }
  if (res.status === 403 && data.code === 'ADMIN_CSRF' && retry) {
    await fetch(`${API}/auth/csrf`, { credentials: 'same-origin' });
    return api(path, { method, body, retry: false });
  }
  throw new ApiError(data.msg || `Request failed (${res.status})`, res.status, data.code, data);
}

// Query string from an object, skipping empty values.
export const qs = (params) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString();
  return s ? `?${s}` : '';
};

// CSV / xlsx downloads: a plain link (the session cookie goes along on the same origin).
export const downloadUrl = (path, params = {}) => API + path + qs(params);
