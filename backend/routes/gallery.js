const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const auth = require('../middleware/auth');
const Gallery = require('../models/Gallery');
const vCard = require('../models/vCard');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
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
            url = `/uploads/${req.file.filename}`;
            thumbnail = `/uploads/${req.file.filename}`;
        }
        
        const item = new Gallery({ vcardId, type: type || 'image', url, thumbnail, order: count });
        await item.save();
        res.json(item);
    } catch (err) { 
        console.error('Gallery Save Error:', err);
        res.status(500).json({ msg: 'Server Error saving gallery item', error: err.message }); 
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Gallery.findOneAndDelete({ _id: req.params.id });
        res.json({ msg: 'Deleted' });
    } catch (err) { 
        console.error('Gallery Delete Error:', err);
        res.status(500).send('Server Error'); 
    }
});

module.exports = router;