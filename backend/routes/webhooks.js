// /api/webhooks — Razorpay payments and WhatsApp message statuses. Both check signatures and
// are idempotent (a repeated event changes nothing and sends nothing twice).
const express = require('express');
const CardOrder = require('../models/CardOrder');
const Notification = require('../models/Notification');
const WebhookEvent = require('../models/WebhookEvent');
const { verifyRazorpaySignature } = require('../utils/razorpay');
const { verifyWhatsAppSignature } = require('../utils/whatsapp');
const svc = require('../services/cardOrders');
const background = require('../utils/background');
const { logEvent } = require('../utils/logger');

const router = express.Router();

// ─── Razorpay: payment_link.paid / payment.captured / payment_link.expired|cancelled ───
router.post('/razorpay', async (req, res) => {
  if (!verifyRazorpaySignature(req.rawBody, req.header('x-razorpay-signature'))) {
    logEvent(req, 'webhook.razorpay.bad_signature', 'Razorpay webhook with an invalid signature', { level: 'warn' });
    return res.status(400).json({ msg: 'Invalid signature' });
  }
  try {
    const eventId = req.header('x-razorpay-event-id') || '';
    if (!(await WebhookEvent.firstTime('razorpay', eventId))) return res.json({ ok: true, duplicate: true });

    const { event, payload = {} } = req.body || {};
    const link = payload.payment_link?.entity;
    const payment = payload.payment?.entity;
    // Our order id is the link's reference_id, and also in the notes of link and payment.
    const orderId = link?.reference_id || link?.notes?.order_id || payment?.notes?.order_id;
    const order =
      (orderId && /^[a-f\d]{24}$/i.test(orderId) && (await CardOrder.findById(orderId))) ||
      (link?.id && (await CardOrder.findOne({ paymentLinkId: link.id })));
    if (!order) return res.json({ ok: true, ignored: 'no matching card order' });

    if (event === 'payment_link.paid' || (event === 'payment.captured' && payment?.status === 'captured')) {
      const paid = await svc.markPaid(order._id, payment?.id);
      // First time only: deliver after answering Razorpay quickly.
      if (paid) background(svc.deliverCard(paid._id));
    } else if ((event === 'payment_link.expired' || event === 'payment_link.cancelled') && order.status === 'PENDING_PAYMENT') {
      order.status = 'EXPIRED';
      await order.save();
    }
    res.json({ ok: true });
  } catch (err) {
    logEvent(req, 'webhook.razorpay.error', err.message, { level: 'error' });
    res.status(500).json({ msg: 'Webhook error' }); // Razorpay retries
  }
});

// ─── WhatsApp: verification handshake ───
router.get('/whatsapp', (req, res) => {
  const ok = req.query['hub.mode'] === 'subscribe' && process.env.WHATSAPP_VERIFY_TOKEN && req.query['hub.verify_token'] === process.env.WHATSAPP_VERIFY_TOKEN;
  if (!ok) return res.sendStatus(403);
  res.status(200).send(String(req.query['hub.challenge'] || ''));
});

// ─── WhatsApp: message statuses (sent → delivered → read, or failed) ───
const RANK = { queued: 0, sent: 1, delivered: 2, read: 3, failed: 4 };
router.post('/whatsapp', async (req, res) => {
  if (!verifyWhatsAppSignature(req.rawBody, req.header('x-hub-signature-256'))) {
    logEvent(req, 'webhook.whatsapp.bad_signature', 'WhatsApp webhook with an invalid signature', { level: 'warn' });
    return res.sendStatus(401);
  }
  try {
    const statuses = (req.body?.entry || []).flatMap((e) => (e.changes || []).flatMap((c) => c.value?.statuses || []));
    for (const s of statuses) {
      if (!(await WebhookEvent.firstTime('whatsapp', `${s.id}:${s.status}`))) continue;
      const n = await Notification.findOne({ providerMessageId: s.id });
      if (!n) continue;
      // Statuses can arrive out of order: never step back (read → delivered), except to failed.
      if (s.status === 'failed' || (RANK[s.status] ?? 0) > (RANK[n.status] ?? 0)) {
        n.status = s.status;
        if (s.status === 'failed') n.error = (s.errors || []).map((e) => `${e.code}: ${e.title || e.message}`).join('; ').slice(0, 500);
        await n.save();
      }
      if (n.type === 'card_delivery' && n.order) {
        const set =
          s.status === 'delivered' ? { 'delivery.status': 'DELIVERED', 'delivery.deliveredAt': new Date() }
          : s.status === 'read' ? { 'delivery.status': 'READ' }
          : s.status === 'failed' ? { 'delivery.status': 'FAILED', 'delivery.lastError': n.error || 'WhatsApp could not deliver the message' }
          : null;
        if (set) await CardOrder.updateOne({ _id: n.order, status: 'PAID' }, { $set: set });
        if (s.status === 'failed') logEvent(req, 'card_order.whatsapp.undelivered', `WhatsApp did not deliver the card: ${n.error}`, { level: 'error', meta: { orderId: String(n.order) } });
      }
    }
    res.sendStatus(200);
  } catch (err) {
    logEvent(req, 'webhook.whatsapp.error', err.message, { level: 'error' });
    res.sendStatus(500);
  }
});

module.exports = router;
