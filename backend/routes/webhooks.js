// /api/webhooks — WhatsApp message statuses (card deliveries). Checks the signature and is
// idempotent. Card order payments are Cashfree links (webhook: /api/transactions/webhook).
const express = require('express');
const CardOrder = require('../models/CardOrder');
const Notification = require('../models/Notification');
const WebhookEvent = require('../models/WebhookEvent');
const { verifyWhatsAppSignature } = require('../utils/whatsapp');
const { logEvent } = require('../utils/logger');

const router = express.Router();

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
