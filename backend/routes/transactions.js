const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

router.get('/', auth, async (req, res) => {
    try {
        const txns = await Transaction.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(txns);
    } catch (err) { res.status(500).send('Server Error'); }
});

// Razorpay: create order
router.post('/create-order', auth, async (req, res) => {
    try {
        const Razorpay = require('razorpay');
        const { amount, plan } = req.body;
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        const order = await instance.orders.create({
            amount: amount * 100,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        });
        const txn = new Transaction({ userId: req.user.userId, plan, amount, razorpayOrderId: order.id, status: 'pending' });
        await txn.save();
        res.json({ orderId: order.id, amount, key: process.env.RAZORPAY_KEY_ID, txnId: txn._id });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

// Razorpay: verify payment
router.post('/verify', auth, async (req, res) => {
    try {
        const crypto = require('crypto');
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, txnId, plan, expireDays } = req.body;
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
        if (expectedSignature !== razorpay_signature) {
            await Transaction.findByIdAndUpdate(txnId, { $set: { status: 'failed' } });
            return res.status(400).json({ msg: 'Payment verification failed' });
        }
        await Transaction.findByIdAndUpdate(txnId, { $set: { status: 'completed', razorpayPaymentId: razorpay_payment_id } });
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + (expireDays || 365));
        await User.findByIdAndUpdate(req.user.userId, { $set: { plan, planExpiry: expiry } });
        res.json({ msg: 'Payment verified and plan activated!' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
