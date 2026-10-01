// "Bring it from my website / channel" for the dashboard:
//   previewPhotos(url)        → pictures from the owner's site for the Gallery
//   previewTestimonials(url)  → client reviews published on their site
//   youtubeVideos(url)        → the latest videos of a YouTube channel, for Reels
// Everything is read from the owner's own pages through utils/safeFetch (public sites only).
// Reviews are picked out by AI, but each one must appear word for word on the page, so nothing
// is made up.
const { parse } = require('node-html-parser');
const { fetchPage } = require('../utils/safeFetch');
const { webLink } = require('../models/Product');
const { mshotsUrl } = require('../utils/siteShot');

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const decode = (s) => clean(s).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const siteOf = (h) => h.replace(/^www\./, '').toLowerCase();
const fail = (msg, status = 400) => Object.assign(new Error(msg), { status });

const startUrl = (raw) => {
  const link = webLink(String(raw || '').trim());
  if (!link) throw fail('Please enter your website address, e.g. yourbusiness.com');
  return link;
};
const page = async (u, opts = {}) => {
  try {
    const r = await fetchPage(u, { timeoutMs: 10000, ...opts });
    return { url: r.url, root: parse(r.html), html: r.html };
  } catch (err) {
    if (opts.required) throw err;
    return null;
  }
};

// Same-site links on a page, the ones whose address or text matches `prefer` first.
function sameSiteLinks(root, base, prefer) {
  const host = siteOf(new URL(base).hostname);
  const seen = new Set();
  const out = [];
  for (const a of root.querySelectorAll('a[href]')) {
    let u;
    try {
      u = new URL(a.getAttribute('href'), base);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(u.protocol) || siteOf(u.hostname) !== host) continue;
    u.hash = '';
    const href = u.href.replace(/\/$/, '');
    if (seen.has(href) || /\.(pdf|jpe?g|png|gif|webp|svg|zip|mp4)$/i.test(u.pathname)) continue;
    seen.add(href);
    out.push({ href, score: prefer.test(`${u.pathname} ${a.text}`) ? 1 : 0 });
  }
  return out.sort((a, b) => b.score - a.score);
}

// ─── Photos ──────────────────────────────────────────────────────────────────
const NOT_PHOTO = /(logo|icon|favicon|sprite|avatar|flag|payment|badge|loader|spinner|placeholder|blank|pixel|emoji|arrow|social|whatsapp|facebook|instagram|twitter|linkedin|youtube|google-?play|app-?store|rating|star)/i;

function photosOn(root, base) {
  const found = [];
  const add = (raw, w, h) => {
    if (!raw || /^data:/i.test(raw)) return;
    let u;
    try {
      u = new URL(decode(raw).trim(), base);
    } catch {
      return;
    }
    if (!/^https?:$/.test(u.protocol) || /\.svg($|\?)/i.test(u.pathname) || NOT_PHOTO.test(u.pathname)) return;
    if ((w && Number(w) < 200) || (h && Number(h) < 150)) return;
    found.push(u.href);
  };
  // The biggest candidate of a srcset ("a.jpg 480w, b.jpg 1200w").
  const best = (srcset) =>
    String(srcset || '')
      .split(',')
      .map((p) => p.trim().split(/\s+/))
      .filter((p) => p[0])
      .sort((a, b) => parseFloat(b[1] || '0') - parseFloat(a[1] || '0'))[0]?.[0];
  const og = root.querySelector('meta[property="og:image"]')?.getAttribute('content');
  if (og) add(og);
  for (const img of root.querySelectorAll('img')) {
    const src = best(img.getAttribute('srcset') || img.getAttribute('data-srcset')) || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('src');
    add(src, img.getAttribute('width'), img.getAttribute('height'));
  }
  for (const s of root.querySelectorAll('source[srcset]')) add(best(s.getAttribute('srcset')));
  for (const el of root.querySelectorAll('[style*="background"]')) {
    const m = /url\(\s*['"]?([^'")]+)['"]?\s*\)/i.exec(el.getAttribute('style') || '');
    if (m) add(m[1]);
  }
  return found;
}

async function previewPhotos(rawUrl) {
  const start = startUrl(rawUrl);
  const first = await page(start, { required: true });
  const origin = new URL(first.url).origin;
  const photos = [];
  const push = (list, source) => {
    for (const u of list) if (!photos.some((p) => p.url === u)) photos.push({ url: u, source });
  };
  push(photosOn(first.root, first.url), 'page');
  // Then the site's gallery / portfolio / project pages.
  const more = sameSiteLinks(first.root, first.url, /gallery|portfolio|project|work|photos?|about|interior|our-/i)
    .filter((l) => l.score)
    .slice(0, 4);
  for (const p of await Promise.all(more.map((l) => page(l.href)))) if (p) push(photosOn(p.root, p.url), 'page');
  // Sites built with JavaScript have no pictures in their HTML: use screenshots of their pages.
  let shots = false;
  if (photos.length < 4) {
    shots = true;
    const { sitemapPages } = require('./serviceImport');
    const pages = [first.url, ...(await sitemapPages(origin).catch(() => []))];
    const uniq = [...new Set(pages.map((u) => u.replace(/\/$/, '')))].slice(0, 12);
    push(uniq.map((u) => mshotsUrl(u)), 'screenshot');
  }
  if (!photos.length) throw fail("We couldn't find photos on that website. You can upload them instead.", 404);
  return { photos: photos.slice(0, 40), shots };
}

