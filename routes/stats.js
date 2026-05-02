const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const vCard = require('../models/vCard');
const Product = require('../models/Product');
const Testimonial = require('../models/Testimonial');

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        const card = await vCard.findOne({ userId: req.user.userId });

        let stats = {
            currentPlan: user.plan || 'Free Trial',
            planExpiry: user.planExpiry || null,
            remainingDays: null,
            vcardCount: card ? 1 : 0,
            productCount: 0,
            testimonialCount: 0,
            viewCount: card ? card.viewCount || 0 : 0,
            scanCount: card ? card.scanCount || 0 : 0,
            cardSlug: card?.username || null,
            cardProfilePic: card?.personalInfo?.profilePic || null,
            cardName: card?.personalInfo?.name || null,
            cardDesignation: card?.personalInfo?.designation || null,
            user: {
                name: user.name,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                plan: user.plan,
                status: user.status,
                isAdmin: user.isAdmin || false,
                cardLimit: user.cardLimit || 1
            }
        };

        if (user.planExpiry) {
            const diff = new Date(user.planExpiry) - new Date();
            stats.remainingDays = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        }

        if (card) {
            stats.productCount = await Product.countDocuments({ vcardId: card._id });
            stats.testimonialCount = await Testimonial.countDocuments({ vcardId: card._id });
        }

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
