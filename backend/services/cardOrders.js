// "Get my card" flow: order → Razorpay payment link (24h) → link by email + WhatsApp →
// paid (webhook) → card PDF/image delivered by WhatsApp (3 tries) + email.
const CardOrder = require('../models/CardOrder');
const Notification = require('../models/Notification');
const User = require('../models/User');
const vCard = require('../models/vCard');
const { createPaymentLink, fetchPaymentLink, cancelPaymentLink, isRazorpayConfigured } = require('../utils/razorpay');
const { sendTemplate, isWhatsAppConfigured } = require('../utils/whatsapp');
const { sendMail, emailHtml } = require('../utils/mailer');
const { buildCardAssets } = require('../utils/cardAssets');
const { logEvent } = require('../utils/logger');

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
  if (!isRazorpayConfigured()) throw Object.assign(new Error('Payments are not set up yet. Please try again later.'), { status: 503 });
  const card = await vCard.findOne({ userId: user._id });
  if (!card) throw Object.assign(new Error('Create your card first, then get it delivered.'), { status: 400 });

  const latest = await expireIfDue(await CardOrder.findOne({ user: user._id, card: card._id }).sort({ createdAt: -1 }));
  if (latest && latest.status === 'PAID') return { order: latest, created: false };
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
  if (latest && latest.status === 'PENDING_PAYMENT' && latest.paymentLinkId) {
    await cancelPaymentLink(latest.paymentLinkId);
    latest.status = 'CANCELLED';
    await latest.save();
  }
  try {
    const link = await createPaymentLink({
      amount: order.amount,
      referenceId: String(order._id),
      description: `Aicardly digital card – ${card.personalInfo?.name || user.name}`.slice(0, 2048),
      customer: { name: user.name, email: user.email, ...(user.phone ? { contact: user.phone } : {}) },
      expiresAt: order.expiresAt,
      callbackUrl: `${SITE}/dashboard/get-card?order=${order._id}`,
      notes: { order_id: String(order._id), user_id: String(user._id), card: card.username },
    });
    order.paymentLinkId = link.id;
    order.paymentLinkUrl = link.url;
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

// Idempotent: only the first call for an order flips it to PAID and returns it; repeats return null.
async function markPaid(orderId, paymentId) {
  const order = await CardOrder.findOneAndUpdate(
    { _id: orderId, status: { $in: ['PENDING_PAYMENT', 'EXPIRED'] } },
    { $set: { status: 'PAID', paidAt: new Date(), razorpayPaymentId: paymentId || '', 'delivery.status': 'PENDING' } },
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
    await record(order, 'email', 'card_delivery', order.email, () =>
      sendMail({
        to: order.email,
        subject: 'Your Aicardly card is here 🎉',
        text: `Hi ${first(user)},\n\nThanks for your payment! Your card is attached (PDF). Download it any time: ${order.delivery.pdfUrl}\nYour live card: ${cardUrl}\n\n– Team Aicardly`,
        html: emailHtml({
          heading: 'Your card is here 🎉',
          paragraphs: [
            `Hi ${first(user)}, thanks for your payment! Your finished card is attached as a PDF${order.delivery.imageUrl ? ' and an image' : ''}.`,
            `Your live card: <a href="${cardUrl}">${cardUrl.replace(/^https?:\/\//, '')}</a>`,
          ],
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

// Asks Razorpay directly (after the payment page sends the user back, before the webhook lands).
async function syncWithRazorpay(order) {
  if (!order?.paymentLinkId || order.status === 'PAID') return order;
  const link = await fetchPaymentLink(order.paymentLinkId);
  if (link.status === 'paid') {
    const paymentId = (link.payments || []).find((p) => p.status === 'captured')?.payment_id || '';
    return (await markPaid(order._id, paymentId)) || (await CardOrder.findById(order._id));
  }
  if ((link.status === 'expired' || link.status === 'cancelled') && order.status === 'PENDING_PAYMENT') {
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

module.exports = { publicOrder, getOrCreateOrder, sendPaymentLink, expireIfDue, markPaid, deliverCard, syncWithRazorpay, runJobs, PRICE_INR };
