const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const vCard = require('../models/vCard');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'vcard_portfolio', allowed_formats: ['jpg', 'png', 'jpeg', 'webp'] }
});
const upload = multer({ storage });

const getCardId = async (userId) => {
    const card = await vCard.findOne({ userId });
    return card ? card._id : null;
};

router.get('/', auth, async (req, res) => {
    try {
        const vcardId = await getCardId(req.user.userId);
        if (!vcardId) return res.json([]);
        res.json(await Portfolio.find({ vcardId }).sort('order'));
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', [auth, upload.single('coverImage')], async (req, res) => {
    try {
        const vcardId = await getCardId(req.user.userId);
        if (!vcardId) return res.status(404).json({ msg: 'vCard not found.' });
        const { title, description, url } = req.body;
        const coverImage = req.file ? req.file.path : '';
        const count = await Portfolio.countDocuments({ vcardId });
        const item = new Portfolio({ vcardId, title, description, coverImage, url, order: count });
        await item.save();
        res.json(item);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id', [auth, upload.single('coverImage')], async (req, res) => {
    try {
        const { title, description, url } = req.body;
        const update = { title, description, url };
        if (req.file) update.coverImage = req.file.path;
        res.json(await Portfolio.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }));
    } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Portfolio.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
