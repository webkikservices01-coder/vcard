// /api/upgrade/<token>: the no-login upgrade page sent by email when a free trial ends
// (services/trial.js). The token only lets someone see the account's name and pay for its plan.
const express = require('express');
const { userForToken, trialState } = require('../services/trial');
const { startOrder, checkOrder } = require('./transactions');
const { CATALOG, priceFor, activePlan } = require('../constants/plans');
const { upgradeLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(upgradeLimiter);

const plansList = () =>
  Object.keys(CATALOG).map((id) => ({ id, name: CATALOG[id].name, monthly: priceFor(id, 'monthly'), yearly: priceFor(id, 'yearly') }));

router.get('/:token', async (req, res) => {
  try {
    const user = await userForToken(req.params.token);
    if (!user) return res.status(404).json({ msg: 'This link is no longer valid. Open Plans in your dashboard to upgrade.' });
    const trial = await trialState(user);
    res.set('Cache-Control', 'no-store');
    res.json({ name: user.name, email: user.email, plan: activePlan(user), paused: !!trial.paused, plans: plansList() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/:token/order', async (req, res) => {
  try {
    const user = await userForToken(req.params.token);
    if (!user) return res.status(404).json({ msg: 'This link is no longer valid.' });
    const out = await startOrder(req, user, {
      planId: req.body.planId,
      billing: req.body.billing,
      returnPath: `/upgrade/${encodeURIComponent(req.params.token)}`,
      source: 'upgrade-page',
    });
    res.status(out.status).json(out.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/:token/verify', async (req, res) => {
  try {
    const user = await userForToken(req.params.token);
    if (!user) return res.status(404).json({ msg: 'This link is no longer valid.' });
    const out = await checkOrder(user._id, req.body.orderId);
    res.status(out.status).json(out.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
