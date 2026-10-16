// Site settings edited in the admin panel. Each group has defaults here; the saved values
// override them. Reads are cached for 30 seconds per server instance.
const SiteSetting = require('../models/SiteSetting');

const DEFAULTS = {
  // Settings page.
  site: {
    metalCardPrice: 0, // ₹, "From ₹… " on /metal-nfc-card (0 = "Price on quote")
    metalCardDelivery: '5–7 working days',
    announcement: { active: false, text: '', link: '' }, // strip at the top of the public site
    supportEmail: 'supportaicardly@gmail.com',
    supportPhone: '+91-9868698698',
    meetingCopyEmail: '', // copy of every AI-booked meeting email ('' = MEETING_COPY_EMAIL env)
  },
  security: {
    require2fa: false, // every admin must switch on 2FA before using the panel
    idleMinutes: 30, // sign out after this long without activity
    captchaAfter: 3, // failed sign-ins from one IP (15 min) before the picture check
  },
  // Website chatbot (Cardy).
  cardy: {
    enabled: true,
    welcome: '', // '' = the built-in welcome line
    extraKnowledge: '', // added to Cardy's knowledge (offers, new features, FAQs)
    bookingUrl: '', // '' = BOOKING_URL env / the built-in Calendly link; "off" = form instead
  },
};

const TTL = 30 * 1000;
const cache = new Map();

const merge = (base, saved) => {
  const out = { ...base };
  for (const [k, v] of Object.entries(saved || {})) {
    if (!(k in base)) continue;
    out[k] = base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) ? { ...base[k], ...(v || {}) } : v;
  }
  return out;
};

async function getSettings(key) {
  if (!DEFAULTS[key]) throw new Error(`Unknown settings group ${key}`);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value;
  let saved = {};
  try {
    saved = (await SiteSetting.findOne({ key }).lean())?.value || {};
  } catch {
    if (hit) return hit.value; // database hiccup: keep the last known values
  }
  const value = merge(DEFAULTS[key], saved);
  cache.set(key, { at: Date.now(), value });
  return value;
}

async function saveSettings(key, value, by = '') {
  const merged = merge(DEFAULTS[key], value);
  await SiteSetting.findOneAndUpdate({ key }, { $set: { value: merged, updatedBy: by } }, { upsert: true });
  cache.set(key, { at: Date.now(), value: merged });
  return merged;
}

module.exports = { getSettings, saveSettings, DEFAULTS };
