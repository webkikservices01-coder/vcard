// Admin operations on site users: lists, detail, block, remove, plans, credits.
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../../models/User');
const vCard = require('../../models/vCard');
const CardOrder = require('../../models/CardOrder');
const Transaction = require('../../models/Transaction');
const UserPlan = require('../../models/UserPlan');
const Notification = require('../../models/Notification');
const AdminHandoff = require('../../models/AdminHandoff');
const { toE164 } = require('../../utils/phone');
const { recordPlan, setActiveEnd, revokeActive } = require('../planHistory');
const { forgetAccountStatus } = require('../../utils/accountStatus');
const { escapeRegex } = require('../../middleware/admin/validate');

const DAY = 24 * 60 * 60 * 1000;
const FREE = 'Free Trial';

const statusOf = (u) => (u.deletedAt ? 'removed' : u.isBlocked ? 'blocked' : 'active');
const { isLifetime } = require('../../constants/plans');
const planActive = (u) => isLifetime(u) || !!(u.plan && u.plan !== FREE && u.planExpiry && new Date(u.planExpiry) > new Date());

// Safe view of a user: never the password or reset/verification token hashes.
const USER_FIELDS = 'name firstName lastName email phone plan planExpiry lifetime status cardLimit emailVerified isBlocked blockedAt blockedReason deletedAt freeCardCredits consentAt createdAt updatedAt upgrade.sentAt upgrade.email upgrade.sms upgrade.error upgrade.trialEndsAt';

function userFilter({ q, status, plan, from, to }) {
  const f = {};
  if (status === 'removed') f.deletedAt = { $ne: null };
  else if (status !== 'all') f.deletedAt = null;
  if (status === 'blocked') f.isBlocked = true;
  if (status === 'active') f.isBlocked = { $ne: true };
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    f.$or = [{ name: re }, { email: re }, { phone: re }];
  }
  if (plan === 'paid') Object.assign(f, { plan: { $ne: FREE }, planExpiry: { $gt: new Date() } });
  else if (plan === 'free') f.$and = [{ $or: [{ plan: FREE }, { planExpiry: { $lte: new Date() } }, { planExpiry: null }] }];
  else if (plan) f.plan = plan;
  if (from || to) f.createdAt = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  return f;
}

// Cards, money paid and plan start for a set of users, in three grouped queries.
async function statsFor(ids) {
  const [cards, orders, txns, plans] = await Promise.all([
    vCard.aggregate([{ $match: { userId: { $in: ids } } }, { $group: { _id: '$userId', n: { $sum: 1 } } }]),
    CardOrder.aggregate([{ $match: { user: { $in: ids }, status: 'PAID' } }, { $group: { _id: '$user', paise: { $sum: '$amount' } } }]),
    Transaction.aggregate([{ $match: { userId: { $in: ids }, status: 'completed' } }, { $group: { _id: '$userId', rupees: { $sum: '$amount' } } }]),
    UserPlan.aggregate([{ $match: { user: { $in: ids }, status: 'active' } }, { $sort: { startAt: -1 } }, { $group: { _id: '$user', startAt: { $first: '$startAt' }, planName: { $first: '$planName' } } }]),
  ]);
  const map = (rows, fn) => Object.fromEntries(rows.map((r) => [String(r._id), fn(r)]));
  return {
    cards: map(cards, (r) => r.n),
    orders: map(orders, (r) => r.paise / 100),
    txns: map(txns, (r) => r.rupees),
    plans: map(plans, (r) => r),
  };
}

const SORTS = { createdAt: 'createdAt', name: 'name', email: 'email', planExpiry: 'planExpiry' };

