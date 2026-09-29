// Link previews (Open Graph + Twitter Card) for public cards.
// The React site can't set these for crawlers (they don't run JavaScript), so the Hostinger
// front door (public/og.php) asks this route for a card's tags and puts them into index.html.
const express = require('express');
const router = express.Router();
const vCard = require('../models/vCard');

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

// Text inside a Cloudinary l_text layer: URL-encoded, with commas and slashes double-encoded.
const cldText = (s) => encodeURIComponent(s).replace(/%2C/g, '%252C').replace(/%2F/g, '%252F');

// 1200x630 share image built by Cloudinary from the card's own photo: dark brand background,
// round photo with a pink ring, name, role and the card link. Null when the photo isn't on Cloudinary.
function cardImage({ photo, name, role, link }) {
  const m = /^https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(.+)\.(?:jpe?g|png|webp|gif|avif)$/i.exec(photo || '');
  if (!m) return null;
  const [, cloud, publicId] = m;
  const nameSize = name.length > 24 ? 52 : name.length > 18 ? 60 : 70;
  const layers = [
    'w_1200,h_630,c_fill,e_colorize:100,co_rgb:12141a',
    `l_${publicId.replace(/\//g, ':')},w_340,h_340,c_thumb,g_face,r_max,bo_8px_solid_rgb:E70C65`,
    'fl_layer_apply,g_west,x_90',
    `l_text:Arial_${nameSize}_bold:${cldText(name)},co_white,w_650,c_fit`,
    'fl_layer_apply,g_north_west,x_480,y_200',
    role && `l_text:Arial_36:${cldText(role)},co_rgb:ff6b9d,w_650,c_fit`,
    role && 'fl_layer_apply,g_north_west,x_480,y_300',
    `l_text:Arial_30:${cldText(link)},co_rgb:cbd5e1`,
    'fl_layer_apply,g_south_west,x_480,y_80',
    `l_text:Arial_34_bold:Aicardly,co_rgb:E70C65`,
    'fl_layer_apply,g_north_east,x_60,y_50',
  ].filter(Boolean);
  return `https://res.cloudinary.com/${cloud}/image/upload/${layers.join('/')}/${publicId}.jpg`;
}

// ─── GET /api/og/:username → { head } (meta tags for that card) ─────────────
router.get('/:username', async (req, res) => {
  try {
    const username = String(req.params.username || '').toLowerCase();
    const card = await vCard.findOne({ username }).select('username personalInfo').lean();
    if (!card) return res.status(404).json({ msg: 'Card not found' });

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
