// Support staff see contact details masked (ra•••@gmail.com, +91 98•••••210). They can still email
// users a reset / verification link; admins and super admins see everything.
const KEYS = new Set(['email', 'phone', 'mobile', 'to', 'customerEmail', 'customerPhone']);

const maskEmail = (e) => {
  const [user, domain] = String(e).split('@');
  if (!domain) return '•••';
  return `${user.slice(0, 2)}${'•'.repeat(Math.max(1, Math.min(6, user.length - 2)))}@${domain}`;
};
const maskPhone = (p) => {
  const d = String(p);
  if (d.length < 6) return '•••';
  return `${d.slice(0, d.startsWith('+') ? 5 : 2)}${'•'.repeat(Math.max(1, d.length - (d.startsWith('+') ? 8 : 5)))}${d.slice(-3)}`;
};
const maskValue = (v) => (typeof v !== 'string' || !v ? v : v.includes('@') ? maskEmail(v) : /\d{6,}/.test(v.replace(/\D/g, '')) ? maskPhone(v) : v);

function deepMask(x, depth = 0) {
  if (depth > 8 || x == null) return x;
  if (Array.isArray(x)) return x.map((v) => deepMask(v, depth + 1));
  if (x instanceof Date || typeof x !== 'object') return x;
  if (typeof x.toHexString === 'function') return x; // ObjectId
  const out = {};
  for (const [k, v] of Object.entries(x)) out[k] = KEYS.has(k) ? maskValue(v) : deepMask(v, depth + 1);
  return out;
}

function maskForSupport(req, res, next) {
  if (req.admin?.role !== 'support') return next();
  const json = res.json.bind(res);
  res.json = (body) => json(deepMask(JSON.parse(JSON.stringify(body ?? null))));
  next();
}

module.exports = { maskForSupport, maskEmail, maskPhone };
