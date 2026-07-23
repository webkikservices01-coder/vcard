const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const vCard = require('../models/vCard');
const Transaction = require('../models/Transaction');
const SupportTicket = require('../models/SupportTicket');
const Product = require('../models/Product');
const Portfolio = require('../models/Portfolio');
const Testimonial = require('../models/Testimonial');
const Gallery = require('../models/Gallery');
const AiPersona = require('../models/AiPersona');
const AiUsageLog = require('../models/AiUsageLog');

// GET /api/admin/stats — platform overview
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const [
            totalUsers, activeUsers, totalCards, totalTransactions,
            openTickets, totalRevenue, planCounts
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: 'active' }),
            vCard.countDocuments(),
            Transaction.countDocuments({ status: 'completed' }),
            SupportTicket.countDocuments({ status: 'open' }),
            Transaction.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
            User.aggregate([{ $group: { _id: '$plan', count: { $sum: 1 } } }])
        ]);
        const totalViews = await vCard.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]);
        res.json({
            totalUsers,
            activeUsers,
            totalCards,
            totalTransactions,
            openTickets,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalViews: totalViews[0]?.total || 0,
            planCounts
        });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

// GET /api/admin/users — all users with card info
router.get('/users', adminAuth, async (req, res) => {
    try {
        const { search = '', plan = '', status = '', page = 1, limit = 20 } = req.query;
        const filter = {};
        if (search) filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
        if (plan) filter.plan = plan;
        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [users, total] = await Promise.all([
            User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            User.countDocuments(filter)
        ]);

        // Attach card info for each user
        const userIds = users.map(u => u._id);
        const cards = await vCard.find({ userId: { $in: userIds } }).select('userId username viewCount scanCount personalInfo');
        const cardMap = {};
        cards.forEach(c => { cardMap[c.userId.toString()] = c; });

        const result = users.map(u => ({
            ...u.toObject(),
            card: cardMap[u._id.toString()] || null
        }));

        res.json({ users: result, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

// GET /api/admin/users/:id — user detail with full activity
router.get('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const card = await vCard.findOne({ userId: user._id });
        let cardData = {};
        if (card) {
            const [products, portfolio, testimonials, gallery, transactions, tickets] = await Promise.all([
                Product.countDocuments({ vcardId: card._id }),
                Portfolio.countDocuments({ vcardId: card._id }),
                Testimonial.countDocuments({ vcardId: card._id }),
                Gallery.countDocuments({ vcardId: card._id }),
                Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5),
                SupportTicket.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5),
            ]);
            cardData = { card, products, portfolio, testimonials, gallery, transactions, tickets };
        }

        res.json({ user, ...cardData });
    } catch (err) { res.status(500).send('Server Error'); }
});

// PUT /api/admin/users/:id — update user plan / status
router.put('/users/:id', adminAuth, async (req, res) => {
    try {
        const PLAN_LIMITS = { 'Free Trial': 1, 'DIGITAL CARD': 3, 'SMART AI CARD': 7, 'AI AGENT PRO': 7 };
        const { plan, status, cardLimit } = req.body;
        const update = {};
        if (plan !== undefined) {
            update.plan = plan;
            const expiry = new Date();
            expiry.setFullYear(expiry.getFullYear() + 1);
            update.planExpiry = expiry;
            update.cardLimit = PLAN_LIMITS[plan] || 1;
        }
        if (status !== undefined) update.status = status;
        if (cardLimit !== undefined) update.cardLimit = cardLimit;

        const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).select('-password');
        res.json({ msg: 'User updated', user });
    } catch (err) { res.status(500).send('Server Error'); }
});

// DELETE /api/admin/users/:id — delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

// GET /api/admin/transactions — all transactions
router.get('/transactions', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, status = '' } = req.query;
        const filter = status ? { status } : {};
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [txns, total] = await Promise.all([
            Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('userId', 'name email'),
            Transaction.countDocuments(filter)
        ]);
        res.json({ transactions: txns, total, pages: Math.ceil(total / parseInt(limit)) });
    } catch (err) { res.status(500).send('Server Error'); }
});