async function listUsers({ page, limit, q, status, plan, from, to, sort, order }, { all = false } = {}) {
  const filter = userFilter({ q, status, plan, from, to });
  const sortBy = { [SORTS[sort] || 'createdAt']: order === 'asc' ? 1 : -1, _id: -1 };
  const query = User.find(filter).select(USER_FIELDS).sort(sortBy).lean();
  if (!all) query.skip((page - 1) * limit).limit(limit);
  const [users, total] = await Promise.all([query, all ? null : User.countDocuments(filter)]);
  const s = await statsFor(users.map((u) => u._id));
  const rows = users.map((u) => {
    const id = String(u._id);
    return {
      ...u,
      id,
      status: statusOf(u),
      planActive: planActive(u),
      lifetime: isLifetime(u),
      planName: s.plans[id]?.planName || (planActive(u) ? (u.plan !== FREE ? u.plan : 'AI AGENT PRO') : FREE),
      planStart: s.plans[id]?.startAt || null,
      cardsCount: s.cards[id] || 0,
      totalPaid: (s.orders[id] || 0) + (s.txns[id] || 0),
    };
  });
  return all ? rows : { users: rows, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
}

async function userDetail(id) {
  const user = await User.findById(id).select(USER_FIELDS).lean();
  if (!user) return null;
  const [cards, orders, transactions, plans, notifications] = await Promise.all([
    vCard.find({ userId: id }).select('username theme personalInfo viewCount scanCount createdAt updatedAt').sort({ createdAt: -1 }).lean(),
    CardOrder.find({ user: id }).sort({ createdAt: -1 }).limit(100).lean(),
    Transaction.find({ userId: id }).select('plan amount billingType expireDays cfOrderId status invoiceNumber createdAt').sort({ createdAt: -1 }).limit(100).lean(),
    UserPlan.find({ user: id }).sort({ startAt: -1 }).limit(100).populate('grantedBy', 'name email').lean(),
    Notification.find({ user: id }).sort({ createdAt: -1 }).limit(100).lean(),
  ]);
  const s = await statsFor([new mongoose.Types.ObjectId(String(id))]);
  return {
    user: { ...user, id: String(user._id), status: statusOf(user), planActive: planActive(user), lifetime: isLifetime(user), lifetimeFixed: isLifetime(user) && user.lifetime !== true, totalPaid: (s.orders[String(id)] || 0) + (s.txns[String(id)] || 0) },
    cards,
    orders: orders.map(orderView),
    transactions,
    plans,
    notifications: notifications.map((n) => ({ id: n._id, order: n.order, channel: n.channel, type: n.type, to: n.to, status: n.status, error: n.error, createdAt: n.createdAt })),
  };
}

// Card order as the admin sees it (gateway ids, link and delivery; no secrets exist on it).
const orderView = (o) => ({
  id: String(o._id),
  user: o.user,
  card: o.card,
  status: o.status === 'PENDING_PAYMENT' && new Date(o.expiresAt) <= new Date() ? 'EXPIRED' : o.status,
  amount: o.amount / 100,
  complimentary: !!o.complimentary,
  phone: o.phone,
  email: o.email,
  paymentLinkUrl: o.paymentLinkUrl,
  paymentLinkId: o.paymentLinkId,
  razorpayPaymentId: o.razorpayPaymentId,
  linkSentAt: o.createdAt,
  expiresAt: o.expiresAt,
  paidAt: o.paidAt,
  reminderSentAt: o.reminderSentAt,
  delivery: {
    status: o.delivery?.status,
    attempts: o.delivery?.attempts,
    lastError: o.delivery?.lastError,
    deliveredAt: o.delivery?.deliveredAt,
    imageUrl: o.delivery?.imageUrl,
    pdfUrl: o.delivery?.pdfUrl,
  },
  createdAt: o.createdAt,
});

const notFound = () => Object.assign(new Error('User not found.'), { status: 404 });

async function mustFind(id) {
  const user = await User.findById(id);
  if (!user) throw notFound();
  return user;
}

async function setBlocked(id, blocked, reason = '') {
  const user = await mustFind(id);
  user.isBlocked = blocked;
  user.blockedAt = blocked ? new Date() : null;
  user.blockedReason = blocked ? reason : '';
  await user.save();
  forgetAccountStatus(id);
  return user;
}

async function setRemoved(id, removed) {
  const user = await mustFind(id);
  user.deletedAt = removed ? new Date() : null;
  await user.save();
  forgetAccountStatus(id);
  return user;
}

// Permanent delete: the user and everything they made. Payment records (card orders,
// transactions) are kept for accounting, with the user reference left dangling.
async function purgeUser(id) {
  const user = await mustFind(id);
  const cards = await vCard.find({ userId: id }).select('_id').lean();
  const cardIds = cards.map((c) => c._id);
  const byCard = ['Product', 'Portfolio', 'Testimonial', 'Gallery', 'CustomSection', 'VcardSettings', 'AiPersona', 'Enquiry', 'CardVisit', 'ChatSession'];
  const removed = {};
  for (const name of byCard) {
    let mod;
    try {
      mod = require(`../../models/${name}`);
    } catch {
      continue;
    }
    // Some model files export several models (models/CardVisit.js).
    const models = mod.schema ? [mod] : Object.values(mod).filter((m) => m && m.schema);
    for (const Model of models) {
      if (!cardIds.length || !Model.schema.path('vcardId')) continue;
      const r = await Model.deleteMany({ vcardId: { $in: cardIds } });
      removed[Model.modelName] = r.deletedCount;
    }
  }
  removed.SupportTicket = (await require('../../models/SupportTicket').deleteMany({ userId: id })).deletedCount;
  removed.vCard = (await vCard.deleteMany({ userId: id })).deletedCount;
  removed.UserPlan = (await UserPlan.deleteMany({ user: id })).deletedCount;
  await User.deleteOne({ _id: id });
  forgetAccountStatus(id);
  return { email: user.email, removed };
}

// Grant a plan (free grant or complimentary). Same tier still running: time is added on top.
async function grantPlan(id, plan, { days, reason, source, adminId }) {
  const user = await mustFind(id);
  const now = new Date();
  const sameRunning = user.plan === plan.tier && user.planExpiry && user.planExpiry > now;
  const start = sameRunning ? new Date(user.planExpiry) : now;
  const end = new Date(start.getTime() + days * DAY);
  user.plan = plan.tier;
  user.planExpiry = end;
  user.cardLimit = Math.max(user.cardLimit || 1, plan.cardLimit || 1);
  await user.save();
  await recordPlan({ userId: user._id, planId: plan._id, planName: plan.name, tier: plan.tier, source, startAt: now, endAt: end, adminId, reason });
  return user;
}

async function extendPlan(id, days) {
  const user = await mustFind(id);
  if (!planActive(user)) throw Object.assign(new Error('This user has no running plan to extend. Grant one instead.'), { status: 400 });
  user.planExpiry = new Date(new Date(user.planExpiry).getTime() + days * DAY);
  await user.save();
  await setActiveEnd(user._id, user.planExpiry);
  return user;
}

// Switch to another plan, keeping the current end date (or a new one from `days`).
async function changePlan(id, plan, { days, reason, adminId }) {
  const user = await mustFind(id);
  const now = new Date();
  const end = days ? new Date(now.getTime() + days * DAY) : planActive(user) ? new Date(user.planExpiry) : new Date(now.getTime() + plan.durationDays * DAY);
  user.plan = plan.tier;
  user.planExpiry = end;
  user.cardLimit = Math.max(user.cardLimit || 1, plan.cardLimit || 1);
  await user.save();
  await recordPlan({ userId: user._id, planId: plan._id, planName: plan.name, tier: plan.tier, source: 'admin_grant', startAt: now, endAt: end, adminId, reason: reason ? `Changed plan: ${reason}` : 'Changed plan' });
  return user;
}

async function revokePlan(id) {
  const user = await mustFind(id);
  user.plan = FREE;
  user.planExpiry = null;
  await user.save();
  await revokeActive(user._id);
  return user;
}

async function addCredits(id, { credits = 0, cardLimit }) {
  const update = {};
  if (credits) update.$inc = { freeCardCredits: credits };
  if (cardLimit !== undefined) update.$set = { cardLimit };
  const user = await User.findOneAndUpdate({ _id: id, ...(credits < 0 && { freeCardCredits: { $gte: -credits } }) }, update, { returnDocument: 'after' });
  if (!user) {
    if (await User.exists({ _id: id })) throw Object.assign(new Error("Can't remove more credits than the user has."), { status: 400 });
    throw notFound();
  }
  return user;
}

// A new site account made by an admin (for a customer who asked the team to set it up).
// No password given: the user gets an email to choose their own.
async function createUser({ name, email, phone, password, emailVerified = true }) {
  const clean = name.replace(/\s+/g, ' ').trim();
  const parts = clean.split(' ');
  if (await User.exists({ email: new RegExp(`^${escapeRegex(email)}$`, 'i') })) {
    throw Object.assign(new Error('An account with this email already exists.'), { status: 409 });
  }
  const e164 = phone ? toE164(phone) : '';
  if (phone && !e164) throw Object.assign(new Error('Please enter a valid mobile number, e.g. +91 98123 45678.'), { status: 400 });
  const secret = password || crypto.randomBytes(24).toString('base64url');
  try {
    return await User.create({
      name: clean,
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' '),
      email,
      phone: e164,
      password: await bcrypt.hash(secret, 10),
      emailVerified,
    });
  } catch (err) {
    if (err.code === 11000) throw Object.assign(new Error('An account with this email already exists.'), { status: 409 });
    throw err;
  }
}

