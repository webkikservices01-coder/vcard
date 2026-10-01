import W from './webcard-shared.js';
import { getImageUrl, coverImageUrl, getYoutubeId, isDirectVideo, siteShot } from '../utils/media';

// One live card model shared by every template. WebCard calls applyCard() before
// rendering, and the templates read from CARD (they were designed with one card per page).

// Ordered so specific platforms win; each pattern is matched against the label first, then the URL.
const PLATFORM_RULES = [
  ['location', /location|address|directions|\bmaps?\b|\bgps\b|google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/],
  ['snapchat', /snapchat|snap\.com/],
  ['instagram', /insta/],
  ['facebook', /facebook|fb\.com|fb\.me/],
  ['twitter', /twitter|tweet|\bx\.com/],
  ['youtube', /youtube|youtu\.be/],
  ['whatsapp', /whatsapp|wa\.me/],
  ['linkedin', /linkedin/],
  ['github', /github/],
  ['telegram', /telegram|t\.me\//],
  ['tiktok', /tiktok/],
  ['pinterest', /pinterest/],
  ['behance', /behance/],
  ['dribbble', /dribbble/],
  ['spotify', /spotify/],
  ['discord', /discord/],
  ['email', /e-?mail|mailto:/],
  ['phone', /phone|mobile|\bcall\b|tel:/],
];

export const detectPlatform = (link) => {
  const label = `${link.fieldType || ''} ${link.title || ''}`.toLowerCase();
  const url = (link.url || '').toLowerCase();
  for (const [name, re] of PLATFORM_RULES) if (re.test(label)) return name;
  for (const [name, re] of PLATFORM_RULES) if (re.test(url)) return name;
  return 'website';
};

const isUrl = (v) => /^https?:\/\//i.test(v);
const digitsOf = (v) => (v || '').replace(/[^0-9]/g, '');

export const linkHref = (link, platform) => {
  const clean = (link.url || '').trim();
  if (!clean) return '';
  if (platform === 'phone') return `tel:${clean.replace(/[^0-9+]/g, '')}`;
  if (platform === 'whatsapp') {
    if (isUrl(clean)) return clean;
    const d = digitsOf(clean);
    // wa.me needs the country code; bare 10-digit numbers are Indian mobiles.
    return `https://wa.me/${d.length === 10 ? '91' + d : d}`;
  }
  if (platform === 'email') return clean.startsWith('mailto:') ? clean : `mailto:${clean}`;
  if (platform === 'location' && !isUrl(clean)) {
    return /^[\w.-]+\.[a-z]{2,}\//i.test(clean)
      ? `https://${clean}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clean)}`;
  }
  if (platform === 'snapchat' && !isUrl(clean) && !clean.includes('.')) return `https://www.snapchat.com/add/${clean.replace('@', '')}`;
  return isUrl(clean) ? clean : `https://${clean}`;
};

// Extra outline icons (24px lucide-style paths) for platforms webcard-shared doesn't have.
const EXTRA_PATHS = {
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  github:
    '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
  location: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  telegram: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
};
const SOCIAL_ICON = { linkedin: 'linkedin', instagram: 'instagram', youtube: 'youtube', twitter: 'xsoc' };
const SOCIAL_NAME = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube: 'YouTube',
  twitter: 'X',
  facebook: 'Facebook',
  github: 'GitHub',
  telegram: 'Telegram',
  snapchat: 'Snapchat',
  tiktok: 'TikTok',
  pinterest: 'Pinterest',
  behance: 'Behance',
  dribbble: 'Dribbble',
  spotify: 'Spotify',
  discord: 'Discord',
  website: 'Website',
  location: 'Location',
};

// The site's own icon (favicon) for links without a drawn icon: Behance, Dribbble, a portfolio
// on its own domain, … — so each one is recognisable instead of a plain chain link.
const faviconIcon = (href) => {
  let host;
  try {
    host = new URL(href).hostname;
  } catch {
    return null;
  }
  if (!host) return null;
  return {
    __html: `<img src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64" width="20" height="20" alt="" loading="lazy" style="display:block;width:20px;height:20px;border-radius:5px;object-fit:contain" />`,
  };
};

