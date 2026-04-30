const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const VcardSettings = require('../models/VcardSettings');
const vCard = require('../models/vCard');
const User = require('../models/User');

const getCardId = async (userId) => {
    const card = await vCard.findOne({ userId });
    return card ? card._id : null;
};

// GET settings
router.get('/', auth, async (req, res) => {
    try {
        const vcardId = await getCardId(req.user.userId);
        if (!vcardId) return res.json({});
        const settings = await VcardSettings.findOne({ vcardId });
        res.json(settings || {});
    } catch (err) { res.status(500).send('Server Error'); }
});

// POST/UPDATE settings
router.post('/', auth, async (req, res) => {
    try {
        const vcardId = await getCardId(req.user.userId);
        if (!vcardId) return res.status(404).json({ msg: 'vCard not found.' });
        const settings = await VcardSettings.findOneAndUpdate(
            { vcardId },
            { $set: { ...req.body, vcardId } },
            { new: true, upsert: true }
        );
        res.json(settings);
    } catch (err) { res.status(500).send('Server Error'); }
});

// GET user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (err) { res.status(500).send('Server Error'); }
});

// PUT update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;
        const name = `${firstName} ${lastName}`.trim();
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: { firstName, lastName, name, phone } },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) { res.status(500).send('Server Error'); }
});

// POST update password
router.post('/change-password', auth, async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const { password } = req.body;
        if (!password || password.length < 6) return res.status(400).json({ msg: 'Password must be at least 6 characters' });
        const hashed = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(req.user.userId, { $set: { password: hashed } });
        res.json({ msg: 'Password updated' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
