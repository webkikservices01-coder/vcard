const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
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
    params: { folder: 'vcard_products', allowed_formats: ['jpg', 'png', 'jpeg', 'webp'] }
});
const upload = multer({ storage });

const getCardId = async (userId) => {
    const card = await vCard.findOne({ userId });
    return card ? card._id : null;
};

// GET all
router.get('/', auth, async (req, res) => {
    try {
        const vcardId = await getCardId(req.user.userId);
        if (!vcardId) return res.json([]);
        const items = await Product.find({ vcardId }).sort('order');
        res.json(items);
    } catch (err) { res.status(500).send('Server Error'); }
});

// POST create
router.post('/', [auth, upload.single('coverImage')], async (req, res) => {
    try {
        const vcardId = await getCardId(req.user.userId);
        if (!vcardId) return res.status(404).json({ msg: 'vCard not found. Create a profile first.' });
        const { title, description, price, link } = req.body;
        const coverImage = req.file ? req.file.path : '';
        const count = await Product.countDocuments({ vcardId });
        const item = new Product({ vcardId, title, description, price, coverImage, link, order: count });
        await item.save();
        res.json(item);
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

// PUT update
router.put('/:id', [auth, upload.single('coverImage')], async (req, res) => {
    try {
        const { title, description, price, link } = req.body;
        const update = { title, description, price, link };
        if (req.file) update.coverImage = req.file.path;
        const item = await Product.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
        res.json(item);
    } catch (err) { res.status(500).send('Server Error'); }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