// GET /api/admin/support — all tickets
router.get('/support', adminAuth, async (req, res) => {
    try {
        const { status = '', page = 1 } = req.query;
        const filter = status ? { status } : {};
        const skip = (parseInt(page) - 1) * 20;
        const [tickets, total] = await Promise.all([
            SupportTicket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(20).populate('userId', 'name email'),
            SupportTicket.countDocuments(filter)
        ]);
        res.json({ tickets, total, pages: Math.ceil(total / 20) });
    } catch (err) { res.status(500).send('Server Error'); }
});

// PUT /api/admin/support/:id — update ticket status
router.put('/support/:id', adminAuth, async (req, res) => {
    try {
        const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status } }, { new: true });
        res.json(ticket);
    } catch (err) { res.status(500).send('Server Error'); }
});

// GET /api/admin/cards — top cards by views
router.get('/cards', adminAuth, async (req, res) => {
    try {
        const cards = await vCard.find().sort({ viewCount: -1 }).limit(20).populate('userId', 'name email plan');
        res.json(cards);
    } catch (err) { res.status(500).send('Server Error'); }
});

// GET /api/admin/ai-usage — summary + recent rows
router.get('/ai-usage', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [logs, total, totals] = await Promise.all([
            AiUsageLog.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
                .populate('userId', 'name email').populate('vcardId', 'username'),
            AiUsageLog.countDocuments(),
            AiUsageLog.aggregate([{ $group: {
                _id: null,
                inputTokens: { $sum: '$inputTokens' },
                outputTokens: { $sum: '$outputTokens' },
                costUsd: { $sum: '$costUsd' },
            } }]),
        ]);
        res.json({
            logs, total, pages: Math.ceil(total / parseInt(limit)),
            summary: totals[0] || { inputTokens: 0, outputTokens: 0, costUsd: 0 },
        });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

// GET /api/admin/ai-usage/export — download all usage rows as an .xlsx file
router.get('/ai-usage/export', adminAuth, async (req, res) => {
    try {
        const logs = await AiUsageLog.find().sort({ createdAt: -1 })
            .populate('userId', 'name email').populate('vcardId', 'username');

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('AI Usage');
        sheet.columns = [
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Route', key: 'route', width: 14 },
            { header: 'User', key: 'user', width: 26 },
            { header: 'vCard', key: 'vcard', width: 18 },
            { header: 'Model', key: 'model', width: 20 },
            { header: 'Input Tokens', key: 'inputTokens', width: 16 },
            { header: 'Output Tokens', key: 'outputTokens', width: 16 },
            { header: 'Cost (USD)', key: 'costUsd', width: 14 },
        ];
        sheet.getRow(1).font = { bold: true };

        let totalInput = 0, totalOutput = 0, totalCost = 0;
        for (const log of logs) {
            totalInput += log.inputTokens;
            totalOutput += log.outputTokens;
            totalCost += log.costUsd;
            sheet.addRow({
                date: log.createdAt.toISOString(),
                route: log.route,
                user: log.userId ? `${log.userId.name} (${log.userId.email})` : '—',
                vcard: log.vcardId?.username || '—',
                model: log.model,
                inputTokens: log.inputTokens,
                outputTokens: log.outputTokens,
                costUsd: Number(log.costUsd.toFixed(6)),
            });
        }

        sheet.addRow({});
        const totalsRow = sheet.addRow({
            date: 'TOTAL', inputTokens: totalInput, outputTokens: totalOutput, costUsd: Number(totalCost.toFixed(6)),
        });
        totalsRow.font = { bold: true };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="ai-usage-${new Date().toISOString().slice(0, 10)}.xlsx"`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

module.exports = router;
