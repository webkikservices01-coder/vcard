const express = require('express');
const { fillShotsLater } = require('../utils/siteShot');
const router = express.Router();

const auth = require('../middleware/auth');
const Product = require('../models/Product');
const { webLink } = require('../models/Product');
const vCard = require('../models/vCard');

const rateLimit = require('express-rate-limit');
const { upload, fileUrl } = require('../utils/upload');
const { previewServices } = require('../services/serviceImport');

// Helper: Get or Automatically Create vCard if missing so product saving never fails
const getOrCreateCardId = async (userId) => {
    let card = await vCard.findOne({ userId });
    if (!card) {
        card = new vCard({
            userId,
            username: `user_${userId.toString().slice(-6)}`,
            personalInfo: { name: 'My Profile', designation: 'Professional' }
        });
        await card.save();
    }
    return card._id;
};

// ?kind=service → the Services tab; ?kind=product → the Products tab (older items have no kind);
// no kind → everything.
const kindFilter = (kind) => {
    if (kind === 'service') return { kind: 'service' };
    if (kind === 'product') return { kind: { $ne: 'service' } };
    return {};
};

// Title is required; a service needs a valid website link (it opens when tapped on the card).
function checkItem({ kind, title, link }) {
    if (!String(title || '').trim()) return 'Please add a title.';
    if (kind === 'service' && !webLink(link)) return 'Please add your website link, e.g. https://yourwebsite.com';
    if (link && !webLink(link)) return 'Please enter a valid web link starting with https://';
    return null;
}

// ─── Import services from the owner's website ────────────────────────────────
// Each preview reads their site (and up to 20 service pages), so it is rate limited per user.
const importLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
    keyGenerator: (req) => `user:${req.user.userId}`,
    standardHeaders: true,
    legacyHeaders: false,
    message: { msg: 'Too many imports. Please wait a few minutes and try again.' },
});

// POST /import/preview { url } → { source, services: [{ title, description, link, image }] }
router.post('/import/preview', auth, importLimiter, async (req, res) => {
    try {
        res.json(await previewServices(String(req.body?.url || '').slice(0, 500)));
    } catch (err) {
        res.status(err.status || 500).json({ msg: err.status ? err.message : "Couldn't read that website. Please try again." });
    }
});

// POST /import { items: [{ title, description, link, image }] } → adds the chosen services
// (one already on the card, same link and name, is skipped).
router.post('/import', auth, async (req, res) => {
    try {
        const items = Array.isArray(req.body?.items) ? req.body.items.slice(0, 20) : [];
        if (!items.length) return res.status(400).json({ msg: 'Choose at least one service.' });
        const vcardId = await getOrCreateCardId(req.user.userId);
        // Same link and same name = already on the card (two services may share one page).
        const keyOf = (link, title) => `${link}|${String(title).trim().toLowerCase()}`;
        const existing = new Set((await Product.find({ vcardId }).select('link title').lean()).filter((p) => p.link).map((p) => keyOf(p.link, p.title)));
        let order = await Product.countDocuments({ vcardId });
        let added = 0;
        let skipped = 0;
        for (const it of items) {
            const title = String(it?.title || '').trim().slice(0, 120);
            const link = webLink(it?.link);
            if (!title || !link || existing.has(keyOf(link, title))) {
                skipped++;
                continue;
            }
            await Product.create({
                vcardId,
                kind: 'service',
                title,
                description: String(it.description || '').trim().slice(0, 400),
                coverImage: webLink(it.image),
                link,
                order: order++,
            });
            existing.add(keyOf(link, title));
            added++;
        }
        res.json({ added, skipped });
        fillShotsLater(Product, await Product.find({ vcardId, coverImage: '' }).lean(), 'link');
    } catch (err) {
        console.error('Service import error:', err);
        res.status(500).json({ msg: 'Could not add the services. Please try again.' });
    }
});

// GET all products / services
router.get('/', auth, async (req, res) => {
    try {
        const vcardId = await getOrCreateCardId(req.user.userId);
        const items = await Product.find({ vcardId, ...kindFilter(req.query.kind) }).sort('order');
        res.json(items);
    } catch (err) {
        console.error('Get Products Error:', err);
        res.status(500).send('Server Error');
    }
});

// POST create product or service
router.post('/', [auth, upload.single('coverImage')], async (req, res) => {
    try {
        const vcardId = await getOrCreateCardId(req.user.userId);

        const { title, description, price, link } = req.body;
        const kind = req.body.kind === 'service' ? 'service' : 'product';
        const problem = checkItem({ kind, title, link });
        if (problem) return res.status(400).json({ msg: problem });
        const coverImage = req.file ? fileUrl(req.file) : '';

        const count = await Product.countDocuments({ vcardId });
        const item = new Product({
            vcardId,
            kind,
            title,
            description,
            price,
            coverImage,
            link,
            order: count
        });

        await item.save();
        res.json(item);
        fillShotsLater(Product, [item], 'link');
    } catch (err) {
        console.error('Product Save Error:', err);
        res.status(500).json({ msg: 'Server Error saving product', error: err.message });
    }
});

// PUT update (only the signed-in user's own items)
router.put('/:id', [auth, upload.single('coverImage')], async (req, res) => {
    try {
        const vcardId = await getOrCreateCardId(req.user.userId);
        const existing = await Product.findOne({ _id: req.params.id, vcardId });
        if (!existing) return res.status(404).json({ msg: 'Not found' });

        const { title, description, price, link } = req.body;
        const problem = checkItem({ kind: existing.kind, title, link });
        if (problem) return res.status(400).json({ msg: problem });
        const update = { title, description, price, link };

        if (req.file) {
            update.coverImage = fileUrl(req.file);
        }

        const item = await Product.findOneAndUpdate({ _id: existing._id, vcardId }, { $set: update }, { new: true });
        res.json(item);
    } catch (err) {
        console.error('Product Update Error:', err);
        res.status(500).send('Server Error');
    }
});

// DELETE (only the signed-in user's own items)
router.delete('/:id', auth, async (req, res) => {
    try {
        const vcardId = await getOrCreateCardId(req.user.userId);
        const result = await Product.deleteOne({ _id: req.params.id, vcardId });
        if (!result.deletedCount) return res.status(404).json({ msg: 'Not found' });
        res.json({ msg: 'Deleted' });
    } catch (err) {
        console.error('Product Delete Error:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
