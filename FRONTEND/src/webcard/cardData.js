import W from './webcard-shared.js';
import { getImageUrl, getYoutubeId, isDirectVideo, siteShot } from '../utils/media';

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
};

export const socialIcon = (kind) => {
  if (SOCIAL_ICON[kind]) return W.svg(W.P[SOCIAL_ICON[kind]]);
  if (EXTRA_PATHS[kind]) return W.svg(EXTRA_PATHS[kind]);
  return W.svg(kind === 'website' ? EXTRA_PATHS.globe : EXTRA_PATHS.link);
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

  const quickKinds = new Set(['phone', 'whatsapp', 'email', 'location']);
  const socials = links
    .map((l) => ({ l, kind: detectPlatform(l) }))
    .filter(({ kind }) => !quickKinds.has(kind))
    .map(({ l, kind }) => ({ kind, name: l.title || SOCIAL_NAME[kind] || l.fieldType || 'Link', href: linkHref(l, kind) }));
  const website = socials.find((s) => s.kind === 'website')?.href || '';

  const services = (payload.products || []).map((p) => ({
    title: p.title || '',
    desc: p.description || '',
    price: p.price || '',
    image: getImageUrl(p.coverImage),
    link: p.link || '',
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
    cover: getImageUrl(pi.bannerImage),
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
  quickFrom(styled) {
    return styled.map((q) => ({ ...q, href: CARD.href[q.key || q.label] || '' })).filter((q) => q.href);
  },
  socialsFrom() {
    return CARD.socials.map((s) => ({ ...s, icon: socialIcon(s.kind) }));
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

export function saveContact(e) {
  if (e && e.preventDefault) e.preventDefault();
  const c = CARD;
  const [first, ...rest] = (c.fullName || '').split(/\s+/);
  const esc = (v) =>
    String(v || '')
      .replace(/([,;\\])/g, '\\$1')
      .replace(/\n/g, '\\n');
  const links = c.contactLinks || [];
  // Bare 10-digit numbers are Indian mobiles; the country code helps WhatsApp match the contact.
  const tel = (v) => {
    const n = v.replace(/[^0-9+]/g, '');
    return /^\d{10}$/.test(n) ? '+91' + n : n;
  };
  const key = (v) => v.replace(/\D/g, '').slice(-10);
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(rest.join(' '))};${esc(first)};;;`,
    `FN:${esc(c.fullName)}`,
    c.company && `ORG:${esc(c.company)}`,
    c.role && `TITLE:${esc(c.role)}`,
  ];
  // Labelled entries (iOS shows X-ABLabel; others fall back to the plain value).
  let item = 0;
  const labelled = (prop, value, label) => {
    item += 1;
    lines.push(`item${item}.${prop}:${value}`, `item${item}.X-ABLabel:${esc(label)}`);
  };
  const phones = new Set();
  for (const l of links) {
    if (l.kind === 'phone' && key(l.url) && !phones.has(key(l.url))) {
      phones.add(key(l.url));
      lines.push(`TEL;TYPE=CELL:${tel(l.url)}`);
    }
  }
  for (const l of links) {
    if (l.kind !== 'whatsapp') continue;
    const n = isUrl(l.url) ? (/wa\.me\/(\d+)/i.exec(l.url) || [])[1] || '' : tel(l.url);
    if (n && !phones.has(key(n))) {
      phones.add(key(n));
      labelled('TEL', n, 'WhatsApp');
    }
  }
  const emails = new Set();
  for (const l of links) {
    const m = l.kind === 'email' && l.url.replace(/^mailto:/i, '').trim();
    if (m && !emails.has(m.toLowerCase())) {
      emails.add(m.toLowerCase());
      lines.push(`EMAIL;TYPE=INTERNET,WORK:${m}`);
    }
  }
  if (c.website) lines.push(`URL;TYPE=WORK:${c.website}`);
  if (c.cardUrl) labelled('URL', c.cardUrl, 'Digital Card');
  for (const s of c.socials || []) {
    if (s.href && s.href !== c.website) labelled('URL', s.href, s.name || SOCIAL_NAME[s.kind] || 'Link');
  }
  if (c.location) lines.push(`ADR;TYPE=WORK:;;${esc(c.location)};;;;`);
  if (c.href?.Location && isUrl(c.href.Location)) labelled('URL', c.href.Location, 'Location');
  const note = [c.bio, c.cardUrl && `Digital card: ${c.cardUrl}`].filter(Boolean).join('\n\n');
  if (note) lines.push(`NOTE:${esc(note)}`);
  if (photoB64 && photoFor === c.avatar) lines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${photoB64}`);
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
}

export async function shareCard(e) {
  if (e && e.preventDefault) e.preventDefault();
  const url = CARD.cardUrl || window.location.href;
  const title = [CARD.fullName, CARD.company].filter(Boolean).join(' · ');
  try {
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    alert('Card link copied');
  } catch {
    /* user cancelled */
  }
}
