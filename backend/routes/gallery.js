const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Gallery = require('../models/Gallery');
const vCard = require('../models/vCard');

const { upload, fileUrl } = require('../utils/upload');
const { previewPhotos } = require('../services/websiteImport');
const { storeImage } = require('../utils/siteShot');
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
        res.json(await Gallery.find({ vcardId }).sort('order'));
    } catch (err) { 
        console.error('Get Gallery Error:', err);
        res.status(500).send('Server Error'); 
    }
});

router.post('/', [auth, upload.single('image')], async (req, res) => {
    try {
        const vcardId = await getOrCreateCardId(req.user.userId);
        const { type, url: videoUrl } = req.body;
        const count = await Gallery.countDocuments({ vcardId });
        
        let url = videoUrl || '';
        let thumbnail = '';
        
        if (type === 'image' && req.file) {
            url = fileUrl(req.file);
            thumbnail = fileUrl(req.file);
        }
        
        const item = new Gallery({ vcardId, type: type || 'image', url, thumbnail, order: count });
        await item.save();
        res.json(item);
    } catch (err) { 
        console.error('Gallery Save Error:', err);
        res.status(500).json({ msg: 'Server Error saving gallery item', error: err.message }); 
    }
});

// "Photos from my website": preview, then add the chosen ones (copied to our image storage, so
// they keep working if the website changes).
router.post('/import/preview', auth, importLimiter, async (req, res) => {
    try {
        res.json(await previewPhotos(req.body?.url));
    } catch (err) {
        res.status(err.status || 500).json({ msg: err.status ? err.message : "Couldn't read that website. Please try again." });
    }
});

router.post('/import', auth, async (req, res) => {
    try {
        const urls = [...new Set((Array.isArray(req.body?.urls) ? req.body.urls : []).map(String).filter((u) => /^https?:\/\//i.test(u)))].slice(0, 20);
        if (!urls.length) return res.status(400).json({ msg: 'Choose at least one photo.' });
        const vcardId = await getOrCreateCardId(req.user.userId);
        let order = await Gallery.countDocuments({ vcardId });
        const stored = [];
        const queue = [...urls];
        await Promise.all(Array.from({ length: 4 }, async () => {
            while (queue.length) {
                const u = queue.shift();
                const url = await storeImage(u).catch(() => '');
                if (url) stored.push({ from: u, url });
            }
        }));
        // Keep the order they were chosen in.
        stored.sort((a, b) => urls.indexOf(a.from) - urls.indexOf(b.from));
        const saved = await Gallery.insertMany(stored.map((s) => ({ vcardId, type: 'image', url: s.url, thumbnail: s.url, order: order++ })));
        res.json({ added: saved.length, failed: urls.length - saved.length });
    } catch (err) {
        console.error('Gallery import error:', err);
        res.status(500).json({ msg: 'Could not add the photos. Please try again.' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const vcardId = await getOrCreateCardId(req.user.userId);
        const gone = await Gallery.findOneAndDelete({ _id: req.params.id, vcardId });
        if (!gone) return res.status(404).json({ msg: 'Not found' });
        res.json({ msg: 'Deleted' });
    } catch (err) { 
        console.error('Gallery Delete Error:', err);
        res.status(500).send('Server Error'); 
    }
});

module.exports = router;