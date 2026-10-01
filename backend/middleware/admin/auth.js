// Admin panel authentication. Only the httpOnly access cookie set by /api/admin/auth is accepted:
// signed with ADMIN_JWT_SECRET (never JWT_SECRET), audience "aicardly-admin", typ "admin".
// A site user's x-auth-token is never looked at here, so it can't work on admin routes.
const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');
const { adminConfig, COOKIES } = require('../../utils/adminConfig');
const { can } = require('../../constants/adminPermissions');

const AUDIENCE = 'aicardly-admin';
const ISSUER = 'aicardly';

const signAccessToken = (admin) =>
  jwt.sign({ sub: String(admin._id), typ: 'admin', ver: admin.tokenVersion || 0 }, adminConfig().jwtSecret, {
    expiresIn: adminConfig().accessTtlSec,
    audience: AUDIENCE,
    issuer: ISSUER,
    algorithm: 'HS256',
  });

const verifyAccessToken = (token) =>
  jwt.verify(token, adminConfig().jwtSecret, { audience: AUDIENCE, issuer: ISSUER, algorithms: ['HS256'] });

async function requireAdmin(req, res, next) {
  const token = req.cookies?.[COOKIES.access];
  if (!token) return res.status(401).json({ msg: 'Please sign in.', code: 'ADMIN_AUTH_REQUIRED' });
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    return res.status(401).json({ msg: expired ? 'Session expired.' : 'Please sign in.', code: expired ? 'ADMIN_TOKEN_EXPIRED' : 'ADMIN_AUTH_REQUIRED' });
  }
  if (payload.typ !== 'admin' || !payload.sub) return res.status(401).json({ msg: 'Please sign in.', code: 'ADMIN_AUTH_REQUIRED' });

  // Role, active flag and token version come from the database on every request, so a
  // deactivation, role change or password reset takes effect immediately.
  const admin = await Admin.findById(payload.sub).lean();
  if (!admin || !admin.isActive || (admin.tokenVersion || 0) !== (payload.ver || 0)) {
    return res.status(401).json({ msg: 'Please sign in again.', code: 'ADMIN_AUTH_REQUIRED' });
  }
  req.admin = { id: String(admin._id), name: admin.name, email: admin.email, role: admin.role, totpEnabled: !!admin.totpEnabled };
  next();
}

// Use after requireAdmin.
const requirePermission = (permission) => (req, res, next) => {
  if (!req.admin || !can(req.admin.role, permission)) {
    return res.status(403).json({ msg: "Your role can't do this.", code: 'ADMIN_FORBIDDEN' });
  }
  next();
};

module.exports = { requireAdmin, requirePermission, signAccessToken, verifyAccessToken, AUDIENCE, ISSUER };
