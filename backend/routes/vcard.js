const express = require('express');
const { fillShotsLater } = require('../utils/siteShot');
const { youtubeVideos } = require('../services/websiteImport');
const { CardPresence, CardDayView } = require('../models/CardVisit');
const { logEvent } = require('../utils/logger');
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
const User = require('../models/User');
const { accountStatus } = require('../utils/accountStatus');
const { sendMail, emailHtml } = require('../utils/mailer');
const background = require('../utils/background');
const { enquiryLimiter } = require('../middleware/rateLimiter');

const { upload, fileUrl } = require('../utils/upload');

// Keeps only known fields, trims strings, drops empty rows and caps list sizes.
const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const rows = (list, keys, max = 30) =>
    (Array.isArray(list) ? list : [])
        .map(r => Object.fromEntries(keys.map(k => [k, str(r && r[k])])))
        .filter(r => keys.some(k => r[k]))
        .slice(0, max);
const words = (list, max = 40) => (Array.isArray(list) ? list : []).map(v => str(v, 80)).filter(Boolean).slice(0, max);
// Card links live at /<username> (older /c/<username> too): one owner per username, URL-safe,
// and never the name of a site page, or the page would hide the card.
const RESERVED_USERNAMES = new Set([
    'admin', 'api', 'dashboard', 'login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'onboarding', 'c', 'www', 'support', 'help',
    'about', 'about-us', 'contact', 'contact-us', 'faqs', 'privacy-policy', 'terms-conditions', 'refund-policy',
    'cancellation-policy', 'data-processing-addendum', 'metal-nfc-card', 'features', 'ai-data-privacy', 'pricing', 'plans', 'assets', 'aicardly', 'settings', 'null', 'undefined',
]);
const usernameProblem = (u) => {
    if (!u) return 'Please choose a username.';
    if (u.length < 3 || u.length > 30) return 'Username must be 3–30 characters.';
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(u)) return 'Use only lowercase letters, numbers and hyphens (not at the start or end).';
    if (RESERVED_USERNAMES.has(u)) return 'This username is reserved. Please pick another.';
    return '';
};

