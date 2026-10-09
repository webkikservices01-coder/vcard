// /api/wedding — Digital Invites (dashboard "Digital Invite" tab: weddings, engagements, birthdays,
// Diwali, housewarmings, baby showers, festival wishes …) and their public page /invite/<link>:
// the hosts' details, photos, RSVPs and the guest wishes wall. The design decides the occasion
// (constants/weddingTemplates.js → constants/occasions.js).
const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const auth = require('../middleware/auth');
const WeddingInvite = require('../models/WeddingInvite');
const WeddingRsvp = require('../models/WeddingRsvp');
const User = require('../models/User');
const { WEDDING_TEMPLATES, WEDDING_OPENINGS, WEDDING_COUPLE_ART, MAX_INVITES_PER_USER, occasionOf } = require('../constants/weddingTemplates');
const { OCCASIONS } = require('../constants/occasions');
const occ = (inv) => OCCASIONS[occasionOf(inv?.template)] || OCCASIONS.wedding;
const { upload, fileUrl } = require('../utils/upload');
// Signature for direct uploads (cloudinary config is set up by utils/upload when keys exist).
const { sendMail, emailHtml } = require('../utils/mailer');
const background = require('../utils/background');
const { logEvent } = require('../utils/logger');
const { accountStatus } = require('../utils/accountStatus');
const { cleanMessages, checkInput, checkOutput } = require('../utils/aiGuard');
const { weddingSystemPrompt, splitActions } = require('../services/weddingChat');
const { logUsage } = require('../utils/usageLogger');

const router = express.Router();
const SITE = (process.env.SITE_URL || 'https://aicardly.com').replace(/\/$/, '');

