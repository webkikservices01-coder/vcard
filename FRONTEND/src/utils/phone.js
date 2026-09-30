// Same rules as the backend (BACKEND/utils/phone.js): numbers in E.164, e.g. +919812345678.
// Indian numbers typed without a country code become +91….
export const toE164 = (raw) => {
  const s = String(raw || '').trim();
  if (!s) return '';
  const d = s.replace(/\D/g, '');
  let out;
  if (s.startsWith('+')) out = '+' + d;
  else if (d.length === 10 && /^[6-9]/.test(d)) out = '+91' + d;
  else if (d.length === 11 && d.startsWith('0')) out = '+91' + d.slice(1);
  else if (d.length === 12 && d.startsWith('91')) out = '+' + d;
  else out = '+' + d;
  return /^\+[1-9]\d{7,14}$/.test(out) ? out : '';
};
