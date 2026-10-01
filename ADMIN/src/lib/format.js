// Display helpers. Times are shown in IST, the business's time zone.
const TZ = 'Asia/Kolkata';

export const dateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { timeZone: TZ, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export const dateOnly = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { timeZone: TZ, day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export const money = (rupees) => `₹${Number(rupees || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const num = (n) => Number(n || 0).toLocaleString('en-IN');

export function timeLeft(d) {
  if (!d) return '';
  const ms = new Date(d) - Date.now();
  if (ms <= 0) return 'expired';
  const h = Math.floor(ms / 3600000);
  if (h >= 48) return `${Math.floor(h / 24)} days left`;
  if (h >= 1) return `${h}h left`;
  return `${Math.max(1, Math.floor(ms / 60000))} min left`;
}

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?';
