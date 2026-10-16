// "Get my card" flow: order → Cashfree payment link (24h) → link by email + WhatsApp →
// paid (webhook) → card PDF/image delivered by WhatsApp (3 tries) + email.
const CardOrder = require('../models/CardOrder');
const Notification = require('../models/Notification');
const User = require('../models/User');
const vCard = require('../models/vCard');
const cashfree = require('./cashfree');

// Payment is a Cashfree checkout order (the same as plan payments). The link we send by email and
// WhatsApp opens our page aicardly.com/pay/card/<token>, which starts the Cashfree checkout. (Cashfree
// Payment Links need a separate approval on the account; checkout orders don't.)
const API_BASE = (process.env.PUBLIC_API_URL || 'https://backend-nine-omega-26.vercel.app').replace(/\/$/, '');
const isPaymentsConfigured = () => cashfree.isCashfreeConfigured();
const cancelPaymentLink = (id) => cashfree.cancelLink(id);
const crypto = require('crypto');
const { sendTemplate, isWhatsAppConfigured } = require('../utils/whatsapp');
const { sendMail, emailHtml } = require('../utils/mailer');
const { buildCardAssets } = require('../utils/cardAssets');
const { logEvent } = require('../utils/logger');
const background = require('../utils/background');

const SITE = (process.env.SITE_URL || 'https://aicardly.com').replace(/\/$/, '');
const PRICE_INR = () => Number(process.env.CARD_PRICE_INR) || 999;
const LINK_HOURS = 24;
const REMINDER_BEFORE_MS = 2 * 60 * 60 * 1000;
const MAX_WA_ATTEMPTS = 3;

const first = (user) => user.firstName || String(user.name || '').split(' ')[0] || 'there';
const rupees = (paise) => (paise / 100).toLocaleString('en-IN');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// What the dashboard sees.
const publicOrder = (o) =>
  o && {
    id: o._id,
    status: o.status,
    amount: o.amount,
    currency: o.currency,
    paymentLinkUrl: o.status === 'PENDING_PAYMENT' ? o.paymentLinkUrl : '',
    expiresAt: o.expiresAt,
    paidAt: o.paidAt,
    complimentary: !!o.complimentary,
    phone: o.phone,
    email: o.email,
    createdAt: o.createdAt,
    delivery: {
      status: o.delivery?.status,
      attempts: o.delivery?.attempts,
      lastError: o.delivery?.lastError,
      pdfUrl: o.status === 'PAID' ? o.delivery?.pdfUrl : '',
      imageUrl: o.status === 'PAID' ? o.delivery?.imageUrl : '',
      deliveredAt: o.delivery?.deliveredAt,
    },
  };

async function record(order, channel, type, to, fn) {
  const n = await Notification.create({ order: order._id, user: order.user, channel, type, to });
  try {
    const id = await fn();
    n.status = id === false ? 'failed' : 'sent';
    if (typeof id === 'string') n.providerMessageId = id;
    if (id === false) n.error = 'Not sent (see logs)';
  } catch (err) {
    n.status = 'failed';
    n.error = err.message.slice(0, 500);
  }
  await n.save();
  return n;
}

