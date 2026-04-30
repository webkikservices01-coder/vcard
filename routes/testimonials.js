const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Testimonial = require('../models/Testimonial');
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
    params: { folder: 'vcard_testimonials', allowed_formats: ['jpg', 'png', 'jpeg', 'webp'] }
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
        res.json(await Testimonial.find({ vcardId }));
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', [auth, upload.single('photo')], async (req, res) => {
    try {
        const vcardId = await getCardId(req.user.userId);
        if (!vcardId) return res.status(404).json({ msg: 'vCard not found.' });
        const { name, review, rating } = req.body;
        const photo = req.file ? req.file.path : '';
        const item = new Testimonial({ vcardId, name, review, rating: Number(rating) || 5, photo });
        await item.save();
        res.json(item);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id', [auth, upload.single('photo')], async (req, res) => {
    try {
        const { name, review, rating } = req.body;
        const update = { name, review, rating: Number(rating) || 5 };
        if (req.file) update.photo = req.file.path;
        res.json(await Testimonial.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }));
    } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
