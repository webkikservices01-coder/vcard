// /api/cron/card-orders — scheduled job: expire 24h links, send 2-hour reminders, finish stuck
// deliveries. Call every 5–10 minutes with "Authorization: Bearer <CRON_SECRET>" (Vercel Cron sends
// it automatically) or ?key=<CRON_SECRET> (for external schedulers like cron-job.org).
const express = require('express');
const { runJobs } = require('../services/cardOrders');
const { logEvent } = require('../utils/logger');

const router = express.Router();

router.get('/card-orders', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  const given = (req.header('authorization') || '').replace(/^Bearer\s+/i, '') || req.query.key;
  if (!secret || given !== secret) return res.status(401).json({ msg: 'Unauthorized' });
  try {
    const result = await runJobs();
    if (result.expired || result.reminders || result.deliveries) logEvent(req, 'cron.card_orders', `Expired ${result.expired}, reminders ${result.reminders}, deliveries ${result.deliveries}`);
    res.json({ ok: true, ...result });
  } catch (err) {
    logEvent(req, 'cron.card_orders.error', err.message, { level: 'error' });
    res.status(500).json({ msg: 'Job failed' });
  }
});

module.exports = router;