// Payment link (or the 2-hour reminder) by email and WhatsApp, both at once.
async function sendPaymentLink(order, user, type = 'payment_link') {
  const reminder = type === 'payment_reminder';
  const amount = rupees(order.amount);
  const tasks = [
    record(order, 'email', type, order.email, () =>
      sendMail({
        to: order.email,
        subject: reminder ? 'Reminder: your Aicardly payment link expires soon' : 'Complete your payment – your card is ready',
        text: `Hi ${first(user)},\n\nYour Aicardly card is ready. Pay ₹${amount} here to get it on WhatsApp and email:\n${order.paymentLinkUrl}\n\nThis link expires on ${order.expiresAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.\n\n– Team Aicardly`,
        html: emailHtml({
          heading: reminder ? 'Your payment link expires soon' : 'Your card is ready 🎉',
          paragraphs: [
            `Hi ${first(user)}, ${reminder ? 'just a reminder: ' : ''}complete your payment of <b>₹${amount}</b> and we'll send your finished card to your WhatsApp and email right away.`,
            `This link works until <b>${order.expiresAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</b> (IST).`,
          ],
          button: { label: `Pay ₹${amount}`, url: order.paymentLinkUrl },
          footer: 'The link expires in 24 hours. You can create a new one any time from your dashboard.',
        }),
      })
    ),
  ];
  if (order.phone && isWhatsAppConfigured()) {
    tasks.push(
      record(order, 'whatsapp', type, order.phone, () =>
        sendTemplate({
          to: order.phone,
          type,
          body: reminder ? [first(user), order.paymentLinkUrl] : [first(user), amount, order.paymentLinkUrl],
        })
      )
    );
  } else {
    tasks.push(
      Notification.create({ order: order._id, user: order.user, channel: 'whatsapp', type, to: order.phone, status: 'skipped', error: order.phone ? 'WhatsApp not configured' : 'No phone number' })
    );
  }
  return Promise.all(tasks);
}

// Marks due pending orders EXPIRED (also done lazily whenever an order is read).
async function expireIfDue(order) {
  if (order && order.status === 'PENDING_PAYMENT' && order.expiresAt <= new Date()) {
    order.status = 'EXPIRED';
    await order.save();
  }
  return order;
}

// Latest order for the user's card, or a new one with a fresh link and notifications.
// Returns { order, created }. An open (unexpired, unpaid) order is reused, never duplicated.
async function getOrCreateOrder(user, { forceNew = false } = {}) {
  const card = await vCard.findOne({ userId: user._id });
  if (!card) throw Object.assign(new Error('Create your card first, then get it delivered.'), { status: 400 });

  const latest = await expireIfDue(await CardOrder.findOne({ user: user._id, card: card._id }).sort({ createdAt: -1 }));
  if (latest && latest.status === 'PAID') return { order: latest, created: false };

  // A free card credit from the admin panel: the order is paid at once and delivered, no link.
  const comp = await createComplimentaryOrder(user, card, latest);
  if (comp) return { order: comp, created: true };

  if (!isPaymentsConfigured()) throw Object.assign(new Error('Payments are not set up yet. Please try again later.'), { status: 503 });
  if (latest && latest.status === 'PENDING_PAYMENT' && !forceNew) return { order: latest, created: false };

  const now = new Date();
  const order = await CardOrder.create({
    user: user._id,
    card: card._id,
    amount: PRICE_INR() * 100,
    phone: user.phone || '',
    email: user.email,
    expiresAt: new Date(now.getTime() + LINK_HOURS * 60 * 60 * 1000),
  });
  if (latest && latest.status === 'PENDING_PAYMENT') {
    if (latest.paymentLinkId) await cancelPaymentLink(latest.paymentLinkId);
    latest.status = 'CANCELLED';
    await latest.save();
  }
  try {
    const payToken = crypto.randomBytes(16).toString('hex');
    const cf = await cashfree.createOrder({
      orderId: `card_${order._id}`,
      amount: order.amount / 100,
      user,
      returnUrl: `${SITE}/pay/card/${payToken}?done=1`,
      notifyUrl: `${API_BASE}/api/transactions/webhook`,
      expiresAt: order.expiresAt,
      tags: { card_order: String(order._id), card: card.username },
    });
    order.cfOrderId = cf.order_id;
    order.paymentSessionId = cf.payment_session_id;
    order.payToken = payToken;
    order.paymentLinkUrl = `${SITE}/pay/card/${payToken}`;
    await order.save();
  } catch (err) {
    order.status = 'FAILED';
    await order.save();
    logEvent(null, 'card_order.link.error', err.message, { level: 'error', userId: user._id, email: user.email });
    throw Object.assign(new Error('Could not create the payment link. Please try again.'), { status: 502 });
  }
  logEvent(null, 'card_order.created', `Payment link created (₹${rupees(order.amount)})`, { userId: user._id, email: user.email, meta: { orderId: String(order._id) } });
  await sendPaymentLink(order, user);
  return { order, created: true };
}

