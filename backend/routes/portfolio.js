const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const vCard = require('../models/vCard');

const { upload, fileUrl, useCloudinary } = require('../utils/upload');
const cloudinary = useCloudinary ? require('cloudinary').v2 : null;

// A PDF uploaded straight from the browser to our Cloudinary account (see /upload-signature).
const isOwnCloudinaryUrl = (u) => {
    if (!cloudinary || typeof u !== 'string') return false;
    const { cloud_name } = cloudinary.config();
    return u.startsWith(`https://res.cloudinary.com/${cloud_name}/`);
};

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

// Cover image + optional PDF in one multipart request.
const fieldsUpload = upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]);
// Upload errors (wrong file type, over 10 MB) come back as a readable 400 instead of a crash page.
const itemUpload = (req, res, next) =>
    fieldsUpload(req, res, (err) => {
        if (!err) return next();
        const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 10 MB).' : err.message || 'Upload failed.';
        res.status(err.status || 400).json({ msg });
    });

const pickFiles = (req) => {
    const cover = req.files?.coverImage?.[0];
    const pdf = req.files?.file?.[0];
    if (pdf && pdf.mimetype !== 'application/pdf') {
        const err = new Error('Only PDF files can be attached.');
        err.status = 400;
        throw err;
    }
    return { cover, pdf };
};

// ── Bulk links: one project per URL ──────────────────────────────────────────
const YT_ID = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i;

const titleFromUrl = (u) => {
    const { hostname, pathname } = new URL(u);
    const host = hostname.replace(/^www\./, '');
    const last = pathname.split('/').filter(Boolean).pop();
    if (!last) return host;
    const words = decodeURIComponent(last).replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[-_+]+/g, ' ').trim();
    return words ? words.replace(/\b\w/g, c => c.toUpperCase()).slice(0, 80) : host;
};

// Only YouTube's own oEmbed endpoint is called (fixed host), to get a real video title.
const youtubeTitle = async (u) => {
    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(u)}`, { signal: ctrl.signal });
        clearTimeout(t);
        if (!r.ok) return '';
        const j = await r.json();
        return (j.title || '').slice(0, 120);
    } catch {
        return '';
    }
};

const linkToItem = async (u) => {
    const yt = YT_ID.exec(u);
    if (yt) {
        return {
            title: (await youtubeTitle(u)) || 'YouTube video',
            description: 'YouTube',
            url: `https://www.youtube.com/watch?v=${yt[1]}`,
            coverImage: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`,
        };
    }
    return { title: titleFromUrl(u), description: new URL(u).hostname.replace(/^www\./, ''), url: u, coverImage: '' };
};

router.post('/bulk', auth, async (req, res) => {
    try {
        const raw = Array.isArray(req.body.links) ? req.body.links : String(req.body.links || '').split(/[\s,]+/);
        const links = [...new Set(raw.map(s => String(s).trim()).filter(s => /^https?:\/\/[^\s]+$/i.test(s)))].slice(0, 50);
        if (!links.length) return res.status(400).json({ msg: 'No valid links found. Paste links starting with http:// or https://' });

        const vcardId = await getOrCreateCardId(req.user.userId);
        let order = await Portfolio.countDocuments({ vcardId });
        const items = await Promise.all(links.map(linkToItem));
        const saved = await Portfolio.insertMany(items.map(it => ({ ...it, vcardId, order: order++ })));
        res.json({ msg: `${saved.length} projects added`, items: saved });
    } catch (err) {
        console.error('Portfolio Bulk Error:', err);
        res.status(500).json({ msg: 'Server Error adding links', error: err.message });
    }
});

// Vercel caps request bodies at ~4.5 MB, so PDFs go from the browser directly to Cloudinary.
// This returns a one-time signature for that upload; locally (no Cloudinary) the file is sent to us instead.
router.get('/upload-signature', auth, (req, res) => {
    if (!cloudinary) return res.json({ mode: 'server' });
    const { cloud_name, api_key, api_secret } = cloudinary.config();
    const timestamp = Math.round(Date.now() / 1000);
    const folder = process.env.CLOUDINARY_FOLDER || 'webcard';
    const public_id = `file-${Date.now()}-${Math.round(Math.random() * 1E9)}.pdf`;
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder, public_id }, api_secret);
    res.json({
        mode: 'cloudinary',
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloud_name}/raw/upload`,
        apiKey: api_key, timestamp, folder, publicId: public_id, signature,
    });
});

router.get('/', auth, async (req, res) => {
    try {
        const vcardId = await getOrCreateCardId(req.user.userId);
        res.json(await Portfolio.find({ vcardId }).sort('order'));
    } catch (err) {
        console.error('Get Portfolio Error:', err);
        res.status(500).send('Server Error');
    }
});

router.post('/', [auth, itemUpload], async (req, res) => {
    try {
        const { cover, pdf } = pickFiles(req);
        const vcardId = await getOrCreateCardId(req.user.userId);
        const { title, description, url } = req.body;
        const coverImage = cover ? fileUrl(cover) : '';

        const count = await Portfolio.countDocuments({ vcardId });
        const direct = isOwnCloudinaryUrl(req.body.fileUrl);
        const item = new Portfolio({
            vcardId, title, description, coverImage, url, order: count,
            file: pdf ? fileUrl(pdf) : direct ? req.body.fileUrl : '',
            fileName: pdf ? pdf.originalname : direct ? String(req.body.fileName || 'Document.pdf').slice(0, 200) : '',
        });
        await item.save();
        res.json(item);
    } catch (err) {
        console.error('Portfolio Save Error:', err);
        res.status(err.status || 500).json({ msg: err.status ? err.message : 'Server Error saving portfolio', error: err.message });
    }
});

router.put('/:id', [auth, itemUpload], async (req, res) => {
    try {
        const { cover, pdf } = pickFiles(req);
        const { title, description, url, removeFile } = req.body;
        const update = { title, description, url };
        if (cover) update.coverImage = fileUrl(cover);
        if (pdf) {
            update.file = fileUrl(pdf);
            update.fileName = pdf.originalname;
        } else if (isOwnCloudinaryUrl(req.body.fileUrl)) {
            update.file = req.body.fileUrl;
            update.fileName = String(req.body.fileName || 'Document.pdf').slice(0, 200);
        } else if (removeFile === 'true' || removeFile === '1') {
            update.file = '';
            update.fileName = '';
        }

        const item = await Portfolio.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
        res.json(item);
    } catch (err) {
        console.error('Portfolio Update Error:', err);
        res.status(err.status || 500).json({ msg: err.status ? err.message : 'Server Error' });
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
