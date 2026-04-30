const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Gallery = require('../models/Gallery');
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
    params: { folder: 'vcard_gallery', allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'] }
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
        res.json(await Gallery.find({ vcardId }).sort('order'));
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', [auth, upload.single('image')], async (req, res) => {
    try {
        const vcardId = await getCardId(req.user.userId);
        if (!vcardId) return res.status(404).json({ msg: 'vCard not found.' });
        const { type, url: videoUrl } = req.body;
        const count = await Gallery.countDocuments({ vcardId });
        let url = videoUrl || '';
        let thumbnail = '';
        if (type === 'image' && req.file) {
            url = req.file.path;
            thumbnail = req.file.path;
        }
        const item = new Gallery({ vcardId, type: type || 'image', url, thumbnail, order: count });
        await item.save();
        res.json(item);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
