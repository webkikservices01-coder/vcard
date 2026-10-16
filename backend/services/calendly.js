// Booking straight into the card owner's Calendly (no calendar for the visitor to click through).
// The owner connects Calendly once in AI settings with a Personal Access Token (Calendly →
// Integrations → API & Webhooks; booking through the API needs a paid Calendly plan). The card's AI
// then looks up free times (find_meeting_times), offers a few, and books the one the visitor picks
// (save_meeting_request). Calendly sends both sides the invite with the meeting link.
// Docs: GET /event_type_available_times (max 7 days a call), POST /invitees (Scheduling API).
const { encrypt, decrypt } = require('../utils/adminCrypto');

// CALENDLY_API_BASE only for local tests against a stand-in server.
const API = process.env.CALENDLY_API_BASE || 'https://api.calendly.com';
const TZ = 'Asia/Kolkata';

// ── OAuth ("Connect with Calendly", one click for every customer) ──────────────────────────
// Aicardly's OAuth app (developer.calendly.com): CALENDLY_CLIENT_ID / CALENDLY_CLIENT_SECRET, with the
// redirect URI <PUBLIC_API_URL>/api/ai/calendly/oauth/callback. Access tokens last 2 hours; refresh
// tokens are single-use and rotated (we always store the newest).
const AUTH = process.env.CALENDLY_AUTH_BASE || 'https://auth.calendly.com';
const crypto = require('crypto');
const oauthReady = () => !!(process.env.CALENDLY_CLIENT_ID && process.env.CALENDLY_CLIENT_SECRET);
const redirectUri = () => process.env.CALENDLY_REDIRECT_URI || `${(process.env.PUBLIC_API_URL || 'https://backend-nine-omega-26.vercel.app').replace(/\/$/, '')}/api/ai/calendly/oauth/callback`;

function oauthStart() {
  const state = crypto.randomBytes(24).toString('hex');
  const verifier = crypto.randomBytes(48).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  const q = new URLSearchParams({ client_id: process.env.CALENDLY_CLIENT_ID, response_type: 'code', redirect_uri: redirectUri(), code_challenge_method: 'S256', code_challenge: challenge, state });
  return { state, verifierEnc: encrypt(verifier), url: `${AUTH}/oauth/authorize?${q}` };
}