const LINK_RE = /^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])$/;
const linkProblem = (l) => (!LINK_RE.test(l || '') ? 'Use 3–50 lowercase letters, numbers and hyphens (not at the start or end).' : '');
// https links, or /uploads/… files (local development without Cloudinary).
const httpUrl = z.string().trim().max(1000).refine((v) => !v || /^https:\/\//i.test(v) || /^\/uploads\/[\w.-]+$/.test(v), 'must be an https link');
const text = (n) => z.string().trim().max(n);

const inviteBody = z.object({
  template: z.enum(WEDDING_TEMPLATES),
  link: z.string().trim().toLowerCase().max(50),
  coupleOne: text(40).min(1, 'enter the first name'),
  coupleTwo: text(40).optional().default(''),
  amp: text(10).optional().default('&'),
  script: text(60).optional().default(''),
  tagline: text(160).optional().default(''),
  date: text(60).optional().default(''),
  eventDate: z.union([z.coerce.date(), z.literal(''), z.null()]).optional().transform((v) => (v instanceof Date && !isNaN(v) ? v : null)),
  venueName: text(120).optional().default(''),
  venueAddress: text(300).optional().default(''),
  mapUrl: httpUrl.optional().default(''),
  story: text(2000).optional().default(''),
  hashtag: text(60).optional().default(''),
  ceremonies: z.array(z.object({ icon: text(8).optional().default(''), hi: text(40).optional().default(''), name: text(60), date: text(60).optional().default(''), time: text(40).optional().default(''), venue: text(160).optional().default('') })).max(12).optional(),
  timeline: z.array(z.object({ y: text(20).optional().default(''), h: text(60), t: text(200).optional().default('') })).max(6).optional(),
  image: httpUrl.optional().default(''),
  photos: z.array(httpUrl).max(12).optional().default([]),
  music: httpUrl.optional().default(''),
  video: httpUrl.optional().default(''),
  hostPhone: text(30).optional().default(''),
  published: z.boolean().optional().default(true),
  rsvpOpen: z.boolean().optional().default(true),
  showWishes: z.boolean().optional().default(true),
  aiChat: z.boolean().optional().default(true),
  opening: z.enum(WEDDING_OPENINGS).optional().default(''),
  coupleArt: z.enum(WEDDING_COUPLE_ART).optional().default(''),
});

const parse = (schema, body) => {
  const r = schema.safeParse(body || {});
  if (r.success) {
    // Couples (wedding, engagement, anniversary, baby shower) need both names.
    if (r.data.template && occ(r.data).couple && 'coupleTwo' in r.data && !r.data.coupleTwo && schema === inviteBody) return { error: 'coupleTwo: enter the second name' };
    return { data: r.data };
  }
  const i = r.error.issues[0];
  return { error: `${i.path.join('.') || 'input'}: ${i.message}` };
};

const mine = (req) => ({ _id: req.params.id, userId: req.user.userId });
const validId = (id) => /^[a-f0-9]{24}$/i.test(String(id || ''));

// ── Owner (dashboard) ───────────────────────────────────────────────────────
router.get('/mine', auth, async (req, res) => {
  const invites = await WeddingInvite.find({ userId: req.user.userId }).sort({ updatedAt: -1 }).lean();
  const counts = await WeddingRsvp.aggregate([
    { $match: { inviteId: { $in: invites.map((i) => i._id) } } },
    { $group: { _id: '$inviteId', replies: { $sum: 1 }, yes: { $sum: { $cond: [{ $eq: ['$attending', 'yes'] }, 1, 0] } }, guests: { $sum: { $cond: [{ $eq: ['$attending', 'yes'] }, '$guests', 0] } } } },
  ]);
  const by = Object.fromEntries(counts.map((c) => [String(c._id), c]));
  res.json(invites.map((i) => ({ ...i, stats: { replies: by[i._id]?.replies || 0, yes: by[i._id]?.yes || 0, guests: by[i._id]?.guests || 0 } })));
});

router.get('/check-link/:link', auth, async (req, res) => {
  const link = String(req.params.link || '').toLowerCase();
  const problem = linkProblem(link);
  if (problem) return res.json({ available: false, msg: problem });
  const taken = await WeddingInvite.findOne({ link }).select('userId _id').lean();
  if (!taken) return res.json({ available: true });
  const own = String(taken.userId) === String(req.user.userId);
  res.json(own && req.query.id === String(taken._id) ? { available: true } : { available: false, msg: 'This link is already taken.' });
});

router.post('/', auth, async (req, res) => {
  try {
    const { data, error } = parse(inviteBody, req.body);
    if (error) return res.status(400).json({ msg: error });
    const problem = linkProblem(data.link);
    if (problem) return res.status(400).json({ msg: problem });
    if ((await WeddingInvite.countDocuments({ userId: req.user.userId })) >= MAX_INVITES_PER_USER) {
      return res.status(400).json({ msg: `You can have up to ${MAX_INVITES_PER_USER} invites.` });
    }
    if (await WeddingInvite.exists({ link: data.link })) return res.status(400).json({ msg: 'This link is already taken.' });
    const invite = await WeddingInvite.create({ ...data, userId: req.user.userId });
    logEvent(req, 'wedding.create', `${occ(invite).label} invite /invite/${invite.link} created`, { userId: req.user.userId });
    res.status(201).json(invite);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ msg: 'This link is already taken.' });
    console.error('Wedding create error:', err.message);
    res.status(500).json({ msg: 'Could not save the invite. Please try again.' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(404).json({ msg: 'Invite not found' });
    const { data, error } = parse(inviteBody, req.body);
    if (error) return res.status(400).json({ msg: error });
    const problem = linkProblem(data.link);
    if (problem) return res.status(400).json({ msg: problem });
    if (await WeddingInvite.exists({ link: data.link, _id: { $ne: req.params.id } })) return res.status(400).json({ msg: 'This link is already taken.' });
    const invite = await WeddingInvite.findOneAndUpdate(mine(req), { $set: data }, { new: true });
    if (!invite) return res.status(404).json({ msg: 'Invite not found' });
    res.json(invite);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ msg: 'This link is already taken.' });
    console.error('Wedding update error:', err.message);
    res.status(500).json({ msg: 'Could not save the invite. Please try again.' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ msg: 'Invite not found' });
  const invite = await WeddingInvite.findOneAndDelete(mine(req));
  if (!invite) return res.status(404).json({ msg: 'Invite not found' });
  await WeddingRsvp.deleteMany({ inviteId: invite._id });
  res.json({ msg: 'Deleted' });
});

