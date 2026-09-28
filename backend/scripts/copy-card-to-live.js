// Copy the card from the LOCAL database (MONGO_URI in .env) to the LIVE site,
// through the live site's normal API — the same calls the dashboard makes.
//
// Usage (PowerShell):
//   $env:LIVE_EMAIL="you@example.com"; $env:LIVE_PASSWORD="..."; node scripts/copy-card-to-live.js --replace
//
//   --replace   delete the live card's existing products / portfolio / testimonials /
//               gallery / custom sections first, so live matches local exactly.
//               A JSON backup of the live data is written to backups/ before anything is deleted.
//
// Optional env: LIVE_API (default https://backend-nine-omega-26.vercel.app),
//               LOCAL_EMAIL (which local account to copy; default = same as LIVE_EMAIL, else the only user).

require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const LIVE_API = (process.env.LIVE_API || 'https://backend-nine-omega-26.vercel.app').replace(/\/$/, '');
const { LIVE_EMAIL, LIVE_PASSWORD } = process.env;
const REPLACE = process.argv.includes('--replace');
const AI_PLANS = ['SMART AI CARD', 'AI AGENT PRO'];
const UPLOAD_DIR = path.join(__dirname, '../uploads');

let token;
async function api(method, url, body) {
    const isForm = body instanceof FormData;
    const res = await fetch(`${LIVE_API}${url}`, {
        method,
        headers: {
            ...(token ? { 'x-auth-token': token } : {}),
            ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
    const text = await res.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    if (!res.ok) {
        const err = new Error(`${method} ${url} -> ${res.status} ${typeof data === 'object' ? data.msg || JSON.stringify(data) : data}`);
        err.status = res.status;
        throw err;
    }
    return data;
}

// Attach a local /uploads/... image to a form so the live server stores it (Cloudinary).
function attachImage(form, field, imgPath) {
    if (!imgPath || !imgPath.startsWith('/uploads/')) return false;
    const file = path.join(UPLOAD_DIR, path.basename(imgPath));
    if (!fs.existsSync(file)) { console.warn(`  ! image missing locally, skipped: ${imgPath}`); return false; }
    form.append(field, new Blob([fs.readFileSync(file)]), path.basename(file));
    return true;
}

// Card-level images can also be plain http(s) URLs — those are reused as-is.
async function liveImageUrl(imgPath) {
    if (!imgPath) return '';
    if (/^https?:\/\//i.test(imgPath)) return imgPath;
    const form = new FormData();
    if (!attachImage(form, 'image', imgPath)) return '';
    return (await api('POST', '/api/vcard/upload-image', form)).url;
}

const toForm = (fields) => {
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) if (v !== undefined && v !== null) form.append(k, String(v));
    return form;
};

async function main() {
    if (!LIVE_EMAIL || !LIVE_PASSWORD) {
        console.error('Set LIVE_EMAIL and LIVE_PASSWORD (your login on the live site) first. See the top of this file.');
        process.exit(1);
    }

    // ── 1. Read everything from the local DB ─────────────────────────────────
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const localEmail = (process.env.LOCAL_EMAIL || LIVE_EMAIL).toLowerCase();
    let user = await db.collection('users').findOne({ email: localEmail });
    if (!user && !process.env.LOCAL_EMAIL && await db.collection('users').countDocuments() === 1) {
        user = await db.collection('users').findOne();
    }
    if (!user) throw new Error(`No local user with email ${localEmail} (set LOCAL_EMAIL).`);
    const card = await db.collection('vcards').findOne({ userId: user._id });
    if (!card) throw new Error('That local user has no card.');
    const byCard = (c) => db.collection(c).find({ vcardId: card._id }).sort({ order: 1, createdAt: 1 }).toArray();
    const [products, portfolios, testimonials, galleries, customSections] = await Promise.all(
        ['products', 'portfolios', 'testimonials', 'galleries', 'customsections'].map(byCard));
    const persona = await db.collection('aipersonas').findOne({ vcardId: card._id });
    const settings = await db.collection('vcardsettings').findOne({ vcardId: card._id });
    await mongoose.disconnect();
    console.log(`Local card "${card.username}" (${user.email}, plan ${user.plan}): ${products.length} products, ${portfolios.length} portfolio, ${testimonials.length} testimonials, ${galleries.length} gallery, ${customSections.length} custom sections`);

    // ── 2. Log in on the live site ───────────────────────────────────────────
    const login = await api('POST', '/api/auth/login', { email: LIVE_EMAIL, password: LIVE_PASSWORD });
    token = login.token;
    let livePlan = login.user.plan;
    console.log(`Logged in on live as ${login.user.email} (plan ${livePlan})`);

    // ── 3. Make sure the live account is on an AI plan (needed for the chatbot) ─
    if (!AI_PLANS.includes(livePlan)) {
        const wanted = AI_PLANS.includes(user.plan) ? user.plan : 'AI AGENT PRO';
        try {
            const list = await api('GET', `/api/admin/users?search=${encodeURIComponent(login.user.email)}`);
            const me = (list.users || list).find(u => u.email === login.user.email);
            await api('PUT', `/api/admin/users/${me._id}`, { plan: wanted });
            livePlan = wanted;
            console.log(`Plan changed on live: -> ${wanted}`);
        } catch (err) {
            console.warn(`  ! Could not change the plan (${err.message}). The chatbot needs Smart AI Card or AI Agent Pro — set it from the live Admin → Users page, then re-run.`);
        }
    }

    // ── 4. Backup + clear live sections (only with --replace) ────────────────
    const sections = [
        ['products', '/api/products'], ['portfolio', '/api/portfolio'], ['testimonials', '/api/testimonials'],
        ['gallery', '/api/gallery'], ['customSections', '/api/custom-sections'],
    ];
    if (REPLACE) {
        const backup = { takenAt: new Date().toISOString(), email: login.user.email };
        try { backup.card = await api('GET', '/api/vcard/me'); } catch { backup.card = null; }
        try { backup.persona = await api('GET', '/api/ai/persona'); } catch { /* none */ }
        try { backup.settings = await api('GET', '/api/settings'); } catch { /* none */ }
        for (const [name, url] of sections) {
            try { backup[name] = await api('GET', url); } catch { backup[name] = []; }
        }
        const dir = path.join(__dirname, '../backups');
        fs.mkdirSync(dir, { recursive: true });
        const file = path.join(dir, `live-backup-${Date.now()}.json`);
        fs.writeFileSync(file, JSON.stringify(backup, null, 2));
        console.log(`Backup of live data saved: ${file}`);

        for (const [name, url] of sections) {
            const items = Array.isArray(backup[name]) ? backup[name] : [];
            for (const it of items) await api('DELETE', `${url}/${it._id}`);
            if (items.length) console.log(`  removed ${items.length} old live ${name}`);
        }
    }

    // ── 5. Card profile, theme and links ─────────────────────────────────────
    const p = card.personalInfo || {};
    const cardBody = {
        title: p.name || '', designation: p.designation || '', bio: p.bio || '',
        theme: card.theme, customTheme: card.customTheme || {},
        dynamicLinks: (card.dynamicLinks || []).map(({ _id, ...l }) => l),
        profilePic: await liveImageUrl(p.profilePic),
        bannerImage: await liveImageUrl(p.bannerImage),
    };
    try {
        await api('POST', '/api/vcard', { ...cardBody, username: card.username });
    } catch (err) {
        if (err.status !== 400) throw err;
        console.warn(`  ! Username "${card.username}" is taken on live by another account — kept the live username. (${err.message})`);
        await api('POST', '/api/vcard', cardBody);
    }
    const liveCard = await api('GET', '/api/vcard/me');
    console.log(`Card profile saved (live username: ${liveCard.username})`);

    // ── 6. Sections ──────────────────────────────────────────────────────────
    for (const it of products) {
        const f = toForm({ title: it.title, description: it.description, price: it.price, link: it.link });
        attachImage(f, 'coverImage', it.coverImage);
        await api('POST', '/api/products', f);
    }
    for (const it of portfolios) {
        const f = toForm({ title: it.title, description: it.description, url: it.url });
        attachImage(f, 'coverImage', it.coverImage);
        await api('POST', '/api/portfolio', f);
    }
    for (const it of testimonials) {
        const f = toForm({ name: it.name, review: it.review, rating: it.rating });
        attachImage(f, 'photo', it.photo);
        await api('POST', '/api/testimonials', f);
    }
    for (const it of galleries) {
        const f = toForm({ type: it.type, title: it.title, url: it.type === 'image' ? undefined : it.url });
        if (it.type === 'image') attachImage(f, 'image', it.url);
        await api('POST', '/api/gallery', f);
    }
    for (const it of customSections) {
        const { _id, vcardId, __v, createdAt, updatedAt, ...rest } = it;
        await api('POST', '/api/custom-sections', rest);
    }
    console.log(`Sections copied: ${products.length} products, ${portfolios.length} portfolio, ${testimonials.length} testimonials, ${galleries.length} gallery, ${customSections.length} custom`);

    // ── 7. Card settings + AI persona (chatbot) ──────────────────────────────
    if (settings) {
        const { _id, vcardId, __v, createdAt, updatedAt, ...s } = settings;
        await api('POST', '/api/settings', s);
        console.log('Card settings saved');
    }
    if (AI_PLANS.includes(livePlan)) {
        const { enabled = true, aiName, tone, greeting, aboutText, faqs } = persona || {};
        await api('POST', '/api/ai/persona', { enabled, aiName, tone, greeting, aboutText, faqs: (faqs || []).map(({ _id, ...f }) => f) });
        const pub = await api('GET', `/api/ai/public/${liveCard.username}`);
        console.log(`AI chatbot on live card: ${pub.enabled ? 'ENABLED' : 'still disabled'}`);
    }

    console.log(`\nDone. Open the live card: /c/${liveCard.username}`);
}

main().catch(err => { console.error('\nFailed:', err.message); process.exit(1); });
