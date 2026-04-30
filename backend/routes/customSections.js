const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CustomSection = require('../models/CustomSection');
const vCard = require('../models/vCard');

const getCardId = async (userId) => {
    const card = await vCard.findOne({ userId });
    return card ? card._id : null;
};

router.get('/', auth, async (req, res) => {
    try {
        const vcardId = await getCardId(req.user.userId);
        if (!vcardId) return res.json([]);
        res.json(await CustomSection.find({ vcardId }).sort('order'));
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
    try {
        const vcardId = await getCardId(req.user.userId);
        if (!vcardId) return res.status(404).json({ msg: 'vCard not found.' });
        const { title, content } = req.body;
        const count = await CustomSection.countDocuments({ vcardId });
        const item = new CustomSection({ vcardId, title, content, order: count });
        await item.save();
        res.json(item);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const { title, content } = req.body;
        res.json(await CustomSection.findByIdAndUpdate(req.params.id, { $set: { title, content } }, { new: true }));
    } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await CustomSection.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
