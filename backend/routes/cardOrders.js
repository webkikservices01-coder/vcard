// /api/card-orders — "Get my card": pay with a Razorpay link, receive the card on WhatsApp + email.
const express = require('express');
const auth = require('../middleware/auth');
const { cardOrderLimiter } = require('../middleware/rateLimiter');
const CardOrder = require('../models/CardOrder');
const User = require('../models/User');
const vCard = require('../models/vCard');
const { toE164 } = require('../utils/phone');
const { isRazorpayConfigured } = require('../utils/razorpay');
const { isWhatsAppConfigured } = require('../utils/whatsapp');
const svc = require('../services/cardOrders');
const background = require('../utils/background');

const router = express.Router();

const fail = (res, err, fallback) => res.status(err.status || 500).json({ msg: err.status ? err.message : fallback });

const ownOrder = async (req) => {
  const order = await CardOrder.findOne({ _id: req.params.id, user: req.user.userId });
  if (!order) throw Object.assign(new Error('Order not found.'), { status: 404 });
  return order;
};

// GET /config → price and what is switched on.
router.get('/config', (req, res) => {
  res.json({ priceInr: svc.PRICE_INR(), payments: isRazorpayConfigured(), whatsapp: isWhatsAppConfigured(), linkHours: 24 });
});

// GET /me → the latest order for my card (expired ones are marked on the way).
router.get('/me', auth, async (req, res) => {
  try {
    const [user, card] = await Promise.all([User.findById(req.user.userId).select('name email phone'), vCard.findOne({ userId: req.user.userId }).select('username personalInfo.name')]);
    let order = card ? await CardOrder.findOne({ user: req.user.userId, card: card._id }).sort({ createdAt: -1 }) : null;
    order = await svc.expireIfDue(order);
    res.json({ order: svc.publicOrder(order), phone: user?.phone || '', email: user?.email || '', hasCard: !!card, username: card?.username || '' });
  } catch (err) {
    fail(res, err, 'Could not load your order.');
  }
});

// POST / { phone? } → create the order + payment link (or return the open one). Saves the phone
// (E.164) to the profile when given; a phone is required for WhatsApp delivery.
router.post('/', auth, cardOrderLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(401).json({ msg: 'Please sign in again.' });
    if (req.body.phone !== undefined) {
      const phone = toE164(req.body.phone);
      if (!phone) return res.status(400).json({ msg: 'Please enter a valid mobile number with country code, e.g. +919812345678.' });
      user.phone = phone;
      await user.save();
    }
    if (!toE164(user.phone)) return res.status(400).json({ msg: 'Add your WhatsApp number to get your card.', code: 'PHONE_REQUIRED' });
    const { order, created } = await svc.getOrCreateOrder(user);
    res.status(created ? 201 : 200).json({ order: svc.publicOrder(order), created });
  } catch (err) {
    fail(res, err, 'Could not create your payment link.');
  }
});

// POST /:id/new-link → fresh 24h link after the old one expired.
router.post('/:id/new-link', auth, cardOrderLimiter, async (req, res) => {
  try {
    const old = await svc.expireIfDue(await ownOrder(req));
    if (old.status === 'PAID') return res.status(400).json({ msg: 'This card is already paid.' });
    const user = await User.findById(req.user.userId);
    const { order } = await svc.getOrCreateOrder(user, { forceNew: true });
    res.status(201).json({ order: svc.publicOrder(order) });
  } catch (err) {
    fail(res, err, 'Could not create a new payment link.');
  }
});

// POST /:id/resend-link → the same (still valid) link again by email + WhatsApp.
router.post('/:id/resend-link', auth, cardOrderLimiter, async (req, res) => {
  try {
    const order = await svc.expireIfDue(await ownOrder(req));
    if (order.status !== 'PENDING_PAYMENT') return res.status(400).json({ msg: 'This link is no longer active.' });
    const user = await User.findById(req.user.userId);
    await svc.sendPaymentLink(order, user);
    res.json({ msg: 'Payment link sent again to your email and WhatsApp.' });
  } catch (err) {
    fail(res, err, 'Could not resend the link.');
  }
});

// POST /:id/check → ask Razorpay now (the payment page sends users back here) and deliver if paid.
router.post('/:id/check', auth, async (req, res) => {
  try {
    const order = await svc.syncWithRazorpay(await ownOrder(req));
    // Sending takes a few seconds: it runs after this reply; the dashboard polls for the result.
    if (order.status === 'PAID' && order.delivery?.status === 'PENDING') background(svc.deliverCard(order._id));
    res.json({ order: svc.publicOrder(order) });
  } catch (err) {
    fail(res, err, 'Could not check the payment.');
  }
});

// POST /:id/resend-card → send the card to WhatsApp + email again.
router.post('/:id/resend-card', auth, cardOrderLimiter, async (req, res) => {
  try {
    const order = await ownOrder(req);
    if (order.status !== 'PAID') return res.status(400).json({ msg: 'The card is sent after payment.' });
    const done = await svc.deliverCard(order._id, { manual: true });
    if (!done) return res.status(409).json({ msg: 'Your card is being sent right now. Please check in a minute.' });
    res.json({ order: svc.publicOrder(done) });
  } catch (err) {
    fail(res, err, 'Could not resend the card.');
  }
});

// Admin actions on orders live in the admin panel API (routes/admin/payments.js).

module.exports = router;