// Photos / music / video for an invite. Vercel caps request bodies at ~4.5 MB, so with Cloudinary
// the browser uploads straight to it with a one-time signature (images, mp3, mp4 — "auto");
// locally (no Cloudinary) files come to this server instead.
router.get('/upload-signature', auth, (req, res) => {
  const { useCloudinary } = require('../utils/upload');
  if (!useCloudinary) return res.json({ mode: 'server' });
  const cloudinary = require('cloudinary').v2;
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `${process.env.CLOUDINARY_FOLDER || 'webcard'}/wedding`;
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, api_secret);
  res.json({ mode: 'cloudinary', uploadUrl: `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, apiKey: api_key, timestamp, folder, signature });
});

// Field 'media' (the shared uploader keeps the 'file' field for portfolio PDFs only).
router.post('/upload', auth, upload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
  res.json({ url: fileUrl(req.file) });
});

router.get('/:id/rsvps', auth, async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ msg: 'Invite not found' });
  const invite = await WeddingInvite.findOne(mine(req)).select('_id').lean();
  if (!invite) return res.status(404).json({ msg: 'Invite not found' });
  res.json(await WeddingRsvp.find({ inviteId: invite._id }).sort({ createdAt: -1 }).limit(2000).lean());
});

router.patch('/:id/rsvps/:rid', auth, async (req, res) => {
  if (!validId(req.params.id) || !validId(req.params.rid)) return res.status(404).json({ msg: 'Not found' });
  const invite = await WeddingInvite.findOne(mine(req)).select('_id').lean();
  if (!invite) return res.status(404).json({ msg: 'Invite not found' });
  const r = await WeddingRsvp.findOneAndUpdate({ _id: req.params.rid, inviteId: invite._id }, { $set: { hidden: !!req.body?.hidden } }, { new: true });
  if (!r) return res.status(404).json({ msg: 'Not found' });
  res.json(r);
});

router.delete('/:id/rsvps/:rid', auth, async (req, res) => {
  if (!validId(req.params.id) || !validId(req.params.rid)) return res.status(404).json({ msg: 'Not found' });
  const invite = await WeddingInvite.findOne(mine(req)).select('_id').lean();
  if (!invite) return res.status(404).json({ msg: 'Invite not found' });
  await WeddingRsvp.deleteOne({ _id: req.params.rid, inviteId: invite._id });
  res.json({ msg: 'Deleted' });
});

// ── Public (/invite/<link>) ─────────────────────────────────────────────────
const PUBLIC_FIELDS = 'link template coupleOne coupleTwo amp script tagline date eventDate venueName venueAddress mapUrl story hashtag ceremonies timeline image photos music video hostPhone rsvpOpen showWishes aiChat opening coupleArt userId published updatedAt';

async function publicInvite(link) {
  const invite = await WeddingInvite.findOne({ link: String(link || '').toLowerCase() }).select(PUBLIC_FIELDS).lean();
  if (!invite || !invite.published) return null;
  const status = await accountStatus(invite.userId);
  if (status === 'removed' || status === 'blocked') return null;
  return invite;
}

router.get('/public/:link', async (req, res) => {
  try {
    const invite = await publicInvite(req.params.link);
    if (!invite) return res.status(404).json({ msg: 'Invitation not found' });
    const wishes = invite.showWishes
      ? await WeddingRsvp.find({ inviteId: invite._id, hidden: false, message: { $ne: '' } }).select('name message createdAt').sort({ createdAt: -1 }).limit(12).lean()
      : [];
    const { userId, published, ...rest } = invite;
    res.set('Cache-Control', 'no-store');
    res.json({ ...rest, wishes: wishes.map((w) => ({ n: w.name, w: w.message })) });
  } catch (err) {
    console.error('Wedding public error:', err.message);
    res.status(500).json({ msg: 'Could not load the invitation.' });
  }
});

router.post('/public/:link/view', async (req, res) => {
  await WeddingInvite.updateOne({ link: String(req.params.link || '').toLowerCase(), published: true }, { $inc: { views: 1 } }).catch(() => {});
  res.json({ ok: true });
});

const rsvpLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false, message: { msg: 'Too many replies from this device. Please try again later.' } });
const rsvpBody = z.object({
  name: text(80).min(2, 'please enter your name'),
  phone: text(30).optional().default(''),
  email: z.string().trim().max(150).optional().default('').refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'not a valid email'),
  guests: z.coerce.number().int().min(1).max(20).optional().default(1),
  attending: z.enum(['yes', 'no', 'maybe']).optional().default('yes'),
  message: text(500).optional().default(''),
});

router.post('/public/:link/rsvp', rsvpLimiter, async (req, res) => {
  try {
    const invite = await publicInvite(req.params.link);
    if (!invite) return res.status(404).json({ msg: 'Invitation not found' });
    if (!invite.rsvpOpen || !occ(invite).rsvp) return res.status(400).json({ msg: 'RSVPs are closed for this invitation.' });
    const { data, error } = parse(rsvpBody, req.body);
    if (error) return res.status(400).json({ msg: error.replace(/^[^:]+: /, '') });
    await WeddingRsvp.create({ ...data, inviteId: invite._id });
    const o = occ(invite);
    res.json({ msg: `Thank you! Your reply has reached ${o.hosts}.` });

    // Let the hosts know (their account email), after the reply.
    background((async () => {
      const owner = await User.findById(invite.userId).select('email').lean();
      if (!owner?.email) return;
      const esc = (v) => String(v || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      const label = { yes: 'Will attend', no: "Can't attend", maybe: 'Maybe' }[data.attending];
      await sendMail({
        to: owner.email,
        replyTo: data.email || undefined,
        subject: `New RSVP from ${data.name}: ${label}`,
        text: `${data.name} replied to your ${o.invite} (${SITE}/invite/${invite.link}).\n\n${label} · Guests: ${data.guests}\nPhone: ${data.phone || '—'}\nEmail: ${data.email || '—'}\n${data.message ? `\nMessage: ${data.message}\n` : ''}\nAll replies: ${SITE}/dashboard/invites`,
        html: emailHtml({
          heading: `${esc(data.name)}: ${label}`,
          paragraphs: [
            `New reply on your ${o.invite} <a href="${SITE}/invite/${esc(invite.link)}" style="color:#E70C65">aicardly.com/invite/${esc(invite.link)}</a>.`,
            `<b>Guests:</b> ${data.guests}<br><b>Phone:</b> ${esc(data.phone) || '—'}<br><b>Email:</b> ${esc(data.email) || '—'}`,
            data.message ? `<b>Message:</b><br>${esc(data.message).replace(/\n/g, '<br>')}` : '',
          ].filter(Boolean),
          button: { label: 'See all replies', url: `${SITE}/dashboard/invites` },
        }),
      });
    })());
  } catch (err) {
    console.error('Wedding RSVP error:', err.message);
    res.status(500).json({ msg: 'Could not send your reply. Please try again.' });
  }
});

// ── AI assistant for guests ─────────────────────────────────────────────────
// POST /api/wedding/chat { link | draft, messages, consent } → { reply, actions }
// link: a published invite. draft: the details shown in a design preview / the dashboard editor
// (nothing saved). Answers only from the invite's own details (services/weddingChat.js).
const chatLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false, message: { msg: 'Too many messages. Please wait a few minutes and try again.' } });
const draftBody = inviteBody.partial().extend({ template: z.enum(WEDDING_TEMPLATES) });
const CHAT_MODEL = process.env.WEDDING_CHAT_MODEL || 'claude-haiku-4-5-20251001';
const guardReplies = (o) => ({
  injection: `I can only help with questions about this ${o.event}. Would you like the date, the venue or how to RSVP?`,
  abuse: `Sorry, I can't help with that. I'm here for questions about this ${o.event}.`,
});

router.post('/chat', chatLimiter, async (req, res) => {
  try {
    const messages = cleanMessages(req.body?.messages);
    if (!messages.length) return res.status(400).json({ msg: 'Please type a question.' });
    // DPDP: the guest accepts the chat notice before their messages go to the AI service.
    if (req.body.consent !== true) return res.status(428).json({ msg: 'Please accept the chat notice to continue.', needConsent: true });
    let inv;
    if (req.body.link) {
      inv = await publicInvite(req.body.link);
      if (!inv) return res.status(404).json({ msg: 'Invitation not found' });
      if (inv.aiChat === false) return res.status(403).json({ msg: 'The hosts have switched the assistant off.' });
    } else {
      const { data, error } = parse(draftBody, req.body.draft);
      if (error) return res.status(400).json({ msg: error });
      inv = data;
    }
    const stop = checkInput(messages[messages.length - 1].content, { niche: 'general' });
    const G = guardReplies(occ(inv));
    if (stop) return res.json({ reply: G[stop.reason] || stop.reply, actions: [], guarded: stop.reason });
    if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ msg: 'The assistant is not available right now.' });
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const completion = await anthropic.messages.create({ model: CHAT_MODEL, max_tokens: 400, system: weddingSystemPrompt(inv), messages });
    logUsage({ route: 'wedding-chat', userId: inv.userId || undefined, model: CHAT_MODEL, usage: completion.usage });
    let reply = completion.content.filter((b) => b.type === 'text').map((b) => b.text).join(' ').trim();
    if (checkOutput(reply, {}) || /=== (WEDDING|EVENT|HOW TO|SAFETY)/.test(reply)) reply = G.injection;
    const { text, actions } = splitActions(reply, inv);
    res.json({ reply: text || `Happy to help! What would you like to know about the ${occ(inv).event}?`, actions });
  } catch (err) {
    logEvent(req, 'wedding.chat.error', err.message, { level: 'error' });
    res.status(500).json({ msg: 'The assistant could not answer. Please try again.' });
  }
});

module.exports = router;
module.exports.publicInvite = publicInvite;
