const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const auth = require('../middleware/auth');
const vCard = require('../models/vCard');
const Product = require('../models/Product');
const Portfolio = require('../models/Portfolio');
const Testimonial = require('../models/Testimonial');
const Gallery = require('../models/Gallery');
const CustomSection = require('../models/CustomSection');
const VcardSettings = require('../models/VcardSettings');
const Enquiry = require('../models/Enquiry');

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

router.post('/', [auth, upload.fields([{ name: 'profileImage' }, { name: 'bannerImage' }])], async (req, res) => {
    try {
        let updateFields = {};

        if (req.body.username !== undefined) updateFields.username = req.body.username.trim().toLowerCase();
        if (req.body.title !== undefined) updateFields['personalInfo.name'] = req.body.title;
        if (req.body.designation !== undefined) updateFields['personalInfo.designation'] = req.body.designation;
        if (req.body.bio !== undefined) updateFields['personalInfo.bio'] = req.body.bio;
        if (req.body.theme !== undefined) updateFields.theme = req.body.theme;
        
        // FIX: Ensure customTheme is properly parsed and included in update fields
        if (req.body.customTheme !== undefined) {
            updateFields.customTheme = typeof req.body.customTheme === 'string'
                ? JSON.parse(req.body.customTheme)
                : req.body.customTheme;
        }

        if (req.files?.['profileImage']?.[0]) {
            updateFields['personalInfo.profilePic'] = `/uploads/${req.files['profileImage'][0].filename}`;
        } else if (req.body.profilePic === '') {
            updateFields['personalInfo.profilePic'] = '';
        } else if (req.body.profilePic && typeof req.body.profilePic === 'string' && !req.body.profilePic.startsWith('blob:')) {
            updateFields['personalInfo.profilePic'] = req.body.profilePic;
        }

        if (req.files?.['bannerImage']?.[0]) {
            updateFields['personalInfo.bannerImage'] = `/uploads/${req.files['bannerImage'][0].filename}`;
        } else if (req.body.bannerImage === '') {
            updateFields['personalInfo.bannerImage'] = '';
        } else if (req.body.bannerImage && typeof req.body.bannerImage === 'string' && !req.body.bannerImage.startsWith('blob:')) {
            updateFields['personalInfo.bannerImage'] = req.body.bannerImage;
        }

        if (req.body.dynamicLinks !== undefined) {
            updateFields.dynamicLinks = typeof req.body.dynamicLinks === 'string'
                ? JSON.parse(req.body.dynamicLinks)
                : req.body.dynamicLinks;
        }

        if (updateFields.username) {
            const existing = await vCard.findOne({ username: updateFields.username, userId: { $ne: req.user.userId } });
            if (existing) {
                return res.status(400).json({ msg: 'This vanity URL is already taken.' });
            }
        }

        let card = await vCard.findOneAndUpdate(
            { userId: req.user.userId },
            { $set: { ...updateFields, userId: req.user.userId } },
            { new: true, upsert: true }
        );

        res.json({ msg: 'Data Saved Successfully!', card });
    } catch (err) {
        console.error('vCard Save Error:', err);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'This username is already in use.' });
        }
        res.status(500).json({ msg: 'Server Error saving profile', error: err.message });
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        const card = await vCard.findOne({ userId: req.user.userId });
        if (!card) return res.status(404).json({ msg: 'Card not found' });
        res.json(card);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/upload-image', [auth, upload.single('image')], async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
        res.json({ url: `/uploads/${req.file.filename}` });
    } catch (err) { 
        console.error('Upload error:', err);
        res.status(500).json({ msg: 'Upload failed', error: err.message }); 
    }
});

router.get('/all', auth, async (req, res) => {
    try {
        const cards = await vCard.find({ userId: req.user.userId });
        res.json(cards);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await vCard.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        res.json({ msg: 'Deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/public/:username', async (req, res) => {
    try {
        const card = await vCard.findOne({ username: req.params.username });
        if (!card) return res.status(404).json({ msg: 'Card not found' });

        const [products, portfolio, testimonials, gallery, customSections, settings] = await Promise.all([
            Product.find({ vcardId: card._id }).sort('order'),
            Portfolio.find({ vcardId: card._id }).sort('order'),
            Testimonial.find({ vcardId: card._id }),
            Gallery.find({ vcardId: card._id }).sort('order'),
            CustomSection.find({ vcardId: card._id }).sort('order'),
            VcardSettings.findOne({ vcardId: card._id })
        ]);

        res.json({ card, products, portfolio, testimonials, gallery, customSections, settings: settings || {} });
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/public/:username/view', async (req, res) => {
    try {
        const card = await vCard.findOneAndUpdate(
            { username: req.params.username },
            { $inc: { viewCount: 1 } },
            { new: true, select: 'viewCount' }
        );
        if (!card) return res.status(404).json({ msg: 'Card not found' });
        res.json({ viewCount: card.viewCount });
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/public/:username/enquiry', async (req, res) => {
    try {
        const { name, email, mobile, message } = req.body;
        if (!name?.trim() || !message?.trim()) return res.status(400).json({ msg: 'Name and message are required' });

        const card = await vCard.findOne({ username: req.params.username });
        if (!card) return res.status(404).json({ msg: 'Card not found' });

        const enquiry = await Enquiry.create({
            vcardId: card._id,
            name: name.trim(),
            email: email?.trim() || '',
            mobile: mobile?.trim() || '',
            message: message.trim(),
        });
        res.json({ msg: 'Enquiry submitted', enquiry });
    } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/enquiries', auth, async (req, res) => {
    try {
        const card = await vCard.findOne({ userId: req.user.userId });
        if (!card) return res.json([]);
        const enquiries = await Enquiry.find({ vcardId: card._id }).sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/enquiries/:id', auth, async (req, res) => {
    try {
        const card = await vCard.findOne({ userId: req.user.userId });
        if (!card) return res.status(404).json({ msg: 'Card not found' });
        await Enquiry.findOneAndDelete({ _id: req.params.id, vcardId: card._id });
        res.json({ msg: 'Deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/custom-theme', auth, async (req, res) => {
    try {
        const fields = ['layout','bg','bgImage','bannerColor','bannerImage','nameColor','designationColor','contactBg','contactText','sectionBg','border','accent','subTextColor','linkBg','cardBg','text'];
        const update = {};
        fields.forEach(f => { if (req.body[f] !== undefined) update[`customTheme.${f}`] = req.body[f]; });
        
        const card = await vCard.findOneAndUpdate(
            { userId: req.user.userId },
            { $set: update },
            { new: true }
        );
        if (!card) return res.status(404).json({ msg: 'Create a vCard profile first.' });
        res.json({ msg: 'Custom theme saved!', customTheme: card.customTheme });
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

router.get('/:username', async (req, res) => {
    try {
        const card = await vCard.findOne({ username: req.params.username });
        if (!card) return res.status(404).json({ msg: 'Card not found' });
        res.json(card);
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;