// Name, email, phone and email-verified flag. Returns { user, changes } (old → new, for the audit log).
async function updateProfile(id, { name, email, phone, emailVerified }) {
  const user = await mustFind(id);
  const changes = {};
  const set = (key, value) => {
    if (value === undefined || String(user[key] ?? '') === String(value)) return;
    changes[key] = { from: user[key] ?? '', to: value };
    user[key] = value;
  };
  if (name !== undefined) {
    const clean = name.replace(/\s+/g, ' ').trim();
    const parts = clean.split(' ');
    set('name', clean);
    set('firstName', parts[0] || '');
    set('lastName', parts.slice(1).join(' '));
  }
  if (email !== undefined && email !== String(user.email).toLowerCase()) {
    const taken = await User.exists({ _id: { $ne: user._id }, email: new RegExp(`^${escapeRegex(email)}$`, 'i') });
    if (taken) throw Object.assign(new Error('Another account already uses this email.'), { status: 409 });
    set('email', email);
  }
  if (phone !== undefined) {
    const e164 = phone ? toE164(phone) : '';
    if (phone && !e164) throw Object.assign(new Error('Please enter a valid mobile number, e.g. +91 98123 45678.'), { status: 400 });
    set('phone', e164);
  }
  if (emailVerified !== undefined && (user.emailVerified !== false) !== emailVerified) {
    changes.emailVerified = { from: user.emailVerified !== false, to: emailVerified };
    user.emailVerified = emailVerified;
    if (emailVerified) {
      user.verifyTokenHash = '';
      user.verifyTokenExpiry = null;
    }
  }
  if (!Object.keys(changes).length) throw Object.assign(new Error('Nothing to change.'), { status: 400 });
  try {
    await user.save();
  } catch (err) {
    if (err.code === 11000) throw Object.assign(new Error('Another account already uses this email.'), { status: 409 });
    throw err;
  }
  return { user, changes };
}

