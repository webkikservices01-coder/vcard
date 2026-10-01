// /api/admin/auth: sign-in (password, then 2FA code when switched on), refresh, sign-out,
// current admin, password change and 2FA setup.
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Admin = require('../../models/Admin');
const { toSafeAdmin } = require('../../models/Admin');
const { adminConfig, COOKIES } = require('../../utils/adminConfig');
const { encrypt, decrypt, randomToken, safeEqual } = require('../../utils/adminCrypto');
const { runAdminSetup } = require('../../services/admin/setup');
const { generateSecret, verifyTotp, otpauthUrl } = require('../../utils/totp');
const { requireAdmin, verifyAccessToken, AUDIENCE, ISSUER } = require('../../middleware/admin/auth');
const { validate, z } = require('../../middleware/admin/validate');
const { permissionsOf } = require('../../constants/adminPermissions');
const { startSession, rotateSession, endSession, revokeAllSessions, setCsrfCookie, clearAuthCookies } = require('../../services/admin/session');
const { audit } = require('../../services/admin/audit');
const { clientIp } = require('../../utils/logger');

const router = express.Router();

// Per IP, on top of the per-account lockout below: 10 failed attempts per 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  // Only failed attempts count, so a team signing in from one office isn't locked out.
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many sign-in attempts. Please wait 15 minutes.', code: 'ADMIN_RATE_LIMIT' },
});

const password = z.string().min(12, 'must be at least 12 characters').max(128);
const email = z.string().trim().toLowerCase().email().max(200);
// bcrypt of a random string, compared against when the email doesn't exist, so the reply takes
// as long as for a real account (no account discovery by timing).
let dummyHash = null;
const DUMMY_HASH = () => (dummyHash = dummyHash || bcrypt.hashSync(randomToken(), 12));
const GENERIC = 'Invalid email or password.';

const me = (admin) => ({ admin: toSafeAdmin(admin), permissions: permissionsOf(admin.role) });

async function recordFailure(admin) {
  const cfg = adminConfig();
  const failed = (admin.failedLogins || 0) + 1;
  const update = failed >= cfg.maxFailedLogins
    ? { failedLogins: 0, lockUntil: new Date(Date.now() + cfg.lockMinutes * 60 * 1000) }
    : { failedLogins: failed };
  await Admin.updateOne({ _id: admin._id }, { $set: update });
  return !!update.lockUntil;
}

const lockedReply = (res, admin) => {
  const mins = Math.max(1, Math.ceil((new Date(admin.lockUntil) - Date.now()) / 60000));
  return res.status(423).json({ msg: `Too many failed attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.`, code: 'ADMIN_LOCKED' });
};

async function completeLogin(req, res, admin) {
  await Admin.updateOne({ _id: admin._id }, { $set: { failedLogins: 0, lockUntil: null, lastLoginAt: new Date(), lastLoginIp: clientIp(req) } });
  await startSession(req, res, admin);
  await audit(req, 'auth.login', { admin: toSafeAdmin(admin), targetType: 'admin', targetId: admin._id, summary: 'Signed in' });
  res.json(me(admin));
}

// GET /csrf → sets the CSRF cookie (the panel calls this once on load) and returns it.
router.get('/csrf', (req, res) => {
  res.json({ csrfToken: setCsrfCookie(res) });
});

// POST /login { email, password } → signed in, or { twoFactorRequired, challenge }.
router.post('/login', loginLimiter, validate({ body: z.object({ email, password: z.string().min(1).max(128) }) }), async (req, res) => {
  const { email: mail, password: pass } = req.v.body;
  const admin = await Admin.findOne({ email: mail }).select('+passwordHash');
  if (!admin) {
    await bcrypt.compare(pass, DUMMY_HASH());
    await audit(req, 'auth.login.failed', { summary: `Unknown email ${mail}`, success: false, meta: { email: mail } });
    return res.status(401).json({ msg: GENERIC });
  }
  if (admin.lockUntil && admin.lockUntil > new Date()) {
    await audit(req, 'auth.login.locked', { admin: toSafeAdmin(admin), targetType: 'admin', targetId: admin._id, summary: 'Sign-in while locked', success: false });
    return lockedReply(res, admin);
  }
  if (!(await bcrypt.compare(pass, admin.passwordHash))) {
    const locked = await recordFailure(admin);
    await audit(req, 'auth.login.failed', { admin: toSafeAdmin(admin), targetType: 'admin', targetId: admin._id, summary: locked ? 'Wrong password – account locked' : 'Wrong password', success: false });
    return res.status(401).json({ msg: GENERIC });
  }
  if (!admin.isActive) {
    await audit(req, 'auth.login.inactive', { admin: toSafeAdmin(admin), targetType: 'admin', targetId: admin._id, summary: 'Sign-in to a deactivated admin', success: false });
    return res.status(403).json({ msg: 'This admin account is deactivated.' });
  }
  if (admin.totpEnabled) {
    const challenge = jwt.sign({ sub: String(admin._id), typ: 'admin_2fa', ver: admin.tokenVersion || 0 }, adminConfig().jwtSecret, {
      expiresIn: 300,
      audience: `${AUDIENCE}-2fa`,
      issuer: ISSUER,
      algorithm: 'HS256',
    });
    return res.json({ twoFactorRequired: true, challenge });
  }
  await completeLogin(req, res, admin);
});

