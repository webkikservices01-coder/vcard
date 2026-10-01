// Protections in front of everything under /admin (panel) and /api/admin (API).
const helmet = require('helmet');
const cors = require('cors');
const { adminConfig, COOKIES } = require('../../utils/adminConfig');
const { safeEqual } = require('../../utils/adminCrypto');
const { clientIp } = require('../../utils/logger');

// ADMIN_ENABLED=false (or no ADMIN_JWT_SECRET): the panel and its API don't exist (404).
function adminEnabled(req, res, next) {
  if (!adminConfig().enabled) return res.status(404).json({ msg: 'Not found' });
  next();
}

// Optional ADMIN_IP_ALLOWLIST (comma-separated IPs). Unset = any IP.
function ipAllowlist(req, res, next) {
  const allow = adminConfig().ipAllowlist;
  if (!allow.length) return next();
  const ip = clientIp(req).replace(/^::ffff:/, '');
  if (allow.includes(ip)) return next();
  return res.status(403).json({ msg: 'Not allowed from this network.', code: 'ADMIN_IP_BLOCKED' });
}

// Strict headers: no framing, no third-party scripts, HTTPS only.
const adminHelmet = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'"],
      'font-src': ["'self'", 'data:'],
      'frame-ancestors': ["'none'"],
      'form-action': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'no-referrer' },
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true },
});

// The panel calls the API from its own origin; other origins only if listed in ADMIN_ORIGINS.
const adminCors = (req, res, next) =>
  cors({
    origin: (origin, cb) => cb(null, !origin || adminConfig().origins.includes(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
    maxAge: 600,
  })(req, res, next);

// Admin API answers are never cached by the browser or a proxy.
function noStore(req, res, next) {
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
  next();
}

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);
const ownOrigin = (req) => `${req.protocol}://${req.get('host')}`;

// CSRF: changing requests must come from the panel's origin (Origin header, when the browser
// sends one) AND repeat the CSRF cookie in the X-CSRF-Token header (double submit). The auth
// cookies are also SameSite=Strict.
function csrfProtect(req, res, next) {
  if (SAFE.has(req.method)) return next();
  const origin = req.get('origin');
  if (origin && origin !== ownOrigin(req) && !adminConfig().origins.includes(origin)) {
    return res.status(403).json({ msg: 'Request blocked (origin).', code: 'ADMIN_CSRF' });
  }
  const cookie = req.cookies?.[COOKIES.csrf];
  const header = req.get('x-csrf-token');
  if (!safeEqual(cookie, header)) return res.status(403).json({ msg: 'Please reload the page and try again.', code: 'ADMIN_CSRF' });
  next();
}

module.exports = { adminEnabled, ipAllowlist, adminHelmet, adminCors, noStore, csrfProtect };
