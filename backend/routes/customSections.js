const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CustomSection = require('../models/CustomSection');
const vCard = require('../models/vCard');
const { upload, fileUrl, useCloudinary } = require('../utils/upload');
const cloudinary = useCloudinary ? require('cloudinary').v2 : null;

const getCardId = async (userId) => {
    const card = await vCard.findOne({ userId });
    return card ? card._id : null;
};

// Documents a custom section can carry (downloaded or opened from the card).
const DOC_EXT = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'txt', 'rtf', 'odt', 'ods', 'odp', 'zip', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'mp3', 'mp4'];
const extOf = (name) => String(name || '').toLowerCase().split('.').pop().replace(/[^a-z0-9]/g, '');

// Files must live in our own storage (a direct Cloudinary upload or a server upload).
const ownUrl = (u) => {
    if (typeof u !== 'string') return false;
    if (/^\/uploads\/[\w.-]+$/.test(u)) return true;
    if (!cloudinary) return false;
    return u.startsWith(`https://res.cloudinary.com/${cloudinary.config().cloud_name}/`);
};
const cleanFiles = (files) =>
    (Array.isArray(files) ? files : [])
        .filter((f) => f && ownUrl(f.url) && DOC_EXT.includes(extOf(f.name || f.url)))
        .slice(0, 10)
        .map((f) => ({
            name: String(f.name || 'Document').slice(0, 150),
            url: f.url,
            size: Math.max(0, Number(f.size) || 0),
        }));

router.get('/', auth, async (req, res) => {
    try {
        const vcardId = await getCardId(req.user.userId);
        if (!vcardId) return res.json([]);
        res.json(await CustomSection.find({ vcardId }).sort('order'));
    } catch (err) { res.status(500).send('Server Error'); }
});

// GET /upload-signature?name=brochure.pptx → sign a direct browser → Cloudinary upload
// (skips Vercel's ~4.5 MB body limit). { mode: 'server' } when Cloudinary isn't set up.
router.get('/upload-signature', auth, (req, res) => {
    const ext = extOf(req.query.name);
    if (!DOC_EXT.includes(ext)) return res.status(400).json({ msg: 'This file type is not supported.' });
    if (!cloudinary) return res.json({ mode: 'server' });
    const { cloud_name, api_key, api_secret } = cloudinary.config();
    const timestamp = Math.round(Date.now() / 1000);
    const folder = process.env.CLOUDINARY_FOLDER || 'webcard';
    // "raw" keeps the file exactly as uploaded; the extension in the id keeps downloads openable.
    const public_id = `doc-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder, public_id }, api_secret);
    res.json({ mode: 'cloudinary', uploadUrl: `https://api.cloudinary.com/v1_1/${cloud_name}/raw/upload`, apiKey: api_key, timestamp, folder, publicId: public_id, signature });
});

// POST /upload (multipart "doc"): server-side upload when direct upload isn't available.
router.post('/upload', auth, (req, res, next) => upload.single('doc')(req, res, (err) => {
    if (err) return res.status(400).json({ msg: err.message || 'Upload failed' });
    next();
}), (req, res) => {
    if (!req.file) return res.status(400).json({ msg: 'Please choose a file.' });
    if (!DOC_EXT.includes(extOf(req.file.originalname))) return res.status(400).json({ msg: 'This file type is not supported.' });
    res.json({ url: fileUrl(req.file), name: req.file.originalname, size: req.file.size });
});

router.post('/', auth, async (req, res) => {
    try {
        const vcardId = await getCardId(req.user.userId);
        if (!vcardId) return res.status(404).json({ msg: 'vCard not found.' });
        const title = String(req.body.title || '').trim();
        const content = String(req.body.content || '');
        const files = cleanFiles(req.body.files);
        if (!title) return res.status(400).json({ msg: 'Please add a title.' });
        if (!content.trim() && !files.length) return res.status(400).json({ msg: 'Add some content or at least one document.' });
        const count = await CustomSection.countDocuments({ vcardId });
        const item = await CustomSection.create({ vcardId, title, content, files, order: count });
        res.json(item);
    } catch (err) { res.status(500).send('Server Error'); }
});

// Edit and delete only the signed-in owner's own sections.
router.put('/:id', auth, async (req, res) => {
    try {
        const vcardId = await getCardId(req.user.userId);
        const title = String(req.body.title || '').trim();
        const content = String(req.body.content || '');
        const files = cleanFiles(req.body.files);
        if (!title) return res.status(400).json({ msg: 'Please add a title.' });
        if (!content.trim() && !files.length) return res.status(400).json({ msg: 'Add some content or at least one document.' });
        const item = await CustomSection.findOneAndUpdate({ _id: req.params.id, vcardId }, { $set: { title, content, files } }, { new: true });
        if (!item) return res.status(404).json({ msg: 'Section not found.' });
        res.json(item);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const vcardId = await getCardId(req.user.userId);
        const gone = await CustomSection.findOneAndDelete({ _id: req.params.id, vcardId });
        if (!gone) return res.status(404).json({ msg: 'Section not found.' });
        res.json({ msg: 'Deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
