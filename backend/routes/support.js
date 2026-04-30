const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SupportTicket = require('../models/SupportTicket');

router.get('/', auth, async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
    try {
        const { subject, category, message } = req.body;
        const ticket = new SupportTicket({ userId: req.user.userId, subject, category, message });
        await ticket.save();
        res.json(ticket);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id/close', auth, async (req, res) => {
    try {
        const ticket = await SupportTicket.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { $set: { status: 'closed' } },
            { new: true }
        );
        res.json(ticket);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await SupportTicket.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        res.json({ msg: 'Deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