// POST /login/2fa { challenge, code } → second step when 2FA is on.
router.post('/login/2fa', loginLimiter, validate({ body: z.object({ challenge: z.string().min(10).max(2000), code: z.string().trim().regex(/^\d{6}$/, 'must be 6 digits') }) }), async (req, res) => {
  let payload;
  try {
    payload = jwt.verify(req.v.body.challenge, adminConfig().jwtSecret, { audience: `${AUDIENCE}-2fa`, issuer: ISSUER, algorithms: ['HS256'] });
  } catch {
    return res.status(401).json({ msg: 'This sign-in step expired. Please start again.', code: 'ADMIN_2FA_EXPIRED' });
  }
  if (payload.typ !== 'admin_2fa') return res.status(401).json({ msg: GENERIC });
  const admin = await Admin.findById(payload.sub).select('+totpSecretEnc');
  if (!admin || !admin.isActive || !admin.totpEnabled || (admin.tokenVersion || 0) !== payload.ver) return res.status(401).json({ msg: GENERIC });
  if (admin.lockUntil && admin.lockUntil > new Date()) return lockedReply(res, admin);
  if (!verifyTotp(decrypt(admin.totpSecretEnc), req.v.body.code)) {
    const locked = await recordFailure(admin);
    await audit(req, 'auth.2fa.failed', { admin: toSafeAdmin(admin), targetType: 'admin', targetId: admin._id, summary: locked ? 'Wrong 2FA code – account locked' : 'Wrong 2FA code', success: false });
    return res.status(401).json({ msg: 'Wrong code. Please try again.' });
  }
  await completeLogin(req, res, admin);
});

// POST /bootstrap { email, name, password } with header X-Bootstrap-Token → creates the first
// super admin and runs the admin setup (plans, plan history), for hosts where the scripts can't
// reach the production database. Works only while ADMIN_BOOTSTRAP_TOKEN (32+ characters) is set
// AND no admin exists yet; remove ADMIN_BOOTSTRAP_TOKEN afterwards. Answers 404 otherwise.
// Token and "no admin yet" are checked before anything else, so the route looks like it
// doesn't exist to everyone else.
async function bootstrapAllowed(req, res, next) {
  const token = process.env.ADMIN_BOOTSTRAP_TOKEN || '';
  if (token.length < 32 || !safeEqual(req.get('x-bootstrap-token'), token)) return res.status(404).json({ msg: 'Not found' });
  if (await Admin.exists({})) return res.status(404).json({ msg: 'Not found' });
  next();
}

router.post('/bootstrap', loginLimiter, bootstrapAllowed, validate({ body: z.object({ email, name: z.string().trim().min(2).max(80), password }) }), async (req, res) => {
  const { email: mail, name, password: pass } = req.v.body;
  const admin = await Admin.create({ name, email: mail, role: 'super_admin', passwordHash: await bcrypt.hash(pass, 12) });
  await audit(req, 'admin.seed', { admin: toSafeAdmin(admin), targetType: 'admin', targetId: admin._id, summary: `First super admin created with the bootstrap token: ${mail}` });
  const setup = await runAdminSetup();
  res.status(201).json({ msg: 'Super admin created. Now remove ADMIN_BOOTSTRAP_TOKEN.', admin: toSafeAdmin(admin), setup });
});

