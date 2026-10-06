// Place search for the Location field (Contact Details): the owner types a business name or
// address, picks a suggestion, and the card gets a Google Maps link for it. Uses OpenStreetMap's
// Nominatim (free, no key) through this server, with a cache and a per-user limit, as its usage
// policy asks (identify the app, at most ~1 request a second).
const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');

const router = express.Router();
const UA = 'AicardlyBot/1.0 (+https://aicardly.com; hello@aicardly.com)';
const cache = new Map(); // query → { at, data }
const TTL = 24 * 60 * 60 * 1000;

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: (req) => `user:${req.user.userId}`,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many searches. Please wait a moment.' },
});

// One request at a time to Nominatim, spaced ≥1.1s apart (per server instance).
let last = 0;
let queue = Promise.resolve();
const nominatim = (path) => {
  const run = async () => {
    const wait = Math.max(0, last + 1100 - Date.now());
    if (wait) await new Promise((r) => setTimeout(r, wait));
    last = Date.now();
    const r = await fetch(`https://nominatim.openstreetmap.org${path}`, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(`Place search failed (${r.status})`);
    return r.json();
  };
  const p = queue.then(run, run);
  queue = p.catch(() => {});
  return p;
};

// A Google Maps link for a place: the name + address search finds the business itself
// (its reviews, hours, directions); the coordinates pin it if Google doesn't know the name.
const mapsLink = ({ name, address, lat, lng }) => {
  const q = [name, address].filter(Boolean).join(', ');
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : `https://www.google.com/maps?q=${lat},${lng}`;
};

const shape = (p) => {
  const a = p.address || {};
  const name = p.name || a.amenity || a.shop || a.office || a.building || '';
  const address = String(p.display_name || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s, i) => !(i === 0 && s === name))
    .slice(0, 5)
    .join(', ');
  const place = { name, address, lat: Number(p.lat), lng: Number(p.lon) };
  return { ...place, label: [name, address].filter(Boolean).join(' — '), url: mapsLink(place) };
};

// GET /api/geo/search?q=citi glass delhi → [{ name, address, lat, lng, label, url }]
router.get('/search', auth, limiter, async (req, res) => {
  const q = String(req.query.q || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  if (q.length < 3) return res.json([]);
  const key = `s:${q.toLowerCase()}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return res.json(hit.data);
  try {
    const raw = await nominatim(`/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=in,ae,us,gb,ca,au,sg&q=${encodeURIComponent(q)}`);
    const data = (Array.isArray(raw) ? raw : []).map(shape);
    cache.set(key, { at: Date.now(), data });
    if (cache.size > 2000) cache.delete(cache.keys().next().value);
    res.json(data);
  } catch {
    res.status(502).json({ msg: 'Place search is not available right now. You can paste a Google Maps link instead.' });
  }
});

// GET /api/geo/reverse?lat=..&lng=.. → { name, address, lat, lng, label, url } (for "use my location")
router.get('/reverse', auth, limiter, async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return res.status(400).json({ msg: 'Bad location' });
  try {
    const p = await nominatim(`/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${lat}&lon=${lng}`);
    const s = shape(p || {});
    // Exact spot the owner is standing on: pin the coordinates.
    res.json({ ...s, lat, lng, url: `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}` });
  } catch {
    res.json({ name: '', address: '', lat, lng, label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, url: `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}` });
  }
});

module.exports = router;