// Uses one of the user's free card credits (granted in the admin panel), if any: creates a PAID
// order for ₹0, cancels an open payment link, and starts the delivery. Returns null without credits.
async function createComplimentaryOrder(user, card, latest) {
  const claimed = await User.findOneAndUpdate(
    { _id: user._id, freeCardCredits: { $gt: 0 } },
    { $inc: { freeCardCredits: -1 } },
    { returnDocument: 'after' }
  );
  if (!claimed) return null;
  const now = new Date();
  let order;
  try {
    order = await CardOrder.create({
      user: user._id,
      card: card._id,
      amount: 0,
      status: 'PAID',
      complimentary: true,
      paidAt: now,
      phone: user.phone || '',
      email: user.email,
      expiresAt: now,
      delivery: { status: 'PENDING' },
    });
  } catch (err) {
    await User.updateOne({ _id: user._id }, { $inc: { freeCardCredits: 1 } });
    throw err;
  }
  if (latest && latest.status === 'PENDING_PAYMENT') {
    if (latest.paymentLinkId) await cancelPaymentLink(latest.paymentLinkId).catch(() => {});
    latest.status = 'CANCELLED';
    await latest.save();
  }
  logEvent(null, 'card_order.complimentary', 'Free card order (admin credit used)', { userId: user._id, email: user.email, meta: { orderId: String(order._id), creditsLeft: claimed.freeCardCredits } });
  background(deliverCard(order._id));
  return order;
}

// Idempotent: only the first call for an order flips it to PAID and returns it; repeats return null.
async function markPaid(orderId, paymentId) {
  const order = await CardOrder.findOneAndUpdate(
    { _id: orderId, status: { $in: ['PENDING_PAYMENT', 'EXPIRED'] } },
    { $set: { status: 'PAID', paidAt: new Date(), paymentId: paymentId || '', 'delivery.status': 'PENDING' } },
    { returnDocument: 'after' }
  );
  if (order) logEvent(null, 'card_order.paid', `Card order paid (₹${rupees(order.amount)})`, { userId: order.user, email: order.email, meta: { orderId: String(order._id), paymentId } });
  return order;
}

