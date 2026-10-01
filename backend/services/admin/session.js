// Admin sessions: a short-lived access JWT and a rotating refresh token, both in httpOnly,
// Secure, SameSite=Strict cookies, plus a readable CSRF cookie for the double-submit check.
const Admin = require('../../models/Admin');
const AdminSession = require('../../models/AdminSession');
const { adminConfig, COOKIES } = require('../../utils/adminConfig');
const { randomToken, sha256 } = require('../../utils/adminCrypto');
const { signAccessToken } = require('../../middleware/admin/auth');
const { clientIp } = require('../../utils/logger');

const base = { httpOnly: true, secure: true, sameSite: 'strict' };

function setCsrfCookie(res, token = randomToken(24)) {
  res.cookie(COOKIES.csrf, token, { secure: true, sameSite: 'strict', httpOnly: false, path: '/' });
  return token;
}

function setAuthCookies(res, admin, refreshToken, refreshExpires) {
  const cfg = adminConfig();
  res.cookie(COOKIES.access, signAccessToken(admin), { ...base, path: '/api/admin', maxAge: cfg.accessTtlSec * 1000 });
  res.cookie(COOKIES.refresh, refreshToken, { ...base, path: '/api/admin/auth', expires: refreshExpires });
}

function clearAuthCookies(res) {
  res.clearCookie(COOKIES.access, { ...base, path: '/api/admin' });
  res.clearCookie(COOKIES.refresh, { ...base, path: '/api/admin/auth' });
}

// New session after a successful sign-in (or a password change).
async function startSession(req, res, admin) {
  const token = randomToken(48);
  const expiresAt = new Date(Date.now() + adminConfig().refreshTtlSec * 1000);
  await AdminSession.create({
    admin: admin._id,
    tokenHash: sha256(token),
    expiresAt,
    ip: clientIp(req),
    userAgent: String(req.get('user-agent') || '').slice(0, 300),
  });
  setAuthCookies(res, admin, token, expiresAt);
  setCsrfCookie(res);
}

// Swaps the refresh token for a new one. Returns { admin } or { error, reused }.
async function rotateSession(req, res) {
  const token = req.cookies?.[COOKIES.refresh];
  if (!token) return { error: 'No session' };
  const session = await AdminSession.findOne({ tokenHash: sha256(token) });
  if (!session) return { error: 'No session' };
  if (session.revokedAt) {
    // A refresh token that was already swapped is back: someone copied it. End every session.
    await revokeAllSessions(session.admin);
    return { error: 'Session reused', reused: true, adminId: session.admin };
  }
  if (session.expiresAt <= new Date()) return { error: 'Session expired' };
  const admin = await Admin.findById(session.admin);
  if (!admin || !admin.isActive) {
    await revokeAllSessions(session.admin);
    return { error: 'Account disabled' };
  }
  // Claim the old token atomically so two refreshes at once can't both succeed.
  const claimed = await AdminSession.findOneAndUpdate({ _id: session._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  if (!claimed) return { error: 'Session reused', reused: true, adminId: session.admin };
  await startSession(req, res, admin);
  return { admin };
}

async function endSession(req, res) {
  const token = req.cookies?.[COOKIES.refresh];
  if (token) await AdminSession.updateOne({ tokenHash: sha256(token), revokedAt: null }, { $set: { revokedAt: new Date() } });
  clearAuthCookies(res);
}

const revokeAllSessions = (adminId) => AdminSession.updateMany({ admin: adminId, revokedAt: null }, { $set: { revokedAt: new Date() } });

module.exports = { startSession, rotateSession, endSession, revokeAllSessions, setCsrfCookie, clearAuthCookies };