// POST /refresh → new access + refresh cookies.
router.post('/refresh', async (req, res) => {
  const result = await rotateSession(req, res);
  if (result.error) {
    clearAuthCookies(res);
    if (result.reused) await audit(req, 'auth.session.reused', { targetType: 'admin', targetId: result.adminId, summary: 'Refresh token reused – all sessions ended', success: false });
    return res.status(401).json({ msg: 'Please sign in again.', code: 'ADMIN_AUTH_REQUIRED' });
  }
  res.json(me(result.admin));
});

// POST /logout
router.post('/logout', async (req, res) => {
  let who;
  try {
    const p = verifyAccessToken(req.cookies?.[COOKIES.access]);
    who = { id: p.sub };
  } catch {
    /* already expired: still sign out */
  }
  await endSession(req, res);
  await audit(req, 'auth.logout', { admin: who, targetType: 'admin', targetId: who?.id, summary: 'Signed out' });
  res.json({ ok: true });
});

router.get('/me', requireAdmin, async (req, res) => {
  const admin = await Admin.findById(req.admin.id);
  res.json(me(admin));
});

// POST /password { currentPassword, newPassword } → signs out every other session.
router.post('/password', requireAdmin, validate({ body: z.object({ currentPassword: z.string().min(1).max(128), newPassword: password }) }), async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('+passwordHash');
  if (!(await bcrypt.compare(req.v.body.currentPassword, admin.passwordHash))) {
    await audit(req, 'auth.password.failed', { targetType: 'admin', targetId: admin._id, summary: 'Wrong current password', success: false });
    return res.status(400).json({ msg: 'Current password is wrong.' });
  }
  admin.passwordHash = await bcrypt.hash(req.v.body.newPassword, 12);
  admin.passwordChangedAt = new Date();
  admin.tokenVersion = (admin.tokenVersion || 0) + 1;
  await admin.save();
  await revokeAllSessions(admin._id);
  await startSession(req, res, admin);
  await audit(req, 'auth.password.changed', { targetType: 'admin', targetId: admin._id, summary: 'Changed own password' });
  res.json({ msg: 'Password changed. Other devices were signed out.' });
});

// POST /2fa/setup → new secret (pending until confirmed with a code).
router.post('/2fa/setup', requireAdmin, async (req, res) => {
  const admin = await Admin.findById(req.admin.id);
  if (admin.totpEnabled) return res.status(400).json({ msg: '2FA is already on.' });
  const secret = generateSecret();
  admin.totpPendingEnc = encrypt(secret);
  await admin.save();
  const url = otpauthUrl(secret, admin.email, adminConfig().totpIssuer);
  res.json({ secret, otpauthUrl: url, qr: await require('qrcode').toDataURL(url, { margin: 1, width: 220 }) });
});

// POST /2fa/enable { code }
router.post('/2fa/enable', requireAdmin, validate({ body: z.object({ code: z.string().trim().regex(/^\d{6}$/, 'must be 6 digits') }) }), async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('+totpPendingEnc');
  if (!admin.totpPendingEnc) return res.status(400).json({ msg: 'Start the 2FA setup first.' });
  const secret = decrypt(admin.totpPendingEnc);
  if (!verifyTotp(secret, req.v.body.code)) return res.status(400).json({ msg: 'Wrong code. Check the time on your phone and try again.' });
  admin.totpSecretEnc = encrypt(secret);
  admin.totpPendingEnc = '';
  admin.totpEnabled = true;
  await admin.save();
  await audit(req, 'auth.2fa.enabled', { targetType: 'admin', targetId: admin._id, summary: '2FA switched on' });
  res.json({ msg: '2FA is on.' });
});

// POST /2fa/disable { password, code }
router.post('/2fa/disable', requireAdmin, validate({ body: z.object({ password: z.string().min(1).max(128), code: z.string().trim().regex(/^\d{6}$/, 'must be 6 digits') }) }), async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('+passwordHash +totpSecretEnc');
  if (!admin.totpEnabled) return res.status(400).json({ msg: '2FA is already off.' });
  const ok = (await bcrypt.compare(req.v.body.password, admin.passwordHash)) && verifyTotp(decrypt(admin.totpSecretEnc), req.v.body.code);
  if (!ok) return res.status(400).json({ msg: 'Wrong password or code.' });
  admin.totpEnabled = false;
  admin.totpSecretEnc = '';
  await admin.save();
  await audit(req, 'auth.2fa.disabled', { targetType: 'admin', targetId: admin._id, summary: '2FA switched off' });
  res.json({ msg: '2FA is off.' });
});

module.exports = router;
module.exports.passwordSchema = password;
