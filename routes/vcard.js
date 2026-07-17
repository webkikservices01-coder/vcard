const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const vCard = require('../models/vCard');
const Product = require('../models/Product');
const Portfolio = require('../models/Portfolio');
const Testimonial = require('../models/Testimonial');
const Gallery = require('../models/Gallery');
const CustomSection = require('../models/CustomSection');
const VcardSettings = require('../models/VcardSettings');
const Enquiry = require('../models/Enquiry');
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
    params: { folder: 'vcard_images', allowed_formats: ['jpg', 'png', 'jpeg', 'webp'] }
});
const upload = multer({ storage });

// POST: Create or Update vCard (profile + contact links)
router.post('/', [auth, upload.fields([{ name: 'profileImage' }, { name: 'bannerImage' }])], async (req, res) => {
    try {
        let updateFields = {};

        if (req.body.username !== undefined) updateFields.username = req.body.username;
        if (req.body.title !== undefined) updateFields['personalInfo.name'] = req.body.title;
        if (req.body.designation !== undefined) updateFields['personalInfo.designation'] = req.body.designation;
        if (req.body.bio !== undefined) updateFields['personalInfo.bio'] = req.body.bio;
        if (req.body.theme !== undefined) updateFields.theme = req.body.theme;

        if (req.files?.['profileImage']) updateFields['personalInfo.profilePic'] = req.files['profileImage'][0].path;
        if (req.files?.['bannerImage']) updateFields['personalInfo.bannerImage'] = req.files['bannerImage'][0].path;

        if (req.body.dynamicLinks) {
            updateFields.dynamicLinks = typeof req.body.dynamicLinks === 'string'
                ? JSON.parse(req.body.dynamicLinks)
                : req.body.dynamicLinks;
        }

        let card = await vCard.findOneAndUpdate(
            { userId: req.user.userId },
            { $set: { ...updateFields, userId: req.user.userId } },
            { new: true, upsert: true }
        );

        res.json({ msg: 'Data Saved Successfully!', card });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET /me - Logged-in user's card
router.get('/me', auth, async (req, res) => {
    try {
        const card = await vCard.findOne({ userId: req.user.userId });
        if (!card) return res.status(404).json({ msg: 'Card not found' });
        res.json(card);
    } catch (err) { res.status(500).send('Server Error'); }
});

// GET /all - All cards for user (currently only one)
router.get('/all', auth, async (req, res) => {
    try {
        const cards = await vCard.find({ userId: req.user.userId });
        res.json(cards);
    } catch (err) { res.status(500).send('Server Error'); }
});

// DELETE /:id - Delete a card
router.delete('/:id', auth, async (req, res) => {
    try {
        await vCard.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        res.json({ msg: 'Deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

// GET /public/:username - Fetch card data (no increment)
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

// POST /public/:username/view - Increment view count (called once per visit from frontend)
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

// POST /public/:username/enquiry - Visitor submits the enquiry form on the public card
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

// GET /enquiries - Card owner views submitted enquiries (newest first)
router.get('/enquiries', auth, async (req, res) => {
    try {
        const card = await vCard.findOne({ userId: req.user.userId });
        if (!card) return res.json([]);
        const enquiries = await Enquiry.find({ vcardId: card._id }).sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (err) { res.status(500).send('Server Error'); }
});

// DELETE /enquiries/:id - Card owner deletes an enquiry
router.delete('/enquiries/:id', auth, async (req, res) => {
    try {
        const card = await vCard.findOne({ userId: req.user.userId });
        if (!card) return res.status(404).json({ msg: 'Card not found' });
        await Enquiry.findOneAndDelete({ _id: req.params.id, vcardId: card._id });
        res.json({ msg: 'Deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

// POST /upload-image - Upload one image to Cloudinary, returns URL
router.post('/upload-image', [auth, upload.single('image')], async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
        res.json({ url: req.file.path });
    } catch (err) { res.status(500).send('Upload failed'); }
});

// PUT /custom-theme - Save custom theme settings (JSON body)
router.put('/custom-theme', auth, async (req, res) => {
    try {
        const fields = ['layout','bg','bgImage','bannerColor','bannerImage','nameColor','designationColor','contactBg','contactText','sectionBg','border','accent'];
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

// GET /:username - Same as public (for backward compat)
router.get('/:username', async (req, res) => {
    try {
        const card = await vCard.findOne({ username: req.params.username });
        if (!card) return res.status(404).json({ msg: 'Card not found' });
        res.json(card);
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
