const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const vCard = require('../models/vCard');

const { upload, fileUrl } = require('../utils/upload');

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
        res.json(await Portfolio.find({ vcardId }).sort('order'));
    } catch (err) { 
        console.error('Get Portfolio Error:', err);
        res.status(500).send('Server Error'); 
    }
});

router.post('/', [auth, upload.single('coverImage')], async (req, res) => {
    try {
        const vcardId = await getOrCreateCardId(req.user.userId);
        const { title, description, url } = req.body;
        const coverImage = req.file ? fileUrl(req.file) : '';
        
        const count = await Portfolio.countDocuments({ vcardId });
        const item = new Portfolio({ vcardId, title, description, coverImage, url, order: count });
        await item.save();
        res.json(item);
    } catch (err) { 
        console.error('Portfolio Save Error:', err);
        res.status(500).json({ msg: 'Server Error saving portfolio', error: err.message }); 
    }
});

router.put('/:id', [auth, upload.single('coverImage')], async (req, res) => {
    try {
        const { title, description, url } = req.body;
        const update = { title, description, url };
        if (req.file) update.coverImage = fileUrl(req.file);
        
        const item = await Portfolio.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
        res.json(item);
    } catch (err) { 
        console.error('Portfolio Update Error:', err);
        res.status(500).send('Server Error'); 
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Portfolio.findOneAndDelete({ _id: req.params.id });
        res.json({ msg: 'Deleted' });
    } catch (err) { 
        console.error('Portfolio Delete Error:', err);
        res.status(500).send('Server Error'); 
    }
});

module.exports = router;