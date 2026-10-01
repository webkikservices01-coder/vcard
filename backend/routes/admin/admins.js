// /api/admin/admins (super admin only): create, edit role / name, deactivate, reset password,
// reset 2FA, unlock. There is always at least one active super admin.
const express = require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../../models/Admin');
const { ROLES, toSafeAdmin } = require('../../models/Admin');
const { requirePermission } = require('../../middleware/admin/auth');
const { validate, z, idParams } = require('../../middleware/admin/validate');
const { revokeAllSessions } = require('../../services/admin/session');
const { audit } = require('../../services/admin/audit');
const { passwordSchema } = require('./auth');

const router = express.Router();
router.use(requirePermission('admins.manage'));

router.get('/', async (req, res) => {
  const admins = await Admin.find().sort({ createdAt: 1 }).lean();
  res.json({ admins: admins.map(toSafeAdmin), roles: ROLES });
});

router.post('/', validate({ body: z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().toLowerCase().email().max(200), role: z.enum(ROLES), password: passwordSchema }) }), async (req, res) => {
  const { name, email, role, password } = req.v.body;
  if (await Admin.exists({ email })) return res.status(400).json({ msg: 'An admin with this email already exists.' });
  const admin = await Admin.create({ name, email, role, passwordHash: await bcrypt.hash(password, 12), createdBy: req.admin.id });
  await audit(req, 'admin.create', { targetType: 'admin', targetId: admin._id, summary: `Created ${role} ${email}` });
  res.status(201).json({ admin: toSafeAdmin(admin) });
});

// Would this change leave no active super admin?
async function lastSuperAdmin(target, next) {
  if (target.role !== 'super_admin' || !target.isActive) return false;
  if (next.role === 'super_admin' && next.isActive) return false;
  return (await Admin.countDocuments({ role: 'super_admin', isActive: true })) <= 1;
}

router.patch('/:id', validate({ params: idParams, body: z.object({ name: z.string().trim().min(2).max(80).optional(), role: z.enum(ROLES).optional(), isActive: z.boolean().optional() }) }), async (req, res) => {
  const admin = await Admin.findById(req.v.params.id);
  if (!admin) return res.status(404).json({ msg: 'Admin not found.' });
  const { name, role, isActive } = req.v.body;
  const self = String(admin._id) === req.admin.id;
  if (self && ((role && role !== admin.role) || isActive === false)) return res.status(400).json({ msg: "You can't change your own role or deactivate yourself." });
  const next = { role: role || admin.role, isActive: isActive ?? admin.isActive };
  if (await lastSuperAdmin(admin, next)) return res.status(400).json({ msg: 'There must always be at least one active super admin.' });

  const changes = {};
  if (name && name !== admin.name) changes.name = [admin.name, name];
  if (role && role !== admin.role) changes.role = [admin.role, role];
  if (isActive !== undefined && isActive !== admin.isActive) changes.isActive = [admin.isActive, isActive];
  if (!Object.keys(changes).length) return res.json({ admin: toSafeAdmin(admin) });

  if (name) admin.name = name;
  if (role) admin.role = role;
  if (isActive !== undefined) admin.isActive = isActive;
  // Role change or deactivation: sign them out everywhere.
  if (changes.role || changes.isActive) {
    admin.tokenVersion = (admin.tokenVersion || 0) + 1;
    await revokeAllSessions(admin._id);
  }
  await admin.save();
  await audit(req, 'admin.update', { targetType: 'admin', targetId: admin._id, summary: `Updated ${admin.email}: ${Object.keys(changes).join(', ')}`, meta: changes });
  res.json({ admin: toSafeAdmin(admin) });
});

router.post('/:id/reset-password', validate({ params: idParams, body: z.object({ newPassword: passwordSchema, reset2fa: z.boolean().optional().default(false) }) }), async (req, res) => {
  const admin = await Admin.findById(req.v.params.id);
  if (!admin) return res.status(404).json({ msg: 'Admin not found.' });
  if (String(admin._id) === req.admin.id) return res.status(400).json({ msg: 'Change your own password from your account page.' });
  admin.passwordHash = await bcrypt.hash(req.v.body.newPassword, 12);
  admin.passwordChangedAt = new Date();
  admin.tokenVersion = (admin.tokenVersion || 0) + 1;
  admin.failedLogins = 0;
  admin.lockUntil = null;
  if (req.v.body.reset2fa) {
    admin.totpEnabled = false;
    admin.totpSecretEnc = '';
    admin.totpPendingEnc = '';
  }
  await admin.save();
  await revokeAllSessions(admin._id);
  await audit(req, 'admin.reset_password', { targetType: 'admin', targetId: admin._id, summary: `Reset password of ${admin.email}${req.v.body.reset2fa ? ' and 2FA' : ''}` });
  res.json({ msg: 'Password reset. They were signed out everywhere.' });
});

router.post('/:id/unlock', validate({ params: idParams }), async (req, res) => {
  const admin = await Admin.findByIdAndUpdate(req.v.params.id, { $set: { failedLogins: 0, lockUntil: null } }, { returnDocument: 'after' });
  if (!admin) return res.status(404).json({ msg: 'Admin not found.' });
  await audit(req, 'admin.unlock', { targetType: 'admin', targetId: admin._id, summary: `Unlocked ${admin.email}` });
  res.json({ admin: toSafeAdmin(admin) });
});

module.exports = router;