// Sends the finished card: WhatsApp (document template, up to 3 tries) + email copy with the files.
// manual = user/admin "Resend": allowed after any outcome. Never runs twice at the same time.
async function deliverCard(orderId, { manual = false } = {}) {
  const now = new Date();
  const allowed = manual ? ['PENDING', 'FAILED', 'SENT', 'DELIVERED', 'READ', 'SKIPPED'] : ['PENDING'];
  const order = await CardOrder.findOneAndUpdate(
    {
      _id: orderId,
      status: 'PAID',
      'delivery.status': { $in: allowed },
      $or: [{ 'delivery.lockUntil': null }, { 'delivery.lockUntil': { $lt: now } }],
    },
    { $set: { 'delivery.lockUntil': new Date(now.getTime() + 3 * 60 * 1000) } },
    { returnDocument: 'after' }
  );
  if (!order) return null;

  const [user, card] = await Promise.all([User.findById(order.user), vCard.findById(order.card)]);
  try {
    if (!order.delivery.pdfUrl) {
      const assets = await buildCardAssets(card, user, order._id);
      order.delivery.pdfUrl = assets.pdfUrl;
      order.delivery.imageUrl = assets.imageUrl;
    }
    const cardUrl = `${SITE}/${card.username}`;
    const filename = `${(card.personalInfo?.name || card.username).replace(/[^\w -]/g, '').trim() || 'card'} - Aicardly.pdf`;

    // WhatsApp, with retries.
    let waOk = false;
    let waError = '';
    if (order.phone && isWhatsAppConfigured()) {
      order.delivery.attempts = manual ? 0 : order.delivery.attempts;
      for (let i = 0; i < MAX_WA_ATTEMPTS && !waOk; i++) {
        order.delivery.attempts += 1;
        const n = await record(order, 'whatsapp', 'card_delivery', order.phone, () =>
          sendTemplate({ to: order.phone, type: 'card_delivery', document: { link: order.delivery.pdfUrl, filename }, body: [first(user), cardUrl] })
        );
        waOk = n.status === 'sent';
        waError = n.error;
        if (!waOk && i < MAX_WA_ATTEMPTS - 1) await sleep(1000 * 2 ** i);
      }
      order.delivery.status = waOk ? 'SENT' : 'FAILED';
      order.delivery.lastError = waOk ? '' : waError;
      if (waOk) order.delivery.deliveredAt = new Date();
      if (!waOk) logEvent(null, 'card_order.whatsapp.failed', `Card delivery on WhatsApp failed after ${MAX_WA_ATTEMPTS} tries: ${waError}`, { level: 'error', userId: order.user, email: order.email, meta: { orderId: String(order._id) } });
    } else {
      order.delivery.status = 'SKIPPED';
      order.delivery.lastError = order.phone ? 'WhatsApp is not set up yet' : 'No phone number on the account';
    }

    // Email copy (always).
    const t = await require('./emailTemplates').emailText('cardReady', { name: first(user) });
    await record(order, 'email', 'card_delivery', order.email, () =>
      sendMail({
        to: order.email,
        subject: t.subject,
        text: `Hi ${first(user)},\n\nThanks for your payment! Your card is attached (PDF). Download it any time: ${order.delivery.pdfUrl}\nYour live card: ${cardUrl}\n\n– Team Aicardly`,
        html: emailHtml({
          heading: t.heading || 'Your card is here 🎉',
          paragraphs: [
            t.intro,
            `Hi ${first(user)}, thanks for your payment! Your finished card is attached as a PDF${order.delivery.imageUrl ? ' and an image' : ''}.`,
            `Your live card: <a href="${cardUrl}">${cardUrl.replace(/^https?:\/\//, '')}</a>`,
          ].filter(Boolean),
          button: { label: 'Download my card (PDF)', url: order.delivery.pdfUrl },
        }),
        attachments: [
          { filename, path: order.delivery.pdfUrl },
          ...(order.delivery.imageUrl ? [{ filename: filename.replace(/\.pdf$/, '.jpg'), path: order.delivery.imageUrl }] : []),
        ],
      })
    );
    logEvent(null, 'card_order.delivery', `Card delivery done – WhatsApp: ${order.delivery.status}, email copy sent`, { userId: order.user, email: order.email, meta: { orderId: String(order._id) } });
  } catch (err) {
    order.delivery.status = 'FAILED';
    order.delivery.lastError = err.message.slice(0, 500);
    logEvent(null, 'card_order.delivery.error', err.message, { level: 'error', userId: order.user, email: order.email, meta: { orderId: String(order._id) } });
  } finally {
    order.delivery.lockUntil = null;
    await order.save();
  }
  return order;
}

// Asks Cashfree directly (after the payment page sends the user back, before the webhook lands).
async function syncPayment(order) {
  if (!order || order.status === 'PAID') return order;
  if (order.cfOrderId) {
    const cf = await cashfree.getOrder(order.cfOrderId);
    if (cf.order_status === 'PAID') return (await markPaid(order._id, order.cfOrderId)) || (await CardOrder.findById(order._id));
    if (['EXPIRED', 'TERMINATED'].includes(cf.order_status) && order.status === 'PENDING_PAYMENT') {
      order.status = 'EXPIRED';
      await order.save();
    }
    return order;
  }
  if (!order.paymentLinkId) return order;
  const link = await cashfree.getLink(order.paymentLinkId);
  if (link.link_status === 'PAID') {
    return (await markPaid(order._id, link.cf_link_id ? String(link.cf_link_id) : order.paymentLinkId)) || (await CardOrder.findById(order._id));
  }
  if (['EXPIRED', 'CANCELLED'].includes(link.link_status) && order.status === 'PENDING_PAYMENT') {
    order.status = 'EXPIRED';
    await order.save();
  }
  return order;
}

