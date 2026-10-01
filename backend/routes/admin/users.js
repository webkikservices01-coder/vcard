// /api/admin/users: list, export, detail, block, remove, plans, credits.
const express = require('express');
const Plan = require('../../models/Plan');
const { requirePermission } = require('../../middleware/admin/auth');
const { validate, z, idParams, objectId, paging, search } = require('../../middleware/admin/validate');
const svc = require('../../services/admin/users');
const { audit } = require('../../services/admin/audit');
const { sendCsv } = require('../../utils/csv');

const router = express.Router();

const listQuery = z.object({
  ...paging,
  q: search,
  status: z.enum(['', 'active', 'blocked', 'removed', 'all']).optional().default(''),
  plan: z.string().trim().max(40).optional().default(''),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sort: z.enum(['createdAt', 'name', 'email', 'planExpiry']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});
const reason = z.string().trim().max(500).optional().default('');
const days = z.coerce.number().int().min(1).max(3650);

const fmt = (d) => (d ? new Date(d).toISOString() : '');

router.get('/', requirePermission('users.view'), validate({ query: listQuery }), async (req, res) => {
  res.json(await svc.listUsers(req.v.query));
});

router.get('/export', requirePermission('export.csv'), validate({ query: listQuery }), async (req, res) => {
  const rows = await svc.listUsers(req.v.query, { all: true });
  await audit(req, 'export.users', { summary: `Exported ${rows.length} users (CSV)`, meta: { filters: req.v.query } });
  sendCsv(res, 'aicardly-users', rows, [
    { header: 'Name', value: (u) => u.name },
    { header: 'Email', value: (u) => u.email },
    { header: 'Phone', value: (u) => u.phone },
    { header: 'Signed up', value: (u) => fmt(u.createdAt) },
    { header: 'Plan', value: (u) => u.planName },
    { header: 'Plan start', value: (u) => fmt(u.planStart) },
    { header: 'Plan expiry', value: (u) => fmt(u.planExpiry) },
    { header: 'Cards', value: (u) => u.cardsCount },
    { header: 'Total paid (INR)', value: (u) => u.totalPaid },
    { header: 'Free card credits', value: (u) => u.freeCardCredits || 0 },
    { header: 'Status', value: (u) => u.status },
    { header: 'Email verified', value: (u) => (u.emailVerified === false ? 'no' : 'yes') },
  ]);
});

// New account (admin+). Without a password, the user is emailed a link to set one.
router.post('/', requirePermission('users.create'), validate({
  body: z.object({
    name: z.string().trim().min(2, 'name is too short').max(80),
    email: z.string().trim().toLowerCase().email('not a valid email').max(200),
    phone: z.string().trim().max(30).optional().default(''),
    password: z.string().min(8, 'use at least 8 characters').max(128).optional().or(z.literal('').transform(() => undefined)),
    emailVerified: z.boolean().default(true),
    reason: z.string().trim().max(500).optional().default(''),
  }),
}), async (req, res) => {
  try {
    const { reason: why, ...fields } = req.v.body;
    const user = await svc.createUser(fields);
    let emailed = false;
    if (!fields.password) {
      const { sendResetLink } = require('../../services/accountEmails');
      emailed = await sendResetLink(user).catch(() => false);
    }
    await audit(req, 'user.create', { targetType: 'user', targetId: user._id, summary: `Created account ${user.email}${fields.password ? ' with a password' : emailed ? ' (set-password link emailed)' : ' (set-password email failed)'}`, meta: { reason: why } });
    res.status(201).json({
      id: String(user._id),
      msg: fields.password ? 'Account created. Share the password with them privately.' : emailed ? `Account created. ${user.email} got an email to set their password.` : 'Account created, but the email could not be sent. Use "Set password" on their page.',
    });
  } catch (err) {
    res.status(err.status || 500).json({ msg: err.status ? err.message : 'Could not create the account.' });
  }
});

router.get('/:id', requirePermission('users.view'), validate({ params: idParams }), async (req, res) => {
  const detail = await svc.userDetail(req.v.params.id);
  if (!detail) return res.status(404).json({ msg: 'User not found.' });
  res.json(detail);
});

const act = (permission, schema, handler) => [
  requirePermission(permission),
  validate({ params: idParams, body: schema }),
  async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      res.status(err.status || 500).json({ msg: err.status ? err.message : 'Something went wrong.' });
    }
  },
];

router.post('/:id/block', ...act('users.block', z.object({ reason }), async (req, res) => {
  const user = await svc.setBlocked(req.v.params.id, true, req.v.body.reason);
  await audit(req, 'user.block', { targetType: 'user', targetId: user._id, summary: `Blocked ${user.email}`, meta: { reason: req.v.body.reason } });
  res.json({ msg: 'User blocked. They are signed out and cannot sign in or create cards.' });
}));