export const socialIcon = (kind, href = '', fieldType = '') => {
  if (SOCIAL_ICON[kind]) return W.svg(W.P[SOCIAL_ICON[kind]]);
  if (EXTRA_PATHS[kind]) return W.svg(EXTRA_PATHS[kind]);
  // A link saved as "Website" keeps the globe; any other link shows its site's icon.
  if (kind === 'website' && /website|^$/i.test(String(fieldType).trim())) return W.svg(EXTRA_PATHS.globe);
  return (/^https?:\/\//i.test(href) && faviconIcon(href)) || W.svg(kind === 'website' ? EXTRA_PATHS.globe : EXTRA_PATHS.link);
};

const initialsOf = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

// A reel/video link -> how to play it inline on the card.
export function reelInfo(url, title = '', thumbnail = '') {
  const u = String(url || '').trim();
  if (!u) return null;
  const thumb = thumbnail ? getImageUrl(thumbnail) : null;
  const yt = getYoutubeId(u);
  if (yt)
    return {
      kind: 'youtube',
      platform: 'YouTube',
      title,
      thumb: thumb || `https://img.youtube.com/vi/${yt}/hqdefault.jpg`,
      embed: `https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&playsinline=1&rel=0&modestbranding=1`,
      full: `https://www.youtube.com/embed/${yt}?autoplay=1&playsinline=1&rel=0&modestbranding=1`,
      href: `https://www.youtube.com/watch?v=${yt}`,
    };
  const ig = /instagram\.com\/(?:[\w.]+\/)?(reel|reels|p|tv)\/([\w-]+)/i.exec(u);
  if (ig)
    return {
      kind: 'instagram',
      platform: 'Instagram',
      title,
      thumb,
      embed: `https://www.instagram.com/${ig[1] === 'p' ? 'p' : 'reel'}/${ig[2]}/embed/`,
      full: `https://www.instagram.com/${ig[1] === 'p' ? 'p' : 'reel'}/${ig[2]}/embed/`,
      href: u,
    };
  if (/facebook\.com|fb\.watch/i.test(u))
    return {
      kind: 'facebook',
      platform: 'Facebook',
      title,
      thumb,
      embed: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false&autoplay=true&mute=1&width=320`,
      full: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false&autoplay=true&width=500`,
      href: u,
    };
  if (isDirectVideo(u)) return { kind: 'file', platform: 'Video', title, thumb, src: getImageUrl(u), href: getImageUrl(u) };
  return { kind: 'external', platform: 'Video', title, thumb, href: isUrl(u) ? u : `https://${u}` };
}

// Live model. Mutated in place by applyCard so every template sees the same object.
export const CARD = {};

// Turns the /api/vcard/public/:slug payload (or a dashboard card) into the template model.
// Web addresses only ("site.com" gets https://); anything else (javascript:, data:, ...) is dropped.
const webLink = (v) => {
  const t = String(v || '').trim();
  if (!t) return '';
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t.replace(/^\/+/, '')}`);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : '';
  } catch {
    return '';
  }
};

export function buildCard(payload = {}, { origin = window.location.origin, aiPersona = null, videoRoomUrl = '' } = {}) {
  const card = payload.card || {};
  const pi = card.personalInfo || {};
  const settings = payload.settings || {};
  const fullName = (pi.name || '').trim() || 'Your Name';
  const role = (pi.designation || '').trim();
  const company = (pi.company || '').trim();
  const bio = (pi.bio || '').trim();

  const links = (card.dynamicLinks || []).filter((l) => l && l.url);
  const firstOf = (kind) => links.find((l) => detectPlatform(l) === kind);
  const phoneLink = firstOf('phone');
  const waLink = firstOf('whatsapp') || phoneLink;
  const mailLink = firstOf('email');
  const locLink = firstOf('location');
  const phone = phoneLink ? phoneLink.url.trim() : waLink && !isUrl(waLink.url) ? waLink.url.trim() : '';
  const email = mailLink ? mailLink.url.replace(/^mailto:/i, '').trim() : '';
  const location = locLink && !isUrl(locLink.url) ? locLink.url.trim() : '';

  const href = {
    Call: phoneLink ? linkHref(phoneLink, 'phone') : '',
    WhatsApp: waLink ? linkHref(waLink, 'whatsapp') : '',
    Email: mailLink ? linkHref(mailLink, 'email') : '',
    Location: locLink ? linkHref(locLink, 'location') : '',
  };

  // The big buttons up top: Call, WhatsApp, Email and Website (Location there when there's no
  // website). Everything else is a small icon in the row below — Location too, when it moved.
  const siteLink = links.find((l) => detectPlatform(l) === 'website' && /website/i.test(l.fieldType || '')) || links.find((l) => detectPlatform(l) === 'website');
  const website = siteLink ? linkHref(siteLink, 'website') : '';
  href.Website = website;
  const quickKinds = new Set(['phone', 'whatsapp', 'email', website ? 'website-main' : 'location']);
  const socials = links
    .map((l) => ({ l, kind: l === siteLink ? 'website-main' : detectPlatform(l) }))
    .filter(({ kind }) => !quickKinds.has(kind))
    .map(({ l, kind }) => {
      const k = kind === 'website-main' ? 'website' : kind;
      return { kind: k, name: l.title || SOCIAL_NAME[k] || l.fieldType || 'Link', href: linkHref(l, k), fieldType: l.fieldType || '' };
    })
    // Location sits at the end of the small icons.
    .sort((a, b) => (a.kind === 'location') - (b.kind === 'location'));

  // Services (dashboard Services tab) first, then products. A service's link opens the owner's
  // website when tapped; only http(s) links are used (older items were saved unchecked).
  const services = [...(payload.products || [])]
    .sort((a, b) => (a.kind === 'service' ? 0 : 1) - (b.kind === 'service' ? 0 : 1))
    .map((p) => ({
      title: p.title || '',
      desc: p.description || '',
      price: p.price || '',
      // No picture? A screenshot of the service's page (as for projects).
      image: getImageUrl(p.coverImage) || siteShot(webLink(p.link)),
      link: webLink(p.link),
      kind: p.kind === 'service' ? 'service' : 'product',
    }));
  const projects = (payload.portfolio || []).map((p) => {
    const pdf = getImageUrl(p.file);
    return {
      title: p.title || '',
      tag: pdf ? 'PDF' : '',
      result: p.description || '',
      // No cover uploaded? Use a screenshot of the project's website.
      image: getImageUrl(p.coverImage) || siteShot(p.url),
      // An attached PDF opens first; otherwise the project link.
      url: pdf || p.url || '',
      link: p.url || '',
      pdf,
    };
  });
  const extras = card.extras || {};
  const gallery = payload.gallery || [];
  const photos = gallery.filter((g) => g.type !== 'video').map((g) => ({ src: getImageUrl(g.url) }));
  // Reels added on the Highlights page first, then videos from the gallery.
  const reels = [
    ...(extras.reels || []).map((r) => reelInfo(r.url, r.title)),
    ...gallery.filter((g) => g.type === 'video').map((g) => reelInfo(g.url, '', g.thumbnail)),
  ].filter(Boolean);
  const testimonials = (payload.testimonials || []).map((t) => ({
    q: t.review || '',
    n: t.name || '',
    c: '',
    i: initialsOf(t.name || ''),
    photo: getImageUrl(t.photo),
    rating: t.rating || 5,
  }));

  const slug = card.username || '';
  return {
    slug,
    cardUrl: slug ? `${origin}/${slug}` : window.location.href,
    fullName,
    firstName: fullName.split(/\s+/)[0],
    restName: fullName.split(/\s+/).slice(1).join(' '),
    initials: initialsOf(fullName),
    role,
    company,
    roleLine: [role, company].filter(Boolean).join(' · '),
    bio,
    location,
    phone,
    email,
    website,
    avatar: getImageUrl(pi.profilePic),
    cover: coverImageUrl(pi.bannerImage),
    logo: null,
    href,
    // Every link with its platform, for the saved contact.
    contactLinks: links.map((l) => ({ kind: detectPlatform(l), url: l.url.trim(), title: l.title || l.fieldType || '' })),
    socials,
    services,
    projects,
    reels,
    photos,
    testimonials,
    customSections: payload.customSections || [],
    skills: extras.skills || [],
    languages: extras.languages || [],
    stats: (extras.stats || []).map((s) => ({ v: s.value, l: s.label })),
    followers: (extras.followers || []).map((f) => ({
      n: f.count,
      l: f.platform,
      kind: detectPlatform({ fieldType: f.platform, url: f.url || '' }),
      href: f.url ? linkHref({ url: f.url }, 'website') : '',
    })),
    brands: extras.brands || [],
    experience: (extras.experience || []).map((e) => ({ years: e.years, role: e.role, org: e.org })),
    timings: (extras.timings || []).map((t) => ({ d: t.day, h: t.hours })),
    showEnquiry: settings.showEnquiryForm !== false && !!slug,
    showQr: settings.showQr !== false,
    showShare: settings.showShare !== false,
    showSave: settings.showPhonebook !== false,
    branding: settings.hideBranding !== true,
    ai: {
      enabled: !!aiPersona?.enabled,
      name: aiPersona?.aiName || 'AI Assistant',
      greeting: aiPersona?.greeting || '',
      // Niche preset, final offering and feedback settings from /api/ai/public/:slug.
      sensitive: !!aiPersona?.sensitive,
      disclaimer: aiPersona?.disclaimer || '',
      chips: aiPersona?.chips || [],
      offer: aiPersona?.offer?.title ? aiPersona.offer : null,
      nps: aiPersona?.npsEnabled !== false,
    },
    videoRoomUrl,
  };
}

// Section labels used by the templates' nav pills, and whether each has content.
const SECTION_HAS = {
  Profile: (c) => !!(c.bio || c.location || c.languages.length || c.skills.length || c.stats.length || c.experience.length),
  About: (c) => !!(c.bio || c.location || c.languages.length || c.skills.length || c.stats.length),
  Brands: (c) => c.brands.length > 0,
  Services: (c) => c.services.length > 0,
  Projects: (c) => c.projects.length > 0,
  Work: (c) => c.projects.length > 0,
  Reels: (c) => c.reels.length > 0,
  Videos: (c) => c.reels.length > 0,
  Portfolio: (c) => c.photos.length > 0,
  Gallery: (c) => c.photos.length > 0,
  Testimonials: (c) => c.testimonials.length > 0,
  Contact: (c) => c.showEnquiry,
  QR: (c) => c.showQr,
};

export const scrollToSection = (label) => {
  const want = String(label).toLowerCase();
  const heads = document.querySelectorAll('.wc-root h2, .wc-root h3');
  for (const h of heads) {
    const t = (h.textContent || '').toLowerCase();
    if (t.startsWith(want) || t.includes(want)) {
      h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
  }
};

// Helpers the templates use to merge real data into their styled placeholder lists.
const helpers = {
  // Real items take the template's per-slot styling, cycling when there are more items than slots.
  fill(real, styled) {
    if (!styled || !styled.length) return real.map((r, i) => ({ ...r, roman: ROMAN[i] || String(i + 1) }));
    return real.map((r, i) => ({ ...styled[i % styled.length], ...r, roman: ROMAN[i] || String(i + 1) }));
  },
  // Quick actions: keep only those the owner has, with real links.
  // The template's Location slot shows Website instead when the owner has a website; the icon
  // keeps the template's own stroke and size, only the drawing changes.
  quickFrom(styled) {
    return styled
      .map((q) => {
        const k = q.key || q.label;
        if (k === 'Location' && CARD.href.Website) {
          const svg = q.icon?.__html || '';
          const icon = /^<svg[^>]*>/.test(svg) ? { __html: svg.replace(/^(<svg[^>]*>)[\s\S]*(<\/svg>)$/, `$1${EXTRA_PATHS.globe}$2`) } : socialIcon('website');
          return { ...q, key: 'Website', label: /^[A-Z]+$/.test(q.label || '') ? 'WEBSITE' : /^[a-z]+$/.test(q.label || '') ? 'website' : 'Website', icon, href: CARD.href.Website };
        }
        return { ...q, href: CARD.href[k] || '' };
      })
      .filter((q) => q.href);
  },
  socialsFrom() {
    return CARD.socials.map((s) => ({ ...s, icon: socialIcon(s.kind, s.href, s.fieldType) }));
  },
  navFrom(items) {
    return items
      .filter((n) => {
        const has = SECTION_HAS[n.key || n.label];
        return has ? has(CARD) : true;
      })
      .map((n) => ({ ...n, go: () => scrollToSection(n.key || n.label) }));
  },
  // Bottom action bar: Call / WhatsApp / Save.
  barFrom(items) {
    return items
      .map((b) => {
        const k = b.key || b.label;
        if (k === 'Call') return CARD.href.Call ? { ...b, go: () => (window.location.href = CARD.href.Call) } : null;
        if (k === 'WhatsApp') return CARD.href.WhatsApp ? { ...b, go: () => window.open(CARD.href.WhatsApp, '_blank', 'noopener') } : null;
        if (k === 'Save') return CARD.showSave ? { ...b, go: () => saveContact() } : null;
        return b;
      })
      .filter(Boolean);
  },
};

export function applyCard(model) {
  for (const k of Object.keys(CARD)) delete CARD[k];
  Object.assign(CARD, model, helpers);
  loadContactPhoto(model.avatar);
  loadShareImage(model.slug);
}

// The profile photo as small base64 JPEG for the .vcf, fetched ahead of time so
// Save Contact can download straight away (iOS drops downloads started after an await).
let photoFor = '';
let photoB64 = '';
function loadContactPhoto(src) {
  if (!src || src === photoFor) return;
  photoFor = src;
  photoB64 = '';
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const size = 400;
      const s = Math.min(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      canvas
        .getContext('2d')
        .drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
      if (photoFor === src) photoB64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
    } catch {
      /* image host without CORS: contact saves without a photo */
    }
  };
  img.src = src;
}

// Demo content so previews have something to show before the owner fills their card.
export const DEMO_PAYLOAD = {
  card: {
    username: '',
    personalInfo: {
      name: 'Your Name',
      designation: 'Your Designation',
      bio: 'A short introduction about you and your business goes here.',
    },
    dynamicLinks: [
      { fieldType: 'Mobile / Phone', url: '+919876543210' },
      { fieldType: 'WhatsApp', url: '+919876543210' },
      { fieldType: 'Email', url: 'you@example.com' },
      { fieldType: 'LinkedIn', url: 'https://linkedin.com' },
      { fieldType: 'Instagram', url: 'https://instagram.com' },
    ],
  },
};

const vEsc = (v) =>
  String(v || '')
    .replace(/([,;\\])/g, '\\$1')
    .replace(/\n/g, '\\n');
// Bare 10-digit numbers are Indian mobiles; the country code helps WhatsApp match the contact.
const vTel = (v) => {
  const n = String(v || '').replace(/[^0-9+]/g, '');
  return /^\d{10}$/.test(n) ? '+91' + n : n;
};
const last10 = (v) => String(v || '').replace(/\D/g, '').slice(-10);

// Every filled detail the card can save to the phone's contacts, one row each (duplicates merged).
// Rows: { k, label, value, required?, lines(item) } where lines() returns the vCard lines.
export function contactDetails() {
  const c = CARD;
  const links = c.contactLinks || [];
  const rows = [];
  const add = (k, label, value, lines, required) => value && rows.push({ k, label, value, lines, required });
  // Labelled entries (iOS shows X-ABLabel; others fall back to the plain value).
  const labelled = (prop, value, label) => (item) => [`item${item()}.${prop}:${value}`, `item${item.n}.X-ABLabel:${vEsc(label)}`];

  if (c.avatar) add('photo', 'Profile photo', 'Your photo on their contact', () => (photoB64 && photoFor === c.avatar ? [`PHOTO;ENCODING=b;TYPE=JPEG:${photoB64}`] : []));
  add('name', 'Name', c.fullName, () => [], true);
  add('role', 'Role', c.role, () => [`TITLE:${vEsc(c.role)}`]);
  add('company', 'Company', c.company, () => [`ORG:${vEsc(c.company)}`]);

  const phones = new Set();
  links.forEach((l, i) => {
    if (l.kind !== 'phone' || !last10(l.url) || phones.has(last10(l.url))) return;
    phones.add(last10(l.url));
    add('phone' + i, phones.size > 1 ? 'Phone ' + phones.size : 'Mobile', l.url.trim(), () => [`TEL;TYPE=CELL:${vTel(l.url)}`]);
  });
  links.forEach((l, i) => {
    if (l.kind !== 'whatsapp') return;
    const n = isUrl(l.url) ? (/wa\.me\/(\d+)/i.exec(l.url) || [])[1] || '' : vTel(l.url);
    if (!n || phones.has(last10(n))) return;
    phones.add(last10(n));
    add('wa' + i, 'WhatsApp', n, labelled('TEL', n, 'WhatsApp'));
  });
  const emails = new Set();
  links.forEach((l, i) => {
    const m = l.kind === 'email' && l.url.replace(/^mailto:/i, '').trim();
    if (!m || emails.has(m.toLowerCase())) return;
    emails.add(m.toLowerCase());
    add('email' + i, emails.size > 1 ? 'Email ' + emails.size : 'Email', m, () => [`EMAIL;TYPE=INTERNET,WORK:${m}`]);
  });
  add('address', 'Address', c.location, () => [`ADR;TYPE=WORK:;;${vEsc(c.location)};;;;`]);
  if (c.href?.Location && isUrl(c.href.Location)) add('map', 'Map location', c.href.Location, labelled('URL', c.href.Location, 'Location'));
  add('website', 'Website', c.website, () => [`URL;TYPE=WORK:${c.website}`]);
  add('cardUrl', 'Digital card link', c.cardUrl, labelled('URL', c.cardUrl, 'Digital Card'));
  (c.socials || []).forEach((so, i) => {
    if (so.href && so.href !== c.website && so.kind !== 'location') add('social' + i, so.name || SOCIAL_NAME[so.kind] || 'Link', so.href, labelled('URL', so.href, so.name || SOCIAL_NAME[so.kind] || 'Link'));
  });
  add('bio', 'Bio', c.bio, () => []);
  return rows;
}

// Downloads the vCard with every detail except the row keys in skip.
export function downloadContact(skip = new Set()) {
  const c = CARD;
  const rows = contactDetails().filter((r) => r.required || !skip.has(r.k));
  const [first, ...rest] = (c.fullName || '').split(/\s+/);
  let n = 0;
  const item = () => (item.n = ++n);
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${vEsc(rest.join(' '))};${vEsc(first)};;;`, `FN:${vEsc(c.fullName)}`];
  rows.forEach((r) => lines.push(...r.lines(item)));
  // Bio plus the card link in NOTE; Android shows NOTE even when it drops labelled URLs.
  const keep = (k) => rows.some((r) => r.k === k);
  const note = [keep('bio') && c.bio, keep('cardUrl') && c.cardUrl && `Digital card: ${c.cardUrl}`].filter(Boolean).join('\n\n');
  if (note) lines.push(`NOTE:${vEsc(note)}`);
  lines.push('END:VCARD');
  // vCard lines fold at 75 chars (continuations start with a space).
  const fold = (line) => {
    const out = [];
    for (let i = 0; i < line.length; i += i ? 74 : 75) out.push((i ? ' ' : '') + line.slice(i, i ? i + 74 : 75));
    return out.join('\r\n');
  };
  const text = lines.filter(Boolean).map(fold).join('\r\n') + '\r\n';
  const url = URL.createObjectURL(new Blob([text], { type: 'text/vcard' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(c.fullName || 'contact').replace(/\s+/g, '-')}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return rows.length;
}

// Every Save button: open the Save Contact sheet (WebCard listens for wc:save), or save straight
// away where no sheet is mounted (e.g. template thumbnails).
export function saveContact(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (window.__wcSaveSheet) window.dispatchEvent(new CustomEvent('wc:save'));
  else downloadContact();
}

// The card's share image (photo + name, the same one link previews use), fetched ahead of time
// so the share sheet can include it straight away (browsers drop shares started after an await).
let shareFor = '';
let shareFile = null;
function loadShareImage(slug) {
  if (!slug || slug === shareFor) return;
  shareFor = slug;
  shareFile = null;
  const run = async () => {
    try {
      const meta = await fetch(`${import.meta.env.VITE_API_URL}/api/og/${slug}`).then((r) => (r.ok ? r.json() : null));
      if (!meta?.image || shareFor !== slug) return;
      const blob = await fetch(meta.image).then((r) => (r.ok ? r.blob() : null));
      if (blob && shareFor === slug) shareFile = new File([blob], `${slug}-aicardly.jpg`, { type: blob.type || 'image/jpeg' });
    } catch {
      /* no image: share the link only */
    }
  };
  (window.requestIdleCallback || ((fn) => setTimeout(fn, 1500)))(run);
}

export async function shareCard(e) {
  if (e && e.preventDefault) e.preventDefault();
  const url = CARD.cardUrl || window.location.href;
  const title = [CARD.fullName, CARD.company].filter(Boolean).join(' · ');
  const text = `${title}${CARD.roleLine && !title.includes(CARD.roleLine) ? ` – ${CARD.roleLine}` : ''}\n${url}`;
  const cancelled = (err) => err && err.name === 'AbortError';
  if (navigator.share) {
    // With the card image when the device can share files (WhatsApp, Instagram, etc.).
    if (shareFile && navigator.canShare?.({ files: [shareFile] })) {
      try {
        await navigator.share({ title, text, url, files: [shareFile] });
        return;
      } catch (err) {
        if (cancelled(err)) return;
        /* image share refused: fall back to the link */
      }
    }
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (err) {
      if (cancelled(err)) return;
      /* no share sheet: copy the link instead */
    }
  }
  let copied = false;
  try {
    await navigator.clipboard.writeText(url);
    copied = true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      copied = document.execCommand('copy');
      ta.remove();
    } catch {
      /* clipboard blocked */
    }
  }
  shareNotice(copied ? 'Card link copied – paste it anywhere to share' : url);
}

function shareNotice(msg) {
  document.querySelectorAll('.wc-sharenote').forEach((n) => n.remove());
  const n = document.createElement('div');
  n.className = 'wc-sharenote';
  n.setAttribute('role', 'status');
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 2600);
}
