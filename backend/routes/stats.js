const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const vCard = require('../models/vCard');
const Product = require('../models/Product');
const Testimonial = require('../models/Testimonial');
const { activePlan, isLifetime, hasPaidAi, isPaid, FREE_AI_CHATS, FREE_THEME, limitsFor, allowedThemes } = require('../constants/plans');
const { trialState, nudge } = require('../services/trial');
const background = require('../utils/background');

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        const card = await vCard.findOne({ userId: req.user.userId });

        let stats = {
            // After planExpiry the user is back on the free plan.
            currentPlan: activePlan(user) || 'Free Trial',
            planExpiry: user.planExpiry || null,
            remainingDays: null,
            vcardCount: card ? 1 : 0,
            productCount: 0,
            testimonialCount: 0,
            viewCount: card ? card.viewCount || 0 : 0,
            scanCount: card ? card.scanCount || 0 : 0,
            cardSlug: card?.username || null,
            cardId: card?._id || null,
            cardProfilePic: card?.personalInfo?.profilePic || null,
            cardName: card?.personalInfo?.name || null,
            cardDesignation: card?.personalInfo?.designation || null,
            user: {
                name: user.name,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                plan: activePlan(user),
                status: user.status,
                isAdmin: user.isAdmin || false,
                cardLimit: limitsFor(user)?.cards || user.cardLimit || 1
            }
        };

        stats.lifetime = isLifetime(user);
        // Free plan limits, for the dashboard's upgrade prompts.
        stats.paid = isPaid(user);
        stats.freeTheme = FREE_THEME;
        // Card templates this plan unlocks (Digital Card 1, Smart AI Card 3, AI Agent Pro 10).
        stats.allowedThemes = allowedThemes(user);
        // Paid plan: AI chats used this month against the plan's limit (Infinity = unlimited).
        const quota = await require('./ai').monthlyChats(user);
        if (quota) stats.aiQuota = { limit: Number.isFinite(quota.limit) ? quota.limit : null, used: quota.used, left: Number.isFinite(quota.limit) ? Math.max(0, quota.limit - quota.used) : null, plan: activePlan(user) };
        stats.aiTrial = quota || hasPaidAi(user)
            ? { paid: true }
            : { paid: false, limit: FREE_AI_CHATS, used: Math.min(FREE_AI_CHATS, card?.aiTrialUsed || 0), left: Math.max(0, FREE_AI_CHATS - (card?.aiTrialUsed || 0)) };
        // 24-hour trial: countdown, or "paused" with the upgrade link on its way.
        stats.trial = await trialState(user);
        background(nudge(user, stats.trial));
        if (stats.lifetime) stats.planExpiry = null;
        else if (user.planExpiry) {
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
