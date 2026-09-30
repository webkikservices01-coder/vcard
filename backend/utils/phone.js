// Phone numbers in E.164 (+<country><number>, e.g. +919812345678), as WhatsApp and Razorpay expect.
// Indian numbers typed without a country code (98123 45678, 09812345678, 919812345678) become +91….
const E164_RE = /^\+[1-9]\d{7,14}$/;

const toE164 = (raw) => {
  const s = String(raw || '').trim();
  if (!s) return '';
  const digits = s.replace(/\D/g, '');
  let out;
  if (s.startsWith('+')) out = '+' + digits;
  else if (digits.length === 10 && /^[6-9]/.test(digits)) out = '+91' + digits;
  else if (digits.length === 11 && digits.startsWith('0')) out = '+91' + digits.slice(1);
  else if (digits.length === 12 && digits.startsWith('91')) out = '+' + digits;
  else out = '+' + digits;
  return E164_RE.test(out) ? out : '';
};

module.exports = { toE164, E164_RE };