router.post('/:id/unblock', ...act('users.block', z.object({ reason }), async (req, res) => {
  const user = await svc.setBlocked(req.v.params.id, false);
  await audit(req, 'user.unblock', { targetType: 'user', targetId: user._id, summary: `Unblocked ${user.email}`, meta: { reason: req.v.body.reason } });
  res.json({ msg: 'User unblocked.' });
}));

router.post('/:id/remove', ...act('users.delete', z.object({ reason }), async (req, res) => {
  const user = await svc.setRemoved(req.v.params.id, true);
  await audit(req, 'user.remove', { targetType: 'user', targetId: user._id, summary: `Removed (soft delete) ${user.email}`, meta: { reason: req.v.body.reason } });
  res.json({ msg: 'User removed. Their account and public card are hidden; you can restore them.' });
}));

router.post('/:id/restore', ...act('users.delete', z.object({ reason }), async (req, res) => {
  const user = await svc.setRemoved(req.v.params.id, false);
  await audit(req, 'user.restore', { targetType: 'user', targetId: user._id, summary: `Restored ${user.email}`, meta: { reason: req.v.body.reason } });
  res.json({ msg: 'User restored.' });
}));

// Permanent delete (super admin): the body must repeat the user's email as confirmation.
router.delete('/:id', ...act('users.purge', z.object({ confirmEmail: z.string().trim().toLowerCase().max(200), reason }), async (req, res) => {
  const User = require('../../models/User');
  const user = await User.findById(req.v.params.id).select('email').lean();
  if (!user) return res.status(404).json({ msg: 'User not found.' });
  if (String(user.email).toLowerCase() !== req.v.body.confirmEmail) return res.status(400).json({ msg: "The email you typed doesn't match this user." });
  const result = await svc.purgeUser(req.v.params.id);
  await audit(req, 'user.purge', { targetType: 'user', targetId: req.v.params.id, summary: `Permanently deleted ${result.email}`, meta: { removed: result.removed, reason: req.v.body.reason } });
  res.json({ msg: 'User permanently deleted. Payment records were kept.', removed: result.removed });
}));

const activePlan = async (planId) => {
  const plan = await Plan.findById(planId);
  if (!plan) throw Object.assign(new Error('Plan not found.'), { status: 404 });
  if (!plan.isActive) throw Object.assign(new Error('This plan is disabled.'), { status: 400 });
  return plan;
};

router.post('/:id/plan/grant', ...act('users.plan', z.object({ planId: objectId, days: days.optional(), reason: z.string().trim().min(3, 'please give a reason').max(500), type: z.enum(['free', 'complimentary']).default('free') }), async (req, res) => {
  const { planId, days: d, reason: why, type } = req.v.body;
  const plan = await activePlan(planId);
  const user = await svc.grantPlan(req.v.params.id, plan, { days: d || plan.durationDays, reason: why, source: type === 'complimentary' ? 'complimentary' : 'admin_grant', adminId: req.admin.id });
  await audit(req, 'plan.grant', { targetType: 'user', targetId: user._id, summary: `Granted ${plan.name} (${d || plan.durationDays} days, ${type}) to ${user.email}`, meta: { planId, reason: why, until: user.planExpiry } });
  res.json({ msg: `${plan.name} granted until ${user.planExpiry.toDateString()}.` });
}));

router.post('/:id/plan/extend', ...act('users.plan', z.object({ days, reason: z.string().trim().min(3, 'please give a reason').max(500) }), async (req, res) => {
  const user = await svc.extendPlan(req.v.params.id, req.v.body.days);
  await audit(req, 'plan.extend', { targetType: 'user', targetId: user._id, summary: `Extended ${user.plan} by ${req.v.body.days} days for ${user.email}`, meta: { reason: req.v.body.reason, until: user.planExpiry } });
  res.json({ msg: `Plan extended until ${user.planExpiry.toDateString()}.` });
}));

router.post('/:id/plan/change', ...act('users.plan', z.object({ planId: objectId, days: days.optional(), reason: z.string().trim().min(3, 'please give a reason').max(500) }), async (req, res) => {
  const plan = await activePlan(req.v.body.planId);
  const user = await svc.changePlan(req.v.params.id, plan, { days: req.v.body.days, reason: req.v.body.reason, adminId: req.admin.id });
  await audit(req, 'plan.change', { targetType: 'user', targetId: user._id, summary: `Changed ${user.email} to ${plan.name}`, meta: { planId: req.v.body.planId, reason: req.v.body.reason, until: user.planExpiry } });
  res.json({ msg: `Plan changed to ${plan.name} (until ${user.planExpiry.toDateString()}).` });
}));

router.post('/:id/plan/revoke', ...act('users.plan', z.object({ reason: z.string().trim().min(3, 'please give a reason').max(500) }), async (req, res) => {
  const user = await svc.revokePlan(req.v.params.id);
  await audit(req, 'plan.revoke', { targetType: 'user', targetId: user._id, summary: `Revoked plan of ${user.email}`, meta: { reason: req.v.body.reason } });
  res.json({ msg: 'Plan revoked. The user is on the free tier now.' });
}));