// ─── Testimonials ────────────────────────────────────────────────────────────
const pageText = (root) => {
  root.querySelectorAll('script,style,noscript,svg,nav,header,footer form').forEach((n) => n.remove());
  return clean(root.text);
};
const norm = (s) => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

async function previewTestimonials(rawUrl, anthropic, model) {
  if (!anthropic) throw fail('AI is not set up on the server yet.', 503);
  const start = startUrl(rawUrl);
  const first = await page(start, { required: true });
  const origin = new URL(first.url).origin;
  const links = sameSiteLinks(first.root, first.url, /testimonial|review|client|feedback|what.?(our|people).?say|success/i)
    .filter((l) => l.score)
    .slice(0, 3)
    .map((l) => l.href);
  const pages = [first, ...(await Promise.all(links.map((u) => page(u))))].filter(Boolean);
  let text = pages.map((p) => pageText(p.root)).join('\n\n');
  // JavaScript sites: their llms.txt often carries the reviews.
  if (text.length < 400) {
    const llms = await page(`${origin}/llms.txt`, { types: /text\/plain|markdown/i });
    if (llms) text += `\n\n${llms.html}`;
  }
  text = text.slice(0, 24000);
  if (text.length < 80) throw fail("We couldn't read that website's text.", 404);

  const res = await anthropic.messages.create({
    model,
    max_tokens: 2000,
    system:
      'You extract customer testimonials / reviews that are published on a business website. Use ONLY the page text given. ' +
      'Copy each review text exactly as written (you may cut it to its first 2–3 sentences). Never invent, merge or rephrase. ' +
      'Skip anything that is not a customer review (marketing copy, FAQs, service descriptions). ' +
      'Reply with JSON only: {"reviews":[{"name":"reviewer name or \\"\\"","review":"exact text","rating":5}]}. rating is the stars shown, else 5. Empty list if none.',
    messages: [{ role: 'user', content: `Website text:\n"""\n${text}\n"""` }],
  });
  const raw = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  let list = [];
  try {
    list = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)).reviews || [];
  } catch {
    list = [];
  }
  // Keep only reviews whose words are really on the page.
  const hay = norm(text);
  const seen = new Set();
  const reviews = list
    .map((r) => ({ name: clean(r.name).slice(0, 80), review: clean(r.review).slice(0, 600), rating: Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5))) }))
    .filter((r) => {
      const words = norm(r.review);
      if (words.length < 20 || seen.has(words)) return false;
      seen.add(words);
      // The first ~12 words must appear exactly as on the page.
      return hay.includes(words.split(' ').slice(0, 12).join(' '));
    })
    .slice(0, 20);
  if (!reviews.length) throw fail("We couldn't find client reviews on that website. You can add them by hand.", 404);
  return { reviews };
}

// ─── YouTube channel → latest videos ─────────────────────────────────────────
const YT_HOST = /(^|\.)youtube\.com$|(^|\.)youtu\.be$/i;
async function youtubeVideos(raw) {
  let input = String(raw || '').trim();
  if (/^@[\w.-]+$/.test(input)) input = `https://www.youtube.com/${input}`;
  const link = webLink(input);
  let u;
  try {
    u = new URL(link);
  } catch {
    throw fail('Please paste your YouTube channel link, e.g. youtube.com/@yourname');
  }
  if (!YT_HOST.test(u.hostname)) throw fail('Please paste a YouTube channel link, e.g. youtube.com/@yourname');
  let channelId = /\/channel\/(UC[\w-]{22})/.exec(u.pathname)?.[1];
  if (!channelId) {
    const p = await fetchPage(`https://www.youtube.com${u.pathname.replace(/\/(videos|shorts|streams|featured)\/?$/, '')}`, { timeoutMs: 10000, maxBytes: 8 * 1024 * 1024 });
    channelId =
      /<meta itemprop="identifier" content="(UC[\w-]{22})"/.exec(p.html)?.[1] ||
      /"externalId":"(UC[\w-]{22})"/.exec(p.html)?.[1] ||
      /<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})"/.exec(p.html)?.[1] ||
      /"channelId":"(UC[\w-]{22})"/.exec(p.html)?.[1];
  }
  if (!channelId) throw fail("We couldn't find that YouTube channel. Please check the link.", 404);
  const feed = await fetchPage(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, { timeoutMs: 10000, types: /xml/i });
  const videos = [...feed.html.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .map((m) => {
      const e = m[1];
      const id = /<yt:videoId>([\w-]{11})<\/yt:videoId>/.exec(e)?.[1];
      const link = /<link rel="alternate" href="([^"]+)"/.exec(e)?.[1] || '';
      return id && {
        url: /\/shorts\//.test(link) ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
        title: decode(/<title>([\s\S]*?)<\/title>/.exec(e)?.[1]).slice(0, 120),
        thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        published: /<published>([^<]+)<\/published>/.exec(e)?.[1] || '',
      };
    })
    .filter(Boolean);
  if (!videos.length) throw fail('That channel has no public videos yet.', 404);
  return { channelId, videos: videos.slice(0, 15) };
}

module.exports = { previewPhotos, previewTestimonials, youtubeVideos, photosOn };