// Scheduled job (every 5–10 minutes): expire links, send 2-hour reminders, finish stuck deliveries.
async function runJobs() {
  const now = new Date();
  const expired = await CardOrder.updateMany({ status: 'PENDING_PAYMENT', expiresAt: { $lte: now } }, { $set: { status: 'EXPIRED' } });

  let reminders = 0;
  const due = await CardOrder.find({
    status: 'PENDING_PAYMENT',
    reminderSentAt: null,
    expiresAt: { $gt: now, $lte: new Date(now.getTime() + REMINDER_BEFORE_MS) },
  }).limit(50);
  for (const order of due) {
    const claimed = await CardOrder.findOneAndUpdate({ _id: order._id, reminderSentAt: null }, { $set: { reminderSentAt: now } }, { returnDocument: 'after' });
    if (!claimed) continue;
    const user = await User.findById(order.user);
    if (user) {
      await sendPaymentLink(claimed, user, 'payment_reminder');
      reminders++;
    }
  }

  let deliveries = 0;
  const stuck = await CardOrder.find({ status: 'PAID', 'delivery.status': 'PENDING', paidAt: { $lte: new Date(now.getTime() - 60 * 1000) } }).limit(10);
  for (const order of stuck) {
    if (await deliverCard(order._id)) deliveries++;
  }
  return { expired: expired.modifiedCount || 0, reminders, deliveries };
}

// A Cashfree payment link webhook for a card order (routes/transactions.js): mark it paid and deliver.
async function settleCardLink(linkId) {
  const order = await CardOrder.findOne({ paymentLinkId: linkId });
  if (!order) return false;
  const synced = await syncPayment(order);
  if (synced?.status === 'PAID' && synced.delivery?.status === 'PENDING') background(deliverCard(synced._id));
  return true;
}

// Cashfree webhook for a checkout order "card_<id>" (routes/transactions.js): mark paid and deliver.
async function settleCardOrder(cfOrderId) {
  const order = await CardOrder.findOne({ cfOrderId });
  if (!order) return false;
  const synced = await syncPayment(order);
  if (synced?.status === 'PAID' && synced.delivery?.status === 'PENDING') background(deliverCard(synced._id));
  return true;
}

// The public pay page (/pay/card/<token>): what it shows and the checkout session it opens.
async function payInfo(token) {
  if (!/^[a-f0-9]{32}$/.test(String(token || ''))) return null;
  const order = await expireIfDue(await CardOrder.findOne({ payToken: token }));
  if (!order) return null;
  const card = await vCard.findById(order.card).select('username personalInfo.name').lean();
  return {
    order,
    view: {
      status: order.status,
      amount: order.amount / 100,
      name: card?.personalInfo?.name || '',
      cardLink: card?.username ? `${SITE.replace(/^https?:\/\//, '')}/${card.username}` : '',
      expiresAt: order.expiresAt,
      paymentSessionId: order.status === 'PENDING_PAYMENT' ? order.paymentSessionId : '',
      cfEnv: cashfree.CF_ENV,
    },
  };
}

module.exports = { settleCardOrder, payInfo, publicOrder, createComplimentaryOrder, getOrCreateOrder, sendPaymentLink, expireIfDue, markPaid, deliverCard, syncPayment, settleCardLink, runJobs, PRICE_INR, isPaymentsConfigured };
