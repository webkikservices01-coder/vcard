const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Testimonial = require('../models/Testimonial');
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

router.put('/:id', [auth, upload.single('photo')], async (req, res) => {
    try {
        const { name, review, rating } = req.body;
        const update = { name, review, rating: Number(rating) || 5 };
        
        if (req.file) {
            update.photo = fileUrl(req.file);
        }
        
        const item = await Testimonial.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
        res.json(item);
    } catch (err) { 
        console.error('Testimonial Update Error:', err);
        res.status(500).send('Server Error'); 
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Testimonial.findOneAndDelete({ _id: req.params.id });
        res.json({ msg: 'Deleted' });
    } catch (err) { 
        console.error('Testimonial Delete Error:', err);
        res.status(500).send('Server Error'); 
    }
});

module.exports = router;