// New password set by an admin. signOut: other sessions of the user stop working.
async function setPassword(id, password, { signOut = true } = {}) {
  const user = await mustFind(id);
  user.password = await bcrypt.hash(password, 10);
  user.resetTokenHash = '';
  user.resetTokenExpiry = null;
  if (signOut) user.tokensValidAfter = new Date();
  await user.save();
  forgetAccountStatus(id);
  return user;
}

async function signOutEverywhere(id) {
  const user = await mustFind(id);
  user.tokensValidAfter = new Date();
  await user.save();
  forgetAccountStatus(id);
  return user;
}

// One-time code for "sign in as this user" (valid 60 s, stored hashed). See POST /api/auth/impersonate.
async function createHandoff(id, adminId) {
  const user = await mustFind(id);
  if (user.deletedAt) throw Object.assign(new Error('Restore this user first.'), { status: 400 });
  if (user.isBlocked) throw Object.assign(new Error('Unblock this user first: blocked accounts cannot be used.'), { status: 400 });
  const code = crypto.randomBytes(32).toString('hex');
  await AdminHandoff.create({ codeHash: crypto.createHash('sha256').update(code).digest('hex'), user: user._id, admin: adminId, expiresAt: new Date(Date.now() + 60 * 1000) });
  return { user, code };
}

module.exports = { listUsers, userDetail, orderView, statusOf, setBlocked, setRemoved, purgeUser, grantPlan, extendPlan, changePlan, revokePlan, addCredits, updateProfile, setPassword, signOutEverywhere, createHandoff, createUser, USER_FIELDS };
