const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Testimonial = require('../models/Testimonial');
const vCard = require('../models/vCard');

const { upload, fileUrl } = require('../utils/upload');
const { previewTestimonials } = require('../services/websiteImport');
const rateLimit = require('express-rate-limit');
const importLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
    keyGenerator: (req) => `user:${req.user.userId}`,
    standardHeaders: true,
    legacyHeaders: false,
    message: { msg: 'Too many imports. Please wait a few minutes and try again.' },
});


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

router.get('/', auth, async (req, res) => {
    try {
        const vcardId = await getOrCreateCardId(req.user.userId);
        res.json(await Testimonial.find({ vcardId }));
    } catch (err) { 
        console.error('Get Testimonials Error:', err);
        res.status(500).send('Server Error'); 
    }
});

router.post('/', [auth, upload.single('photo')], async (req, res) => {
    try {
        const vcardId = await getOrCreateCardId(req.user.userId);
        const { name, review, rating } = req.body;
        const photo = req.file ? fileUrl(req.file) : '';
        
        const item = new Testimonial({ 
            vcardId, 
            name, 
            review, 
            rating: Number(rating) || 5, 
            photo 
        });
        
        await item.save();
        res.json(item);
    } catch (err) { 
        console.error('Testimonial Save Error:', err);
        res.status(500).json({ msg: 'Server Error saving testimonial', error: err.message }); 
    }
});

// "Reviews from my website": AI picks out the client reviews published there (word for word).
router.post('/import/preview', auth, importLimiter, async (req, res) => {
    try {
        const anthropic = process.env.ANTHROPIC_API_KEY ? new (require('@anthropic-ai/sdk'))({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
        res.json(await previewTestimonials(req.body?.url, anthropic, process.env.IMPORT_MODEL || 'claude-haiku-4-5-20251001'));
    } catch (err) {
        if (!err.status) console.error('Testimonial import error:', err.message);
        res.status(err.status || 500).json({ msg: err.status ? err.message : "Couldn't read that website. Please try again." });
    }
});

router.post('/import', auth, async (req, res) => {
    try {
        const items = (Array.isArray(req.body?.items) ? req.body.items : [])
            .map((r) => ({ name: String(r?.name || '').trim().slice(0, 80) || 'Client', review: String(r?.review || '').trim().slice(0, 600), rating: Math.min(5, Math.max(1, Math.round(Number(r?.rating) || 5))) }))
            .filter((r) => r.review.length >= 10)
            .slice(0, 20);
        if (!items.length) return res.status(400).json({ msg: 'Choose at least one review.' });
        const vcardId = await getOrCreateCardId(req.user.userId);
        const have = new Set((await Testimonial.find({ vcardId }).select('review').lean()).map((t) => t.review.trim().toLowerCase()));
        const fresh = items.filter((r) => !have.has(r.review.toLowerCase()));
        await Testimonial.insertMany(fresh.map((r) => ({ ...r, vcardId })));
        res.json({ added: fresh.length, skipped: items.length - fresh.length });
    } catch (err) {
        console.error('Testimonial import save error:', err);
        res.status(500).json({ msg: 'Could not add the reviews. Please try again.' });
    }
});

router.put('/:id', [auth, upload.single('photo')], async (req, res) => {
    try {
        const { name, review, rating } = req.body;
        const update = { name, review, rating: Number(rating) || 5 };
        
        if (req.file) {
            update.photo = fileUrl(req.file);
        }
        
        const vcardId = await getOrCreateCardId(req.user.userId);
        const item = await Testimonial.findOneAndUpdate({ _id: req.params.id, vcardId }, { $set: update }, { new: true });
        if (!item) return res.status(404).json({ msg: 'Not found' });
        res.json(item);
    } catch (err) { 
        console.error('Testimonial Update Error:', err);
        res.status(500).send('Server Error'); 
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const vcardId = await getOrCreateCardId(req.user.userId);
        const gone = await Testimonial.findOneAndDelete({ _id: req.params.id, vcardId });
        if (!gone) return res.status(404).json({ msg: 'Not found' });
        res.json({ msg: 'Deleted' });
    } catch (err) { 
        console.error('Testimonial Delete Error:', err);
        res.status(500).send('Server Error'); 
    }
});

module.exports = router;