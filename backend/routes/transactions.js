const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { generateInvoice } = require('../utils/generateInvoice');
const refrens = require('../utils/refrens');

const makeInvoiceNumber = (txn) => `INV-${new Date(txn.createdAt).getFullYear()}-${String(txn._id).slice(-6).toUpperCase()}`;

// Marks a transaction paid, activates the plan, and (best-effort) creates a Refrens invoice.
// Refrens failures never block payment confirmation — local PDF invoice remains the fallback.
async function markCompleted(txn) {
    txn.status = 'completed';
    txn.invoiceNumber = makeInvoiceNumber(txn);
    await txn.save();

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + (txn.expireDays || 365));
    await User.findByIdAndUpdate(txn.userId, { $set: { plan: txn.plan, planExpiry: expiry } });

    if (refrens.isConfigured()) {
        try {
            const user = await User.findById(txn.userId);
            const invoice = await refrens.createInvoice(txn, user);
            txn.refrensInvoiceId = invoice.id;
            txn.refrensPdfUrl = invoice.pdfUrl;
            await txn.save();
        } catch (err) {
            console.error('Refrens invoice creation failed:', err.message);
        }
    }
}

const CF_ENV = process.env.CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
const CF_BASE_URL = CF_ENV === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
const CF_API_VERSION = '2025-01-01';

const cfHeaders = () => ({
    'Content-Type': 'application/json',
    'x-api-version': CF_API_VERSION,
    'x-client-id': process.env.CASHFREE_CLIENT_ID,
    'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
});

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

// Cashfree: create order
router.post('/create-order', auth, async (req, res) => {
    try {
        const { amount, plan, expireDays } = req.body;
        const user = await User.findById(req.user.userId);

        const txn = new Transaction({ userId: req.user.userId, plan, amount, expireDays: expireDays || 365, status: 'pending' });
        await txn.save();

        const orderId = `order_${txn._id}`;
        const cfRes = await fetch(`${CF_BASE_URL}/orders`, {
            method: 'POST',
            headers: cfHeaders(),
            body: JSON.stringify({
                order_id: orderId,
                order_amount: amount,
                order_currency: 'INR',
                customer_details: {
                    customer_id: String(user._id),
                    customer_name: user.name || 'Customer',
                    customer_email: user.email || 'customer@mycardlink.site',
                    customer_phone: user.phone || '9999999999',
                },
                order_meta: {
                    return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/plans?order_id={order_id}`,
                },
            }),
        });
        const data = await cfRes.json();
        if (!cfRes.ok) {
            await Transaction.findByIdAndUpdate(txn._id, { $set: { status: 'failed' } });
            return res.status(400).json({ msg: data.message || 'Failed to create payment order' });
        }

        txn.cfOrderId = data.order_id;
        txn.paymentSessionId = data.payment_session_id;
        await txn.save();

        res.json({ orderId: data.order_id, paymentSessionId: data.payment_session_id, txnId: txn._id });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

// Cashfree: verify payment (server-to-server order status check)
router.post('/verify', auth, async (req, res) => {
    try {
        const { orderId } = req.body;
        const txn = await Transaction.findOne({ cfOrderId: orderId, userId: req.user.userId });
        if (!txn) return res.status(404).json({ msg: 'Transaction not found' });

        const cfRes = await fetch(`${CF_BASE_URL}/orders/${orderId}`, {
            method: 'GET',
            headers: cfHeaders(),
        });
        const data = await cfRes.json();
        if (!cfRes.ok) return res.status(400).json({ msg: data.message || 'Could not verify payment' });

        if (data.order_status === 'PAID') {
            if (txn.status !== 'completed') await markCompleted(txn);
            return res.json({ msg: 'Payment verified and plan activated!', status: 'PAID' });
        }

        if (['EXPIRED', 'TERMINATED'].includes(data.order_status)) {
            txn.status = 'failed';
            await txn.save();
        }
        res.json({ msg: 'Payment not completed yet', status: data.order_status });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

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

        if (expected !== signature) return res.status(400).send('Invalid signature');

        const event = req.body;
        const orderId = event?.data?.order?.order_id;
        const orderStatus = event?.data?.order?.order_status || event?.data?.payment?.payment_status;

        if (orderId && (orderStatus === 'PAID' || event?.data?.payment?.payment_status === 'SUCCESS')) {
            const txn = await Transaction.findOne({ cfOrderId: orderId });
            if (txn && txn.status !== 'completed') await markCompleted(txn);
        }
        res.status(200).send('ok');
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

module.exports = router;
