// The 24-hour free trial. A free account's card works for 24 hours after its first card is made.
// Then the card pauses (its public page says so) and the owner gets an upgrade link:
//   - by email: /upgrade/<token>, a no-login page to pick any plan and pay (Cashfree checkout)
//   - by SMS: a Cashfree payment link for Smart AI Card monthly, which Cashfree texts itself
// Paying either one activates the plan and the card is live again at once.
// Cards made before the trial existed (TRIAL_FLOOR) get the link right away and 24 hours' grace.
// Env: TRIAL_HOURS (default 24), TRIAL_FLOOR (ISO time the rule started), PUBLIC_API_URL.
const crypto = require('crypto');
const User = require('../models/User');
const vCard = require('../models/vCard');
const Transaction = require('../models/Transaction');
const { PRICING_ENABLED, isPaid, priceFor } = require('../constants/plans');
const { sendMail, emailHtml, isMailConfigured } = require('../utils/mailer');
const { logEvent } = require('../utils/logger');
const cashfree = require('./cashfree');

const HOUR = 3600 * 1000;
let linksBlockedUntil = 0;
const TRIAL_HOURS = Math.max(0.001, Number(process.env.TRIAL_HOURS) || 24); // fractions only in tests
const TRIAL_FLOOR = new Date(process.env.TRIAL_FLOOR || '2026-10-07T10:00:00Z') // 7 Oct 2026, 3:30 pm IST;
const SMS_PLAN = { planId: 'smart-ai-card', billing: 'monthly' };
// The public site for links in emails (FRONTEND_URL in production still names the old domain).
const SITE = (process.env.SITE_URL || 'https://aicardly.com').replace(/\/$/, '');
const API = (process.env.PUBLIC_API_URL || 'https://backend-nine-omega-26.vercel.app').replace(/\/$/, '');
// Testing: emails listed here have their trial treated as over (card paused, link sent on the next view).
const END_NOW = new Set(String(process.env.TRIAL_END_EMAILS || '').toLowerCase().split(/[\s,]+/).filter(Boolean));
// ...and a link sent to them before this time is sent once more (to test the email + SMS again).
const RESEND_SINCE = process.env.TRIAL_END_SINCE ? new Date(process.env.TRIAL_END_SINCE) : null;
const testResend = (user) => !!(RESEND_SINCE && END_NOW.has(String(user?.email || '').toLowerCase()) && user.upgrade?.sentAt && new Date(user.upgrade.sentAt) < RESEND_SINCE);

const hashToken = (t) => crypto.createHash('sha256').update(String(t)).digest('hex');
const firstName = (u) => String(u?.name || '').trim().split(/\s+/)[0] || 'there';

// Paid, lifetime and admin accounts (or pricing switched off) never pause.
const exempt = (user) => !PRICING_ENABLED || !user || user.isAdmin || isPaid(user);

async function firstCardAt(userId) {
  const c = await vCard.findOne({ userId }).sort({ createdAt: 1 }).select('createdAt').lean();
  return c?.createdAt ? new Date(c.createdAt) : null;
}

// When the link is due and when the card pauses, from the first card's time. An admin can end a
// trial earlier (endsAt = upgrade.trialEndsAt).
function windowFor(firstAt, endsAt) {
  if (!firstAt) return null;
  const legacy = firstAt < TRIAL_FLOOR;
  let linkAt = legacy ? TRIAL_FLOOR : new Date(firstAt.getTime() + TRIAL_HOURS * HOUR);
  let pauseAt = new Date(Math.max(firstAt.getTime() + TRIAL_HOURS * HOUR, TRIAL_FLOOR.getTime() + TRIAL_HOURS * HOUR));
  if (endsAt) {
    const e = new Date(endsAt);
    if (e < linkAt) linkAt = e;
    if (e < pauseAt) pauseAt = e;
  }
  return { linkAt, pauseAt };
}

// Everything the dashboard and the public card need to know.
async function trialState(user, firstAt) {
  if (exempt(user)) return { active: false };
  const at = firstAt === undefined ? await firstCardAt(user._id) : firstAt;
  const w = windowFor(at, user.upgrade?.trialEndsAt || (END_NOW.has(String(user.email || '').toLowerCase()) ? new Date(0) : null));
  if (!w) return { active: true, started: false, hours: TRIAL_HOURS };
  const now = Date.now();
  return {
    active: true,
    started: true,
    hours: TRIAL_HOURS,
    pauseAt: w.pauseAt,
    paused: now >= w.pauseAt.getTime(),
    hoursLeft: Math.max(0, Math.ceil((w.pauseAt.getTime() - now) / HOUR)),
    linkDue: now >= w.linkAt.getTime(),
    linkSentAt: user.upgrade?.sentAt || null,
  };
}

