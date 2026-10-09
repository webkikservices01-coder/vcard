const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { generateInvoice } = require('../utils/generateInvoice');
const { priceFor } = require('../constants/plans');
const { logEvent } = require('../utils/logger');
const { markCompleted } = require('../services/payments');
const cashfree = require('../services/cashfree');

// Where Cashfree sends the buyer back: the site they paid from, if it's one of ours.
const RETURN_ORIGINS = /^https:\/\/(www\.)?aicardly\.com$|^http:\/\/localhost:\d+$/;
const returnBase = (req) => {
    const origin = req.get('origin') || '';
    if (RETURN_ORIGINS.test(origin)) return origin;
    return (process.env.SITE_URL || 'https://aicardly.com').replace(/\/$/, '');
};

router.get('/', auth, async (req, res) => {
    try {
        const txns = await Transaction.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(txns);
    } catch (err) { res.status(500).send('Server Error'); }
});

// Download invoice PDF for a completed transaction
router.get('/:id/invoice', auth, async (req, res) => {
    try {
        const txn = await Transaction.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!txn) return res.status(404).json({ msg: 'Transaction not found' });
        if (txn.status !== 'completed') return res.status(400).json({ msg: 'Invoice available only for completed payments' });

        if (txn.refrensPdfUrl) return res.redirect(txn.refrensPdfUrl);

        const user = await User.findById(req.user.userId);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${txn.invoiceNumber || txn._id}.pdf"`);
        generateInvoice(txn, user, res);
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

// A checkout order for a plan. Shared by the plans page and the no-login upgrade page.
async function startOrder(req, user, { planId, billing, returnPath, source }) {
    // The price comes from the server's catalog, never from the request.
    const price = priceFor(planId, billing);
    if (!price) return { status: 400, body: { msg: 'Please choose a valid plan.' } };
    const { name: plan, amount, base, gst, days: expireDays, billingType } = price;

    const txn = await Transaction.create({ userId: user._id, plan, amount, base, gst, billingType, expireDays, status: 'pending', source });
    try {
        const data = await cashfree.createOrder({
            orderId: `order_${txn._id}`,
            amount,
            user,
            returnUrl: `${returnBase(req)}${returnPath}${returnPath.includes('?') ? '&' : '?'}order_id={order_id}`,
        });
        txn.cfOrderId = data.order_id;
        txn.paymentSessionId = data.payment_session_id;
        await txn.save();
        logEvent(req, 'payment.order', `Order for ${plan} (${billingType}) ₹${base} + GST ₹${gst} = ₹${amount}`, { email: user.email, meta: { orderId: data.order_id, source } });
        return { status: 200, body: { orderId: data.order_id, paymentSessionId: data.payment_session_id, txnId: txn._id } };
    } catch (err) {
        logEvent(req, 'payment.order.failed', err.message, { level: 'error', meta: { plan, amount, source } });
        await Transaction.findByIdAndUpdate(txn._id, { $set: { status: 'failed' } });
        return { status: 400, body: { msg: err.message || 'Failed to create payment order' } };
    }
}

// Server-to-server status check of an order that belongs to userId; activates the plan when paid.
async function checkOrder(userId, orderId) {
    const txn = await Transaction.findOne({ cfOrderId: orderId, userId });
    if (!txn) return { status: 404, body: { msg: 'Transaction not found' } };
    let data;
    try {
        data = await cashfree.getOrder(orderId);
    } catch (err) {
        return { status: 400, body: { msg: err.message || 'Could not verify payment' } };
    }
    if (data.order_status === 'PAID') {
        await markCompleted(txn);
        return { status: 200, body: { msg: 'Payment verified and plan activated!', status: 'PAID' } };
    }
    if (['EXPIRED', 'TERMINATED'].includes(data.order_status) && txn.status === 'pending') {
        txn.status = 'failed';
        await txn.save();
    }
    return { status: 200, body: { msg: 'Payment not completed yet', status: data.order_status } };
}

// Cashfree: create order
router.post('/create-order', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const out = await startOrder(req, user, { planId: req.body.planId, billing: req.body.billing, returnPath: '/dashboard/plans', source: 'plans' });
        res.status(out.status).json(out.body);
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

// Cashfree: verify payment (server-to-server order status check)
router.post('/verify', auth, async (req, res) => {
    try {
        const out = await checkOrder(req.user.userId, req.body.orderId);
        res.status(out.status).json(out.body);
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

// A paid payment link (the SMS one): confirmed with Cashfree before the plan is activated.
async function settleLink(linkId) {
    const txn = await Transaction.findOne({ cfLinkId: linkId });
    if (!txn || txn.status === 'completed') return false;
    const link = await cashfree.getLink(linkId);
    if (link.link_status !== 'PAID') return false;
    return markCompleted(txn);
}

// Cashfree: webhook (server-to-server, catches payments even if the user closes the tab)
router.post('/webhook', async (req, res) => {
    try {
        const timestamp = req.headers['x-webhook-timestamp'];
        const signature = req.headers['x-webhook-signature'];
        const rawBody = req.rawBody || JSON.stringify(req.body);

        const expected = crypto
            .createHmac('sha256', process.env.CASHFREE_CLIENT_SECRET)
            .update(timestamp + rawBody)
            .digest('base64');

        if (expected !== signature) {
            logEvent(req, 'payment.webhook.invalid', 'Cashfree webhook with a bad signature', { level: 'warn' });
            return res.status(400).send('Invalid signature');
        }

        const event = req.body;
        // Payment links report as PAYMENT_LINK_EVENT with data.link_id.
        const linkId = event?.data?.link_id;
        if (linkId) {
            if (event?.data?.link_status === 'PAID') await settleLink(linkId);
            return res.status(200).send('ok');
        }

        const orderId = event?.data?.order?.order_id;
        const orderStatus = event?.data?.order?.order_status || event?.data?.payment?.payment_status;
        if (orderId && (orderStatus === 'PAID' || event?.data?.payment?.payment_status === 'SUCCESS')) {
            const txn = await Transaction.findOne({ cfOrderId: orderId });
            if (txn) await markCompleted(txn);
            // An order made by a payment link carries the link's id in its tags.
            else if (event?.data?.order?.order_tags?.link_id) await settleLink(event.data.order.order_tags.link_id);
        }
        res.status(200).send('ok');
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

module.exports = router;
module.exports.startOrder = startOrder;
module.exports.checkOrder = checkOrder;
module.exports.settleLink = settleLink;
