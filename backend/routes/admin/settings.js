// /api/admin/settings: site settings (metal card price, announcement strip, support contact),
// security (2FA for every admin, idle sign-out, sign-in picture check), the website chatbot
// (Cardy) and the wording of the automatic emails.
const express = require('express');
const EmailTemplate = require('../../models/EmailTemplate');
const Admin = require('../../models/Admin');
const { requirePermission } = require('../../middleware/admin/auth');
const { validate, z } = require('../../middleware/admin/validate');
const { audit } = require('../../services/admin/audit');
const { getSettings, saveSettings } = require('../../services/siteSettings');
const { CATALOG, fill, forget } = require('../../services/emailTemplates');
const { sendMail, emailHtml, isMailConfigured } = require('../../utils/mailer');

const router = express.Router();
const text = (n) => z.string().trim().max(n).optional().default('');

const SCHEMAS = {
  site: z.object({
    metalCardPrice: z.coerce.number().min(0).max(1000000),
    metalCardDelivery: text(60),
    announcement: z.object({ active: z.boolean(), text: text(160), link: z.union([z.literal(''), z.string().trim().max(300).regex(/^(https:\/\/|\/)/, 'must start with https:// or /')]).optional().default('') }),
    supportEmail: z.union([z.literal(''), z.string().trim().email().max(200)]),
    supportPhone: text(30),
    meetingCopyEmail: z.union([z.literal(''), z.string().trim().email().max(200)]).optional().default(''),
  }),
  security: z.object({
    require2fa: z.boolean(),
    idleMinutes: z.coerce.number().int().min(5).max(240),
    captchaAfter: z.coerce.number().int().min(0).max(20),
  }),
  cardy: z.object({
    enabled: z.boolean(),
    welcome: text(300),
    extraKnowledge: text(4000),
    bookingUrl: z.union([z.literal(''), z.literal('off'), z.string().trim().url().max(500).regex(/^https:\/\//, 'must be an https link')]).optional().default(''),
  }),
};
const PERM = { site: 'settings.manage', security: 'settings.manage', cardy: 'ai.settings' };

router.get('/', async (req, res) => {
  const { can } = require('../../constants/adminPermissions');
  const out = {};
  for (const key of Object.keys(SCHEMAS)) if (can(req.admin, PERM[key])) out[key] = await getSettings(key);
  if (!Object.keys(out).length) return res.status(403).json({ msg: "Your role can't do this.", code: 'ADMIN_FORBIDDEN' });
  res.json(out);
});

for (const key of Object.keys(SCHEMAS)) {
  router.put(`/${key}`, requirePermission(PERM[key]), validate({ body: SCHEMAS[key] }), async (req, res) => {
    const b = req.v.body;
    // Requiring 2FA for everyone needs the person switching it on to have 2FA first.
    if (key === 'security' && b.require2fa && !req.admin.totpEnabled) return res.status(400).json({ msg: 'Switch on 2FA for your own account first (My account), then require it for everyone.' });
    const before = await getSettings(key);
    const saved = await saveSettings(key, b, req.admin.email);
    const changed = Object.keys(saved).filter((k) => JSON.stringify(saved[k]) !== JSON.stringify(before[k]));
    let note = '';
    if (key === 'security' && b.require2fa && !before.require2fa) note = ` (${await Admin.countDocuments({ isActive: true, totpEnabled: { $ne: true } })} admins must now set up 2FA)`;
    await audit(req, `settings.${key}`, { targetType: 'settings', targetId: key, summary: `Changed ${key} settings: ${changed.join(', ') || 'nothing'}${note}`, meta: { changed } });
    res.json({ [key]: saved });
  });
}

// ── Email templates ──────────────────────────────────────────────────────────
router.get('/emails', requirePermission('emails.manage'), async (req, res) => {
  const rows = Object.fromEntries((await EmailTemplate.find().lean()).map((r) => [r.key, r]));
  res.json({
    templates: Object.entries(CATALOG).map(([key, c]) => ({
      key,
      label: c.label,
      when: c.when,
      vars: c.vars,
      defaults: { subject: c.subject, heading: c.heading, intro: c.intro },
      custom: rows[key] ? { subject: rows[key].subject, heading: rows[key].heading, intro: rows[key].intro, enabled: rows[key].enabled !== false, updatedAt: rows[key].updatedAt, updatedBy: rows[key].updatedBy } : null,
    })),
    mailReady: isMailConfigured(),
  });
});

const tplBody = z.object({ subject: text(200), heading: text(200), intro: text(1500), enabled: z.boolean().optional().default(true) });
router.put('/emails/:key', requirePermission('emails.manage'), validate({ params: z.object({ key: z.enum(Object.keys(CATALOG)) }), body: tplBody }), async (req, res) => {
  const { key } = req.v.params;
  const b = req.v.body;
  await EmailTemplate.findOneAndUpdate({ key }, { $set: { ...b, updatedBy: req.admin.email } }, { upsert: true });
  forget();
  await audit(req, 'emails.template', { targetType: 'email', targetId: key, summary: `Edited the "${CATALOG[key].label}" email${b.enabled ? '' : ' (switched off)'}` });
  res.json({ ok: true });
});

router.delete('/emails/:key', requirePermission('emails.manage'), validate({ params: z.object({ key: z.enum(Object.keys(CATALOG)) }) }), async (req, res) => {
  await EmailTemplate.deleteOne({ key: req.v.params.key });
  forget();
  await audit(req, 'emails.template.reset', { targetType: 'email', targetId: req.v.params.key, summary: `Put the "${CATALOG[req.v.params.key].label}" email back to the built-in text` });
  res.json({ ok: true });
});

// Test email to the signed-in admin, with sample values in the placeholders.
const SAMPLE = { name: 'Priya', email: 'priya@example.com', hours: 24, visitor: 'Rahul Mehta', owner: 'Priya Sharma', guest: 'Ananya', answer: 'Will attend', number: 'NFC-2026-0001', courier: 'Blue Dart', tracking: 'BD123456789IN' };
router.post('/emails/:key/test', requirePermission('emails.manage'), validate({ params: z.object({ key: z.enum(Object.keys(CATALOG)) }), body: tplBody }), async (req, res) => {
  const c = CATALOG[req.v.params.key];
  const b = req.v.body;
  const pick = (f) => fill(b[f] || c[f] || '', SAMPLE);
  const ok = await sendMail({
    to: req.admin.email,
    subject: `[Test] ${pick('subject')}`,
    text: `${pick('heading')}\n\n${pick('intro').replace(/<[^>]+>/g, '')}\n\n(The real email also has its links, buttons and details.)`,
    html: emailHtml({ heading: pick('heading') || c.label, paragraphs: [pick('intro'), '<i>The real email also has its links, buttons and details.</i>'].filter(Boolean), footer: 'Test email from the Aicardly admin panel.' }),
  });
  res.status(ok ? 200 : 502).json({ msg: ok ? `Test sent to ${req.admin.email}.` : 'Email is not set up on the server (SMTP).' });
});

module.exports = router;