const isCardPaused = async (owner) => !!(await trialState(owner)).paused;

// A fresh no-login upgrade link for this user (the old one stops working).
async function newUpgradeToken(user) {
  const token = crypto.randomBytes(24).toString('base64url');
  await User.updateOne({ _id: user._id }, { $set: { 'upgrade.tokenHash': hashToken(token) } });
  return token;
}

async function userForToken(token) {
  if (!token || String(token).length < 20) return null;
  return User.findOne({ 'upgrade.tokenHash': hashToken(token), deletedAt: null });
}

// The Cashfree payment link for the SMS (Smart AI Card monthly). Returns the link or null when
// the user has no Indian mobile number or Cashfree refuses.
async function smsLink(user, upgradeUrl) {
  const phone = cashfree.indianMobile(user.phone);
  if (!phone || !cashfree.isCashfreeConfigured()) return { skipped: !phone ? 'No Indian mobile number' : 'Cashfree not configured' };
  const price = priceFor(SMS_PLAN.planId, SMS_PLAN.billing);
  // Cashfree refused payment links recently (product not enabled): don't try again for a while.
  if (Date.now() < linksBlockedUntil) return { skipped: 'Cashfree payment links are not enabled on the account' };
  const txn = await Transaction.create({
    userId: user._id, plan: price.name, amount: price.amount, base: price.base, gst: price.gst,
    billingType: price.billingType, expireDays: price.days, status: 'pending', source: 'sms-link',
  });
  const linkId = `up_${txn._id}`;
  try {
    const link = await cashfree.createLink({
      linkId,
      amount: price.amount,
      purpose: `Aicardly ${price.name} (${price.billingType}) to keep your card live. Other plans: ${upgradeUrl}`,
      user,
      phone,
      sendSms: true,
      expiresAt: new Date(Date.now() + 30 * 24 * HOUR),
      returnUrl: `${SITE}/upgrade/paid`,
      notifyUrl: `${API}/api/transactions/webhook`,
      notes: { userId: String(user._id), source: 'trial' },
    });
    txn.cfLinkId = linkId;
    await txn.save();
    return { link };
  } catch (err) {
    // No link was made, so it was never a purchase: don't leave a "failed payment" behind.
    await Transaction.deleteOne({ _id: txn._id });
    if (/not enabled|not approved|not activated/i.test(err.message)) {
      linksBlockedUntil = Date.now() + 6 * HOUR;
      logEvent(null, 'cashfree.links.disabled', `Cashfree payment links are off for this account: ${err.message}. Ask Cashfree support to enable "Payment Links".`, { level: 'error', userId: user._id });
    }
    return { error: err.message };
  }
}