async function tokenRequest(params) {
  const r = await fetch(`${AUTH}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${process.env.CALENDLY_CLIENT_ID}:${process.env.CALENDLY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams(params).toString(),
    signal: AbortSignal.timeout(15000),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.access_token) throw Object.assign(new Error(data.error_description || data.error || `Calendly sign-in failed (${r.status})`), { status: r.status });
  return data; // { access_token, refresh_token, expires_in, owner, organization }
}

const exchangeCode = (code, verifierEnc) => tokenRequest({ grant_type: 'authorization_code', code, redirect_uri: redirectUri(), code_verifier: decrypt(verifierEnc) });

// A working access token for this connection: a pasted token as is; an OAuth one refreshed when
// it is about to expire (the new pair is saved at once; if another request refreshed first, we use theirs).
async function accessToken(cfg) {
  const token = cfg?.tokenEnc ? decrypt(cfg.tokenEnc) : '';
  if (!cfg?.refreshEnc || !cfg.expiresAt || new Date(cfg.expiresAt).getTime() > Date.now() + 2 * 60 * 1000) return token;
  const AiPersona = require('../models/AiPersona');
  try {
    const t = await tokenRequest({ grant_type: 'refresh_token', refresh_token: decrypt(cfg.refreshEnc) });
    const next = { 'calendly.tokenEnc': encrypt(t.access_token), 'calendly.refreshEnc': encrypt(t.refresh_token), 'calendly.expiresAt': new Date(Date.now() + (t.expires_in || 7200) * 1000) };
    await AiPersona.updateOne({ vcardId: cfg.vcardId, 'calendly.refreshEnc': cfg.refreshEnc }, { $set: next });
    Object.assign(cfg, { tokenEnc: next['calendly.tokenEnc'], refreshEnc: next['calendly.refreshEnc'], expiresAt: next['calendly.expiresAt'] });
    return t.access_token;
  } catch (err) {
    // Someone else may have just refreshed: use the stored token if it is newer.
    const fresh = await AiPersona.findOne({ vcardId: cfg.vcardId }).select('+calendly.tokenEnc').lean();
    if (fresh?.calendly?.tokenEnc && fresh.calendly.tokenEnc !== cfg.tokenEnc && new Date(fresh.calendly.expiresAt).getTime() > Date.now()) return decrypt(fresh.calendly.tokenEnc);
    throw Object.assign(new Error('The Calendly connection has expired. The card owner needs to connect Calendly again in AI settings.'), { status: 401 });
  }
}

async function call(token, path, { method = 'GET', body } = {}) {
  const r = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const detail = data.details?.map((d) => d.message).filter(Boolean).join('; ');
    const err = new Error(detail || data.message || data.title || `Calendly error ${r.status}`);
    err.status = r.status;
    throw err;
  }
  return data;
}

const plainUrl = (u) => String(u || '').split(/[?#]/)[0].replace(/\/+$/, '').toLowerCase();

// Checks the token and finds the event type to book: the one whose link is the owner's booking
// link, else their first active one. Returns what we keep on the AI persona.
async function connect(token, bookingUrl, oauth = null) {
  const me = await call(token, '/users/me');
  const user = me.resource;
  const list = await call(token, `/event_types?user=${encodeURIComponent(user.uri)}&active=true&count=100`);
  const types = (list.collection || []).filter((t) => t.active !== false && t.kind !== 'group');
  // Booking through the API (POST /invitees) needs a paid Calendly plan. On the free plan the AI
  // still finds the free times, then opens that time's confirmation page with the details filled in.
  let canBook = true;
  try {
    const org = await call(token, `/organizations/${String(user.current_organization || '').split('/').pop()}`);
    canBook = !(org.resource?.stage === 'free' || org.resource?.plan === 'basic');
  } catch {
    /* can't tell: try booking, and fall back if Calendly says no */
  }
  if (!types.length) throw Object.assign(new Error('This Calendly account has no active event type. Create one (e.g. "30 Minute Meeting") in Calendly first.'), { status: 400 });
  const want = plainUrl(bookingUrl);
  const type = types.find((t) => plainUrl(t.scheduling_url) === want) || types.find((t) => want && plainUrl(t.scheduling_url).startsWith(want)) || types[0];
  return {
    tokenEnc: encrypt(token),
    refreshEnc: oauth?.refresh_token ? encrypt(oauth.refresh_token) : '',
    expiresAt: oauth ? new Date(Date.now() + (oauth.expires_in || 7200) * 1000) : null,
    via: oauth ? 'oauth' : 'pat',
    eventType: type.uri,
    eventName: type.name,
    duration: type.duration || 30,
    schedulingUrl: type.scheduling_url,
    locations: (type.locations || []).map((l) => ({ kind: l.kind, location: l.location || '' })),
    questions: (type.custom_questions || []).filter((q) => q.enabled && q.required).map((q) => ({ name: q.name, type: q.type, position: q.position })),
    owner: user.name || '',
    canBook,
    connectedAt: new Date(),
  };
}


// "Tue, 14 Oct, 4:00 pm" in India time.
const label = (iso) => new Date(iso).toLocaleString('en-IN', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });

// ── Just a Calendly link (nothing connected) ─────────────────────────────────────────────────
// Any owner who only pasted their Calendly link (AI settings, or a link on the card) still gets
// real free times: we read them from the same public page data Calendly's own booking page uses.
// The visitor then confirms the chosen time on Calendly (its confirm page, details filled in), and
// the meeting lands in the owner's own Calendly and calendar.
const WEB = process.env.CALENDLY_WEB_BASE || 'https://calendly.com';
const RESERVED = /^(app|event_types|api|integrations|login|signup|pricing|help|blog|d|cancellations|reschedulings|s)$/i;
const publicCache = new Map(); // url -> { at, cfg|null }

async function web(path) {
  const r = await fetch(`${WEB}${path}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw Object.assign(new Error(`Calendly page not found (${r.status})`), { status: r.status });
  return r.json();
}

// "https://calendly.com/name/30min?x" -> { profile: 'name', slug: '30min' } (slug may be '').
function parseLink(url) {
  const m = /^(?:https?:\/\/)?(?:www\.)?calendly\.com\/([a-z0-9._-]+)(?:\/([a-z0-9._-]+))?/i.exec(String(url || '').trim());
  if (!m || RESERVED.test(m[1])) return null;
  return { profile: m[1], slug: m[2] || '' };
}

// The event behind a public Calendly link, as a connection the AI can use. null if it is not one.
async function publicConfig(url) {
  const link = parseLink(url);
  if (!link) return null;
  const key = `${link.profile}/${link.slug}`.toLowerCase();
  const hit = publicCache.get(key);
  if (hit && Date.now() - hit.at < (hit.cfg ? 30 : 5) * 60 * 1000) return hit.cfg;
  let cfg = null;
  try {
    let slug = link.slug;
    if (!slug) {
      // Only the profile: use its first event type.
      const types = await web(`/api/booking/profiles/${encodeURIComponent(link.profile)}/event_types`);
      slug = (Array.isArray(types) ? types : [])[0]?.slug || '';
    }
    if (slug) {
      const ev = await web(`/api/booking/event_types/lookup?event_type_slug=${encodeURIComponent(slug)}&profile_slug=${encodeURIComponent(link.profile)}`);
      if (ev?.uuid) {
        cfg = {
          public: true,
          canBook: false,
          eventUuid: ev.uuid,
          eventName: ev.name || 'Meeting',
          duration: ev.duration || 30,
          schedulingUrl: `https://calendly.com/${link.profile}/${slug}`,
          owner: ev.profile?.name || '',
        };
      }
    }
  } catch {
    cfg = null;
  }
  publicCache.set(key, { at: Date.now(), cfg });
  return cfg;
}

// Free times of a public link between two instants: [{ start_time, status }].
async function publicTimes(cfg, start, end) {
  const day = (t) => new Date(t).toLocaleDateString('en-CA', { timeZone: TZ });
  const data = await web(`/api/booking/event_types/${cfg.eventUuid}/calendar/range?timezone=${encodeURIComponent(TZ)}&diagnostics=false&range_start=${day(start)}&range_end=${day(end)}`);
  return (data.days || [])
    .flatMap((d) => d.spots || [])
    .filter((s) => s.status === 'available' && new Date(s.start_time).getTime() >= start && new Date(s.start_time).getTime() <= end)
    .map((s) => ({ status: 'available', start_time: new Date(s.start_time).toISOString().replace('.000Z', 'Z') }));
}

// Free start times from `from` (a YYYY-MM-DD day in India, or now) for `days` days (max 7).
// partOfDay: morning (before 12), afternoon (12–5 pm), evening (after 5 pm).
async function freeSlots(cfg, { date, partOfDay, limit = 6 } = {}) {
  const now = Date.now() + 10 * 60 * 1000;
  let start = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00+05:30`).getTime() : now;
  start = Math.max(start, now);
  const end = date ? new Date(`${date}T23:59:59+05:30`).getTime() : start + 7 * 24 * 3600 * 1000;
  if (end <= start) return [];
  const until = Math.min(end, start + 7 * 24 * 3600 * 1000 - 60000);
  let data;
  if (cfg.public) data = { collection: await publicTimes(cfg, start, until) };
  else {
    const token = await accessToken(cfg);
    const q = `event_type=${encodeURIComponent(cfg.eventType)}&start_time=${new Date(start).toISOString()}&end_time=${new Date(until).toISOString()}`;
    data = await call(token, `/event_type_available_times?${q}`);
  }
  const hour = (iso) => Number(new Date(iso).toLocaleString('en-GB', { timeZone: TZ, hour: '2-digit', hour12: false }));
  const fits = (iso) => !partOfDay || (partOfDay === 'morning' ? hour(iso) < 12 : partOfDay === 'afternoon' ? hour(iso) >= 12 && hour(iso) < 17 : partOfDay === 'evening' ? hour(iso) >= 17 : true);
  const all = (data.collection || []).filter((s) => s.status === 'available' && fits(s.start_time));
  // Spread the offers across the day rather than five back-to-back slots.
  const step = Math.max(1, Math.floor(all.length / limit));
  return all.filter((_, i) => i % step === 0).slice(0, limit).map((s) => ({ start_time: s.start_time, label: label(s.start_time) }));
}

// The location the event type is set up with, in the shape POST /invitees wants.
function locationFor(cfg, m) {
  const l = (cfg.locations || [])[0];
  if (!l) return undefined;
  if (['physical', 'custom'].includes(l.kind)) return { kind: l.kind, location: l.location || 'As agreed' };
  if (l.kind === 'outbound_call') return { kind: l.kind, location: m.whatsapp || '' };
  if (l.kind === 'ask_invitee') return { kind: l.kind, location: m.whatsapp ? `WhatsApp / phone: ${m.whatsapp}` : 'Online' };
  return { kind: l.kind };
}

// Free plan: the confirmation page of one time, with the visitor's details filled in (they tap
// "Schedule Event"). e.g. https://calendly.com/x/30min/2026-10-15T11:30:00Z?name=…&email=…
function slotLink(cfg, m) {
  const u = new URL(`${String(cfg.schedulingUrl).replace(/\/+$/, '')}/${new Date(m.startsAt).toISOString().replace('.000Z', 'Z')}`);
  if (m.name) u.searchParams.set('name', m.name);
  if (m.email) u.searchParams.set('email', m.email);
  if (m.purpose) u.searchParams.set('a1', m.purpose);
  return u.toString();
}

// Books the slot. Returns { when, joinUrl, cancelUrl, rescheduleUrl, eventUri }.
async function book(cfg, m) {
  const token = await accessToken(cfg);
  const body = {
    event_type: cfg.eventType,
    start_time: new Date(m.startsAt).toISOString(),
    invitee: { name: m.name, email: m.email, timezone: TZ, ...(/^\+\d{8,15}$/.test(m.whatsappE164 || '') ? { text_reminder_number: m.whatsappE164 } : {}) },
  };
  const loc = locationFor(cfg, m);
  if (loc) body.location = loc;
  if (cfg.questions?.length) {
    body.questions_and_answers = cfg.questions.map((q) => ({ question: q.name, position: q.position, answer: q.type === 'phone_number' ? m.whatsappE164 || m.whatsapp || '-' : m.purpose || 'Meeting set up by the AI assistant on my Aicardly card' }));
  }
  const res = await call(token, '/invitees', { method: 'POST', body });
  const inv = res.resource || {};
  let joinUrl = '';
  try {
    const ev = await call(token, `/scheduled_events/${String(inv.event || '').split('/').pop()}`);
    joinUrl = ev.resource?.location?.join_url || '';
  } catch {
    /* the invite email still has it */
  }
  return { when: label(body.start_time), joinUrl, cancelUrl: inv.cancel_url || '', rescheduleUrl: inv.reschedule_url || '', eventUri: inv.event || '' };
}

// The tool the AI calls to see free times (OpenAI Realtime format; the chat converts it for Claude).
const SLOTS_TOOL = {
  type: 'function',
  name: 'find_meeting_times',
  description: "Look up the card owner's free meeting times in their Calendly. Call it once you know which day the visitor wants (or with no date for the next free times). Returns up to 6 start times; offer 2 or 3 of them.",
  parameters: {
    type: 'object',
    properties: {
      date: { type: 'string', description: 'The day the visitor wants, as YYYY-MM-DD in India time (empty = the next free times)' },
      part_of_day: { type: 'string', enum: ['', 'morning', 'afternoon', 'evening'], description: 'Morning, afternoon or evening if the visitor said so' },
    },
    required: [],
  },
};

module.exports = { connect, freeSlots, book, slotLink, SLOTS_TOOL, label, oauthReady, oauthStart, exchangeCode, publicConfig, parseLink };