const sanitizeExtras =(x = {}) => ({
    followers:  rows(x.followers, ['platform', 'count', 'url'], 10),
    stats:      rows(x.stats, ['value', 'label'], 6),
    skills:     words(x.skills),
    languages:  words(x.languages, 10),
    brands:     words(x.brands, 20),
    experience: rows(x.experience, ['years', 'role', 'org'], 15),
    timings:    rows(x.timings, ['day', 'hours'], 10),
    reels:      rows(x.reels, ['url', 'title'], 20).filter(r => /^https?:\/\//i.test(r.url)),
});

router.post('/', [auth, upload.fields([{ name: 'profileImage' }, { name: 'bannerImage' }])], async (req, res) => {
    try {
        let updateFields = {};

        if (req.body.username !== undefined) updateFields.username = req.body.username.trim().toLowerCase();
        if (req.body.title !== undefined) updateFields['personalInfo.name'] = req.body.title;
        if (req.body.designation !== undefined) updateFields['personalInfo.designation'] = req.body.designation;
        if (req.body.bio !== undefined) updateFields['personalInfo.bio'] = req.body.bio;
        if (req.body.theme !== undefined) updateFields.theme = req.body.theme;
        if (req.body.themeOptions && typeof req.body.themeOptions === 'object') {
            const o = req.body.themeOptions;
            if (o.palette !== undefined) updateFields['themeOptions.palette'] = Math.max(0, Math.min(4, parseInt(o.palette, 10) || 0));
            if (o.mode !== undefined) updateFields['themeOptions.mode'] = ['light', 'dark'].includes(o.mode) ? o.mode : '';
            if (o.counter !== undefined) updateFields['themeOptions.counter'] = !!o.counter;
        }
        
        // FIX: Ensure customTheme is properly parsed and included in update fields
        if (req.body.customTheme !== undefined) {
            updateFields.customTheme = typeof req.body.customTheme === 'string'
                ? JSON.parse(req.body.customTheme)
                : req.body.customTheme;
        }

        if (req.files?.['profileImage']?.[0]) {
            updateFields['personalInfo.profilePic'] = fileUrl(req.files['profileImage'][0]);
        } else if (req.body.profilePic === '') {
            updateFields['personalInfo.profilePic'] = '';
        } else if (req.body.profilePic && typeof req.body.profilePic === 'string' && !req.body.profilePic.startsWith('blob:')) {
            updateFields['personalInfo.profilePic'] = req.body.profilePic;
        }

        if (req.files?.['bannerImage']?.[0]) {
            updateFields['personalInfo.bannerImage'] = fileUrl(req.files['bannerImage'][0]);
        } else if (req.body.bannerImage === '') {
            updateFields['personalInfo.bannerImage'] = '';
        } else if (req.body.bannerImage && typeof req.body.bannerImage === 'string' && !req.body.bannerImage.startsWith('blob:')) {
            updateFields['personalInfo.bannerImage'] = req.body.bannerImage;
        }

        if (req.body.extras !== undefined) {
            const extras = typeof req.body.extras === 'string' ? JSON.parse(req.body.extras) : req.body.extras;
            updateFields.extras = sanitizeExtras(extras);
        }

        if (req.body.dynamicLinks !== undefined) {
            updateFields.dynamicLinks = typeof req.body.dynamicLinks === 'string'
                ? JSON.parse(req.body.dynamicLinks)
                : req.body.dynamicLinks;
        }

        if (updateFields.username !== undefined) {
            const current = await vCard.findOne({ userId: req.user.userId }).select('username');
            if (updateFields.username === current?.username) {
                delete updateFields.username; // unchanged: older usernames stay valid even if they predate the rules
            } else {
                const problem = usernameProblem(updateFields.username);
                if (problem) return res.status(400).json({ msg: problem });
                const existing = await vCard.findOne({ username: updateFields.username, userId: { $ne: req.user.userId } });
                if (existing) {
                    return res.status(400).json({ msg: 'This username is already taken. Please choose another.' });
                }
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

// Live availability check for the username field.
router.get('/check-username/:username', auth, async (req, res) => {
    try {
        const u = String(req.params.username || '').trim().toLowerCase();
        const mine = await vCard.findOne({ userId: req.user.userId }).select('username');
        if (mine && mine.username === u) return res.json({ available: true, mine: true });
        const problem = usernameProblem(u);
        if (problem) return res.json({ available: false, msg: problem });
        const taken = await vCard.exists({ username: u, userId: { $ne: req.user.userId } });
        res.json(taken ? { available: false, msg: 'This username is already taken.' } : { available: true });
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
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
        res.json({ url: fileUrl(req.file) });
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

// Reels from the owner's YouTube channel: preview the latest videos, then add the chosen ones
// to the card's reels (at most 20 in all; ones already there are skipped).
router.post('/reels/import/preview', auth, async (req, res) => {
    try {
        res.json(await youtubeVideos(req.body?.url));
    } catch (err) {
        res.status(err.status || 500).json({ msg: err.status ? err.message : "Couldn't read that channel. Please try again." });
    }
});

router.post('/reels/import', auth, async (req, res) => {
    try {
        const items = (Array.isArray(req.body?.items) ? req.body.items : [])
            .map((r) => ({ url: String(r?.url || '').trim(), title: String(r?.title || '').trim().slice(0, 120) }))
            .filter((r) => /^https:\/\/(www\.)?youtube\.com\/(watch\?v=|shorts\/)[\w-]{11}/.test(r.url));
        if (!items.length) return res.status(400).json({ msg: 'Choose at least one video.' });
        const card = await vCard.findOne({ userId: req.user.userId });
        if (!card) return res.status(404).json({ msg: 'Create your card first.' });
        const reels = card.extras?.reels || [];
        const idOf = (u) => /(?:v=|shorts\/)([\w-]{11})/.exec(u)?.[1];
        const have = new Set(reels.map((r) => idOf(r.url)).filter(Boolean));
        const fresh = items.filter((r) => !have.has(idOf(r.url))).slice(0, Math.max(0, 20 - reels.length));
        card.set('extras.reels', [...reels, ...fresh]);
        await card.save();
        res.json({ added: fresh.length, skipped: items.length - fresh.length, full: reels.length + fresh.length >= 20 });
    } catch (err) {
        console.error('Reels import error:', err);
        res.status(500).json({ msg: 'Could not add the videos. Please try again.' });
    }
});

router.get('/public/:username', async (req, res) => {
    try {
        const card = await vCard.findOne({ username: req.params.username });
        // A user removed in the admin panel no longer has a public card.
        if (!card || (await accountStatus(card.userId)) === 'removed') return res.status(404).json({ msg: 'Card not found' });

        const [products, portfolio, testimonials, gallery, customSections, settings] = await Promise.all([
            Product.find({ vcardId: card._id }).sort('order'),
            Portfolio.find({ vcardId: card._id }).sort('order'),
            Testimonial.find({ vcardId: card._id }),
            Gallery.find({ vcardId: card._id }).sort('order'),
            CustomSection.find({ vcardId: card._id }).sort('order'),
            VcardSettings.findOne({ vcardId: card._id })
        ]);

        res.json({ card, products, portfolio, testimonials, gallery, customSections, settings: settings || {} });
        // Services / projects with a website but no picture get a saved screenshot of that page.
        fillShotsLater(Product, products, 'link', `p${card._id}`);
        fillShotsLater(Portfolio, portfolio, 'url', `f${card._id}`);
    } catch (err) { res.status(500).send('Server Error'); }
});

// Today's date in India, for per-day view counts.
const istDay = () => new Date(Date.now() + 5.5 * 36e5).toISOString().slice(0, 10);

router.post('/public/:username/view', async (req, res) => {
    try {
        const card = await vCard.findOneAndUpdate(
            { username: req.params.username },
            { $inc: { viewCount: 1 } },
            { new: true, select: 'viewCount' }
        );
        if (!card) return res.status(404).json({ msg: 'Card not found' });
        await CardDayView.updateOne({ vcardId: card._id, day: istDay() }, { $inc: { count: 1 } }, { upsert: true })
            .catch((err) => console.error('Day view count failed:', err.message));
        res.json({ viewCount: card.viewCount });
    } catch (err) { res.status(500).send('Server Error'); }
});

// Live visitor counter: GET ?v=<visitor id> marks this visitor as on the card now and returns
// { now, today, total }. The card polls it every 15 seconds while it is open.
router.get('/public/:username/live', async (req, res) => {
    try {
        const card = await vCard.findOne({ username: req.params.username }).select('viewCount');
        if (!card) return res.status(404).json({ msg: 'Card not found' });
        const visitor = String(req.query.v || '').replace(/[^\w-]/g, '').slice(0, 64);
        if (visitor) {
            await CardPresence.updateOne({ vcardId: card._id, visitor }, { $set: { lastSeen: new Date() } }, { upsert: true });
        }
        const [now, day] = await Promise.all([
            CardPresence.countDocuments({ vcardId: card._id, lastSeen: { $gte: new Date(Date.now() - 60 * 1000) } }),
            CardDayView.findOne({ vcardId: card._id, day: istDay() }).select('count').lean(),
        ]);
        res.set('Cache-Control', 'no-store');
        res.json({ now, today: day?.count || 0, total: card.viewCount || 0 });
    } catch (err) {
        console.error('Live stats error:', err.message);
        res.status(500).json({ msg: 'Could not load visitor stats' });
    }
});

router.post('/public/:username/enquiry', enquiryLimiter, async (req, res) => {
    try {
        const name = str(req.body.name, 100);
        const email = str(req.body.email, 150);
        const mobile = str(req.body.mobile, 30);
        const message = str(req.body.message, 2000);
        if (!name || !message) return res.status(400).json({ msg: 'Name and message are required' });
        // DPDP: the visitor must agree to share these details with the card owner.
        if (req.body.consent !== true) return res.status(400).json({ msg: 'Please agree to share your details with the card owner.' });
        const cohort = String(req.body.cohort || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30) || 'live';
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ msg: 'Please enter a valid email' });

        const card = await vCard.findOne({ username: req.params.username });
        if (!card) return res.status(404).json({ msg: 'Card not found' });

        const enquiry = await Enquiry.create({ vcardId: card._id, name, email, mobile, message, consentAt: new Date(), cohort });
        logEvent(req, 'enquiry.new', `Enquiry on /${card.username} from ${name}`, { userId: card.userId, email });

        // Email to the card owner: the email they sign in with, plus the enquiry email set in
        // Settings when that is a different address. Sent after the reply and kept alive on Vercel
        // (background), so the visitor doesn't wait and the email isn't cut off.
        background((async () => {
            const [settings, owner] = await Promise.all([
                VcardSettings.findOne({ vcardId: card._id }).select('enquiryEmail').lean(),
                User.findById(card.userId).select('email name firstName').lean(),
            ]);
            const to = [...new Set([owner?.email, settings?.enquiryEmail].map((e) => String(e || '').trim().toLowerCase()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)))];
            if (!to.length) return;
            const esc = (v) => String(v || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
            const site = (process.env.SITE_URL || 'https://aicardly.com').replace(/\/$/, '');
            const row = (label, value) => `<b>${label}:</b> ${value}`;
            const sent = await sendMail({
                to: to.join(', '),
                replyTo: email || undefined,
                subject: `New enquiry from ${name} on your AiCardly card`,
                text: `Hi ${owner?.firstName || owner?.name || ''},\n\nSomeone filled the contact form on your card aicardly.com/${card.username}.\n\nName: ${name}\nEmail: ${email || '—'}\nPhone: ${mobile || '—'}\n\nMessage:\n${message}\n\n${email ? 'Reply to this email to answer them.' : 'They left no email; call or WhatsApp them.'}\nAll enquiries: ${site}/dashboard/vcard/enquiries\n\n– Team AiCardly`,
                html: emailHtml({
                    heading: `New enquiry from ${esc(name)}`,
                    paragraphs: [
                        `Someone filled the contact form on your card <a href="${site}/${esc(card.username)}" style="color:#E70C65">aicardly.com/${esc(card.username)}</a>.`,
                        [row('Name', esc(name)), row('Email', email ? `<a href="mailto:${esc(email)}" style="color:#E70C65">${esc(email)}</a>` : '—'), row('Phone', mobile ? `<a href="tel:${esc(mobile.replace(/[^\d+]/g, ''))}" style="color:#E70C65">${esc(mobile)}</a>` : '—')].join('<br>'),
                        `<b>Message:</b><br>${esc(message).replace(/\n/g, '<br>')}`,
                        email ? 'Just reply to this email to answer them.' : 'They left no email address, so call or WhatsApp them.',
                    ],
                    button: { label: 'Open my enquiries', url: `${site}/dashboard/vcard/enquiries` },
                }),
            });
            logEvent(req, sent ? 'enquiry.emailed' : 'enquiry.email_failed', `Enquiry on /${card.username} ${sent ? 'emailed to' : 'NOT emailed to'} ${to.join(', ')}`, { level: sent ? 'info' : 'warn', userId: card.userId });
        })());
        res.json({ msg: 'Enquiry submitted', enquiry });
    } catch (err) { res.status(500).json({ msg: 'Could not send your message. Please try again.' }); }
});

router.get('/enquiries', auth, async (req, res) => {
    try {
        const card = await vCard.findOne({ userId: req.user.userId });
        if (!card) return res.json([]);
        const enquiries = await Enquiry.find({ vcardId: card._id }).sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.patch('/enquiries/:id', auth, async (req, res) => {
    try {
        const card = await vCard.findOne({ userId: req.user.userId });
        if (!card) return res.status(404).json({ msg: 'Card not found' });
        const enquiry = await Enquiry.findOneAndUpdate(
            { _id: req.params.id, vcardId: card._id },
            { $set: { read: req.body.read !== false } },
            { new: true }
        );
        if (!enquiry) return res.status(404).json({ msg: 'Enquiry not found' });
        res.json(enquiry);
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