// Sends the upgrade link by email and SMS. Once per user unless force (admin "send again").
async function sendUpgradeLink(user, { force = false, reason = 'trial', sentBefore = null } = {}) {
  // Claim the send, so the cron and a card view can't both send it.
  const claimed = await User.findOneAndUpdate(
    force ? { _id: user._id } : sentBefore ? { _id: user._id, 'upgrade.sentAt': { $lt: sentBefore } } : { _id: user._id, 'upgrade.sentAt': null },
    { $set: { 'upgrade.sentAt': new Date() } },
    { new: true }
  );
  if (!claimed) return { skipped: 'already sent' };
  user = claimed;

  const token = await newUpgradeToken(user);
  const upgradeUrl = `${SITE}/upgrade/${token}`;
  const sms = await smsLink(user, upgradeUrl);
  const smsPrice = priceFor(SMS_PLAN.planId, SMS_PLAN.billing);

  let email = 'skipped';
  if (isMailConfigured() && user.email) {
    try {
      await sendMail({
        to: user.email,
        subject: `Please upgrade your card, ${firstName(user)}: your Aicardly free trial has ended`,
        text: `Hi ${firstName(user)},\n\nYour ${TRIAL_HOURS}-hour free trial is over, so your Aicardly card is paused. Choose a plan and pay here to switch it back on right away:\n${upgradeUrl}\n${sms.link ? `\nWe've also sent a payment link to your phone for Smart AI Card (₹${smsPrice.amount} for a month incl. GST).\n` : ''}\n– Team Aicardly`,
        html: emailHtml({
          heading: 'Please upgrade your card',
          paragraphs: [
            `Hi ${firstName(user)}, your ${TRIAL_HOURS}-hour free trial is over, so your Aicardly card is <b>paused</b> for now. Anyone opening your link sees that it's paused.`,
            'Pick a plan and pay in one step. No login needed, and your card is live again the moment the payment goes through.',
            sms.link ? `We've also sent a payment link by SMS to your phone for <b>Smart AI Card</b> (₹${smsPrice.amount} for a month, incl. GST).` : '',
          ].filter(Boolean),
          button: { label: 'Choose a plan & pay', url: upgradeUrl },
          footer: 'Prices are plus 18% GST. Questions? Just reply to this email.',
        }),
      });
      email = 'sent';
    } catch (err) {
      email = 'failed';
      logEvent(null, 'trial.email.failed', err.message, { level: 'error', userId: user._id });
    }
  }
  const smsStatus = sms.link ? 'sent' : sms.error ? 'failed' : 'skipped';
  await User.updateOne(
    { _id: user._id },
    { $set: { 'upgrade.email': email, 'upgrade.sms': smsStatus, 'upgrade.cfLinkId': sms.link?.link_id || '', 'upgrade.cfLinkUrl': sms.link?.link_url || '', 'upgrade.error': sms.error || sms.skipped || '' } }
  );
  logEvent(null, 'trial.link', `Upgrade link (${reason}) to ${SITE}/upgrade/…: email ${email}, SMS ${smsStatus}${sms.error ? ` (${sms.error})` : sms.skipped ? ` (${sms.skipped})` : ''}`, { userId: user._id, email: user.email, level: email === 'failed' || smsStatus === 'failed' ? 'warn' : 'info' });
  return { email, sms: smsStatus, error: sms.error || sms.skipped || '', upgradeUrl };
}

// Sends the link to everyone whose time has come (the scheduled job; also safe to run often).
async function sweep({ limit = 40 } = {}) {
  if (!PRICING_ENABLED) return { checked: 0, sent: 0 };
  const owners = await vCard.distinct('userId');
  const users = await User.find({ _id: { $in: owners }, 'upgrade.sentAt': null, deletedAt: null, isBlocked: { $ne: true } }).limit(500);
  let checked = 0;
  let sent = 0;
  for (const u of users) {
    if (sent >= limit) break;
    if (exempt(u)) continue;
    checked++;
    const s = await trialState(u);
    if (s.started && s.linkDue) {
      await sendUpgradeLink(u, { reason: 'scheduled' });
      sent++;
    }
  }
  return { checked, sent };
}

// A card view or dashboard visit after the trial: send the link now if the job hasn't yet.
function nudge(user, state) {
  if (state?.active && state.linkDue && testResend(user)) {
    return sendUpgradeLink(user, { reason: 'test-resend', sentBefore: RESEND_SINCE }).catch((err) => logEvent(null, 'trial.link.error', err.message, { level: 'error', userId: user._id }));
  }
  if (state?.active && state.linkDue && !user.upgrade?.sentAt) {
    return sendUpgradeLink(user, { reason: 'visit' }).catch((err) => logEvent(null, 'trial.link.error', err.message, { level: 'error', userId: user._id }));
  }
  return null;
}

// Admin: end this user's trial now (the card pauses and the upgrade link goes out once).
async function endTrialNow(user) {
  await User.updateOne({ _id: user._id }, { $set: { 'upgrade.trialEndsAt': new Date() } });
  const fresh = await User.findById(user._id);
  const state = await trialState(fresh);
  const sent = state.active && state.started ? await sendUpgradeLink(fresh, { reason: 'admin-ended-trial' }) : { skipped: state.active ? 'no card yet' : 'paid, lifetime or admin account' };
  return { state, sent };
}

module.exports = { endTrialNow, TRIAL_HOURS, TRIAL_FLOOR, SMS_PLAN, exempt, firstCardAt, trialState, isCardPaused, sendUpgradeLink, userForToken, newUpgradeToken, sweep, nudge };
