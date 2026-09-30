// Link previews (Open Graph + Twitter Card) for public cards.
// The React site can't set these for crawlers (they don't run JavaScript), so the Hostinger
// front door (public/og.php) asks this route for a card's tags and puts them into index.html.
const express = require('express');
const router = express.Router();
const vCard = require('../models/vCard');
const VcardSettings = require('../models/VcardSettings');
const { cardImage } = require('../utils/cardImage');

const SITE = (process.env.SITE_URL || 'https://aicardly.com').replace(/\/$/, '');
const DEFAULT_IMAGE = `${SITE}/og-image.jpg`;

const esc = (s) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const oneLine = (s, n) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};

// ─── GET /api/og/_sitemap → [{ u, t }] public cards for sitemap.xml ─────────
// Cards with a username and a name, minus those whose owner switched off "Search Engine Indexing".
router.get('/_sitemap', async (req, res) => {
  try {
    const hidden = await VcardSettings.find({ seoIndexing: false }).distinct('vcardId');
    const cards = await vCard
      .find({ username: { $nin: [null, ''] }, 'personalInfo.name': { $nin: [null, ''] }, _id: { $nin: hidden } })
      .select('username updatedAt')
      .sort({ updatedAt: -1 })
      .limit(45000)
      .lean();
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.json(cards.map((c) => ({ u: c.username, t: (c.updatedAt || new Date()).toISOString().slice(0, 10) })));
  } catch (err) {
    console.error('Sitemap error:', err.message);
    res.status(500).json({ msg: 'Could not build sitemap' });
  }
});

// ─── GET /api/og/:username → { head } (meta tags for that card) ─────────────
router.get('/:username', async (req, res) => {
  try {
    const username = String(req.params.username || '').toLowerCase();
    const card = await vCard.findOne({ username }).select('username personalInfo').lean();
    if (!card) return res.status(404).json({ msg: 'Card not found' });
    // Owner's "Search Engine Indexing" switch (Advanced Settings).
    const settings = await VcardSettings.findOne({ vcardId: card._id }).select('seoIndexing').lean();
    const indexable = settings?.seoIndexing !== false;

    const p = card.personalInfo || {};
    const name = oneLine(p.name, 60) || card.username;
    const role = oneLine([p.designation, p.company].filter(Boolean).join(' · '), 70);
    const url = `${SITE}/${card.username}`;
    const title = `${name}${role ? ` – ${role}` : ''} | Aicardly`;
    const description =
      oneLine(p.bio, 180) ||
      `Connect with ${name}${role ? `, ${role}` : ''}. Save the contact, see their work and chat with their AI assistant.`;
    const generated = cardImage({ photo: p.profilePic, name, role, link: url.replace(/^https?:\/\//, '') });
    const image = generated || DEFAULT_IMAGE;
    const alt = `${name}'s digital business card on Aicardly`;

    const tags = [
      `<title>${esc(title)}</title>`,
      `<meta name="description" content="${esc(description)}" />`,
      `<meta name="robots" content="${indexable ? 'index, follow' : 'noindex, follow'}" />`,
      `<link rel="canonical" href="${esc(url)}" />`,
      `<meta property="og:type" content="profile" />`,
      `<meta property="og:site_name" content="Aicardly" />`,
      `<meta property="og:locale" content="en_IN" />`,
      `<meta property="og:url" content="${esc(url)}" />`,
      `<meta property="og:title" content="${esc(title)}" />`,
      `<meta property="og:description" content="${esc(description)}" />`,
      `<meta property="og:image" content="${esc(image)}" />`,
      `<meta property="og:image:secure_url" content="${esc(image)}" />`,
      `<meta property="og:image:type" content="image/jpeg" />`,
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
      `<meta property="og:image:alt" content="${esc(alt)}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${esc(title)}" />`,
      `<meta name="twitter:description" content="${esc(description)}" />`,
      `<meta name="twitter:image" content="${esc(image)}" />`,
      `<meta name="twitter:image:alt" content="${esc(alt)}" />`,
    ];
    // Crawlers re-check often; a short shared cache keeps previews fresh after profile edits.
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.json({ head: tags.join('\n    '), title, description, image, url });
  } catch (err) {
    console.error('OG error:', err.message);
    res.status(500).json({ msg: 'Could not build preview' });
  }
});

module.exports = router;