router.post('/:id/credits', ...act('users.credits', z.object({ credits: z.coerce.number().int().min(-100).max(100).default(0), cardLimit: z.coerce.number().int().min(0).max(1000).optional(), reason: z.string().trim().min(3, 'please give a reason').max(500) }), async (req, res) => {
  const { credits, cardLimit, reason: why } = req.v.body;
  if (!credits && cardLimit === undefined) return res.status(400).json({ msg: 'Nothing to change.' });
  const user = await svc.addCredits(req.v.params.id, { credits, cardLimit });
  await audit(req, 'user.credits', { targetType: 'user', targetId: user._id, summary: `Credits ${credits >= 0 ? '+' : ''}${credits} (now ${user.freeCardCredits})${cardLimit !== undefined ? `, card limit ${cardLimit}` : ''} for ${user.email}`, meta: { credits, cardLimit, reason: why } });
  res.json({ msg: 'Saved.', freeCardCredits: user.freeCardCredits, cardLimit: user.cardLimit });
}));

const why = z.string().trim().min(3, 'please give a reason').max(500);

router.post('/:id/profile', ...act('users.edit', z.object({
  name: z.string().trim().min(2, 'name is too short').max(80).optional(),
  email: z.string().trim().toLowerCase().email('not a valid email').max(200).optional(),
  phone: z.string().trim().max(30).optional(),
  emailVerified: z.boolean().optional(),
  reason: why,
}), async (req, res) => {
  const { reason: r, ...fields } = req.v.body;
  const { user, changes } = await svc.updateProfile(req.v.params.id, fields);
  const list = Object.entries(changes).map(([k, v]) => `${k}: ${v.from || '—'} → ${v.to || '—'}`).join(', ');
  await audit(req, 'user.edit', { targetType: 'user', targetId: user._id, summary: `Edited ${user.email} (${list})`, meta: { changes, reason: r } });
  res.json({ msg: 'Profile saved.' });
}));

router.post('/:id/password', ...act('users.password', z.object({
  password: z.string().min(8, 'use at least 8 characters').max(128),
  signOut: z.boolean().default(true),
  reason: why,
}), async (req, res) => {
  const user = await svc.setPassword(req.v.params.id, req.v.body.password, { signOut: req.v.body.signOut });
  // Never the password itself in the log.
  await audit(req, 'user.password', { targetType: 'user', targetId: user._id, summary: `Set a new password for ${user.email}${req.v.body.signOut ? ' and signed them out everywhere' : ''}`, meta: { reason: req.v.body.reason } });
  res.json({ msg: `Password changed. Share it with the user privately${req.v.body.signOut ? '; their other sessions are signed out' : ''}.` });
}));

router.post('/:id/signout', ...act('users.password', z.object({ reason }), async (req, res) => {
  const user = await svc.signOutEverywhere(req.v.params.id);
  await audit(req, 'user.signout', { targetType: 'user', targetId: user._id, summary: `Signed ${user.email} out everywhere`, meta: { reason: req.v.body.reason } });
  res.json({ msg: 'Signed out on every device.' });
}));

// Emails the user a password-reset link, or a verification link (kind: 'verify').
router.post('/:id/email-link', ...act('users.reset_link', z.object({ kind: z.enum(['reset', 'verify']), reason }), async (req, res) => {
  const User = require('../../models/User');
  const { sendResetLink, sendVerification } = require('../../services/accountEmails');
  const user = await User.findById(req.v.params.id);
  if (!user) return res.status(404).json({ msg: 'User not found.' });
  const { kind } = req.v.body;
  if (kind === 'verify' && user.emailVerified !== false) return res.status(400).json({ msg: 'This email is already verified.' });
  const sent = await (kind === 'verify' ? sendVerification(user) : sendResetLink(user));
  await audit(req, `user.${kind}_link`, { targetType: 'user', targetId: user._id, summary: `${kind === 'verify' ? 'Verification' : 'Password reset'} link ${sent ? 'emailed' : 'NOT sent (email failed)'} to ${user.email}`, meta: { reason: req.v.body.reason, sent } });
  if (!sent) return res.status(502).json({ msg: 'The email could not be sent. Check the SMTP settings.' });
  res.json({ msg: `${kind === 'verify' ? 'Verification' : 'Reset'} link emailed to ${user.email}.` });
}));

// "Sign in as this user": a one-time link (60 s) that opens the user's dashboard on the site.
router.post('/:id/impersonate', ...act('users.impersonate', z.object({ reason: why }), async (req, res) => {
  const { user, code } = await svc.createHandoff(req.v.params.id, req.admin.id);
  await audit(req, 'user.impersonate', { targetType: 'user', targetId: user._id, summary: `Signed in as ${user.email}`, meta: { reason: req.v.body.reason } });
  const site = (process.env.SITE_URL || 'https://aicardly.com').replace(/\/$/, '');
  res.json({ msg: 'Opening their dashboard…', url: `${site}/impersonate#code=${code}` });
}));

module.exports = router;
