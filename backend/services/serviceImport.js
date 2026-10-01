// "Import services from my website": finds the owner's services and brings each with its own link
// (opened from the card). Nothing is written by AI; everything comes from their site. Sources, in order:
//   1. the page they gave: its "Services" menu, /services/<x> links, links under that page;
//   2. their /llms.txt "Services" section (name, description, link);
//   3. their sitemap.xml (service pages; names made from the address, e.g. /ui-ux-design → UI/UX Design).
// Sites built as one-page JavaScript apps (React etc.) have no links in their HTML, so 2 and 3
// are what work for them. Each service page's own description and picture are added when the
// page has its own (not just the site-wide default every page repeats).
const { parse } = require('node-html-parser');
const { fetchPage } = require('../utils/safeFetch');
const { webLink } = require('../models/Product');

const MAX = 20;
const SERVICE_MENU = /\b(services?|treatments?|solutions?|offerings?|what we do|our work|specialit(y|ies)|procedures?|courses?|packages?)\b/i;
const SERVICE_PATH = /\/(services?|treatments?|solutions?|offerings?|procedures?|specialit(y|ies)|courses?|packages?)\/[^/?#]+/i;
// A path segment starting with one of these is never a service page.
const NOT_SERVICE_SEG = /^(about|contact|blog|news|career|job|privacy|terms|t&|t%26|tnc|refund|cancellation|shipping|disclaimer|login|signin|sign-in|register|signup|cart|checkout|account|my-account|faq|gallery|award|team|our-team|testimonial|review|tag|category|author|feed|wp-|sitemap|search|press|media|our-latest-blog|project|portfolio|case-stud|company-?profile|client|partner|thank|404|home|index)/i;
const GENERIC_TEXT = /^(read more|learn more|know more|view more|view details|details|more|click here|explore|book now|enquire now|get quote|call now|home)$/i;
const FILE = /\.(pdf|jpe?g|png|gif|webp|svg|zip|docx?|xlsx?|mp4|mp3|xml|txt)$/i;

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const decode = (s) => clean(s).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const siteOf = (h) => h.replace(/^www\./, '').toLowerCase();
const normUrl = (u) => {
  const x = new URL(u);
  x.hash = '';
  return x.href.replace(/\/$/, '');
};
const notService = (pathname) => pathname.split('/').filter(Boolean).some((seg) => NOT_SERVICE_SEG.test(decodeURIComponent(seg)));

// /ui-ux-design → "UI/UX Design", /seo → "SEO", /ai-chatbot-development → "AI Chatbot Development".
const UPPER = { seo: 'SEO', aeo: 'AEO', geo: 'GEO', ai: 'AI', ui: 'UI', ux: 'UX', smm: 'SMM', ppc: 'PPC', crm: 'CRM', erp: 'ERP', ios: 'iOS', '3d': '3D', '2d': '2D', b2b: 'B2B', b2c: 'B2C', gst: 'GST', itr: 'ITR', it: 'IT', hr: 'HR', ac: 'AC', cctv: 'CCTV', seo2: 'SEO' };
function titleFromPath(pathname) {
  const seg = decodeURIComponent(pathname.split('/').filter(Boolean).pop() || '').replace(/\.[a-z]+$/i, '');
  return seg
    .replace(/\bui-ux\b/i, 'ui/ux')
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.split('/').map((p) => UPPER[p.toLowerCase()] || p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('/'))
    .join(' ');
}

const metaOf = (root) => {
  const m = (...names) => {
    for (const n of names) {
      const el = root.querySelector(`meta[property="${n}"]`) || root.querySelector(`meta[name="${n}"]`);
      const v = decode(el?.getAttribute('content'));
      if (v) return v;
    }
    return '';
  };
  return {
    title: decode(root.querySelector('title')?.text),
    h1: clean(root.querySelector('h1')?.text),
    description: m('og:description', 'description', 'twitter:description'),
    image: m('og:image', 'twitter:image'),
  };
};

// ─── 1. Links on the page itself ─────────────────────────────────────────────
function candidatesFrom(html, pageUrl) {
  const root = parse(html);
  const page = new URL(pageUrl);
  const host = siteOf(page.hostname);
  const pagePath = page.pathname.replace(/\/$/, '');
  const found = new Map();

  const add = (a, strength) => {
    let u;
    try {
      u = new URL(a.getAttribute('href') || '', page);
    } catch {
      return;
    }
    if (!/^https?:$/.test(u.protocol) || siteOf(u.hostname) !== host) return;
    if (FILE.test(u.pathname) || notService(u.pathname)) return;
    const path = u.pathname.replace(/\/$/, '');
    if (!path || path === pagePath) return;
    const text = clean(a.text);
    const key = normUrl(u.href);
    const prev = found.get(key);
    const goodText = text.length >= 3 && text.length <= 70 && !GENERIC_TEXT.test(text) ? text : '';
    if (prev) {
      prev.strength = Math.max(prev.strength, strength);
      if (!prev.title && goodText) prev.title = goodText;
      return;
    }
    found.set(key, { link: u.href.replace(/#.*$/, ''), title: goodText, strength, order: found.size });
  };

  // A "Services" menu item with a sub-menu: everything in that sub-menu.
  for (const li of root.querySelectorAll('li')) {
    const head = li.childNodes.find((n) => n.tagName === 'A' || n.tagName === 'SPAN' || n.tagName === 'BUTTON');
    if (!head || !SERVICE_MENU.test(clean(head.text))) continue;
    const sub = li.querySelector('ul');
    if (sub) sub.querySelectorAll('a[href]').forEach((a) => add(a, 3));
  }
  // /services/<name> style links anywhere, and links below the page itself (/our-services/<name>).
  for (const a of root.querySelectorAll('a[href]')) {
    let u;
    try {
      u = new URL(a.getAttribute('href') || '', page);
    } catch {
      continue;
    }
    if (SERVICE_PATH.test(u.pathname)) add(a, 2);
    else if (pagePath && u.pathname.startsWith(pagePath + '/')) add(a, 2);
  }
  return [...found.values()].filter((c) => c.strength >= 2).sort((a, b) => b.strength - a.strength || a.order - b.order).slice(0, MAX);
}

// ─── 2. /llms.txt "Services" section ─────────────────────────────────────────
// Lines like "- [Website Design](https://site/ui-ux-design/): Award-winning UI/UX design…"
async function fromLlmsTxt(origin) {
  let text;
  try {
    ({ html: text } = await fetchPage(`${origin}/llms.txt`, { timeoutMs: 6000, maxBytes: 512 * 1024, types: /text\/(plain|markdown)|application\/octet-stream/i }));
  } catch {
    return [];
  }
  const lines = text.split(/\r?\n/);
  const out = [];
  let inServices = false;
  let level = 0;
  for (const line of lines) {
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      if (SERVICE_MENU.test(h[2])) {
        inServices = true;
        level = h[1].length;
      } else if (inServices && h[1].length <= level) inServices = false;
      continue;
    }
    if (!inServices) continue;
    const item = /^\s*[-*]\s+(?:\[([^\]]+)\]\(([^)\s]+)\)|([^:]{3,80}?))\s*(?::\s*(.*))?$/.exec(line);
    if (!item) continue;
    const title = clean(item[1] || item[3]);
    const link = webLink(item[2] || origin);
    if (!title || !link || siteOf(new URL(link).hostname) !== siteOf(new URL(origin).hostname)) continue;
    const description = clean(item[4]);
    if (!out.some((o) => o.title.toLowerCase() === title.toLowerCase())) out.push({ title, description, link, image: '' });
    if (out.length >= MAX) break;
  }
  return out;
}

// ─── 3. sitemap.xml ──────────────────────────────────────────────────────────
async function sitemapUrls(origin) {
  const get = async (u) => {
    try {
      return (await fetchPage(u, { timeoutMs: 6000, maxBytes: 3 * 1024 * 1024, types: /xml|text\/plain/i })).html;
    } catch {
      return '';
    }
  };
  const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => decode(m[1]));
  const xml = await get(`${origin}/sitemap.xml`);
  if (!xml) return [];
  if (/<sitemapindex/i.test(xml)) {
    // An index: read the child sitemaps most likely to hold pages (at most 3).
    const children = locs(xml).sort((a, b) => Number(/page|service/i.test(b)) - Number(/page|service/i.test(a))).slice(0, 3);
    return (await Promise.all(children.map(get))).flatMap(locs);
  }
  return locs(xml);
}

async function fromSitemap(origin) {
  const host = siteOf(new URL(origin).hostname);
  const urls = [];
  for (const raw of await sitemapUrls(origin)) {
    let u;
    try {
      u = new URL(raw);
    } catch {
      continue;
    }
    if (siteOf(u.hostname) !== host || FILE.test(u.pathname) || notService(u.pathname)) continue;
    const path = u.pathname.replace(/\/$/, '');
    if (!path) continue;
    if (!urls.some((x) => normUrl(x.href) === normUrl(u.href))) urls.push(u);
  }
  // Prefer /services/<x> pages; otherwise a small site's top-level pages are its services.
  const inServices = urls.filter((u) => SERVICE_PATH.test(u.pathname));
  const topLevel = urls.filter((u) => u.pathname.split('/').filter(Boolean).length === 1);
  const pick = inServices.length ? inServices : topLevel.length <= 40 ? topLevel : [];
  return pick.slice(0, MAX).map((u) => ({ title: titleFromPath(u.pathname), description: '', link: u.href, image: '' }));
}

// ─── Details from each service page ──────────────────────────────────────────
async function enrich(c, siteDefaults) {
  try {
    const { url, html } = await fetchPage(c.link, { timeoutMs: 6000, maxBytes: 2 * 1024 * 1024 });
    const m = metaOf(parse(html));
    // A single-page app sends the same title/description/picture for every address: ignore those.
    const own = (v, d) => (v && v !== d ? v : '');
    const titleTag = own(m.title, siteDefaults.title).split(/\s[|–—-]\s/)[0];
    const desc = c.description || own(m.description, siteDefaults.description);
    let image = c.image || own(m.image, siteDefaults.image);
    if (image) image = webLink(new URL(image, url).href);
    return {
      title: (c.title || own(m.h1, siteDefaults.h1) || titleTag || titleFromPath(new URL(c.link).pathname)).slice(0, 80),
      description: desc.length > 300 ? `${desc.slice(0, 297).replace(/\s+\S*$/, '')}…` : desc,
      link: webLink(c.link),
      image: image || '',
    };
  } catch {
    return { title: c.title || titleFromPath(new URL(c.link).pathname), description: c.description || '', link: webLink(c.link), image: c.image || '' };
  }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const k = i++;
        out[k] = await fn(items[k]);
      }
    })
  );
  return out;
}

async function previewServices(rawUrl) {
  const start = webLink(rawUrl);
  if (!start) throw Object.assign(new Error('Please enter your website link, e.g. https://yourwebsite.com/services'), { status: 400 });
  // Small business sites can be slow: the page the owner gave gets a little more time.
  const { url, html } = await fetchPage(start, { timeoutMs: 12000 });
  const origin = new URL(url).origin;
  const root = parse(html);
  const siteDefaults = metaOf(root);
  const linkCount = root.querySelectorAll('a[href]').length;

  let source = 'page';
  let found = candidatesFrom(html, url);
  if (!found.length) {
    source = 'llms';
    found = await fromLlmsTxt(origin);
    // llms.txt sometimes points a service at the homepage although the site has a page for it
    // (e.g. "AI Chatbot Development" → /ai-chatbot-development/): use that page instead.
    const home = webLink(origin);
    if (found.some((f) => f.link === home)) {
      const pages = (await sitemapUrls(origin).catch(() => [])).map((u) => webLink(u)).filter(Boolean);
      // Words in common between the service name and the page address; the page must share at
      // least two words and be the one clear best match (otherwise the homepage link stays).
      const words = (s) => new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !['and', 'the', 'for', 'of', 'based', 'powered'].includes(w)));
      const pageWords = pages.map((p) => ({ p, w: words(new URL(p).pathname.split('/').filter(Boolean).pop() || '') }));
      for (const f of found) {
        if (f.link !== home) continue;
        const want = words(f.title);
        const scored = pageWords
          .map(({ p, w }) => {
            const common = [...want].filter((x) => w.has(x)).length;
            return { p, common, score: common / new Set([...want, ...w]).size };
          })
          .filter((x) => x.common >= 2)
          .sort((a, b) => b.score - a.score);
        if (scored.length && (scored.length === 1 || scored[0].score > scored[1].score)) f.link = scored[0].p;
      }
    }
  }
  if (!found.length) {
    source = 'sitemap';
    found = await fromSitemap(origin);
  }
  if (!found.length) {
    throw Object.assign(new Error("We couldn't find service pages on that link. Try the page of your website that lists your services."), { status: 404 });
  }
  // A JavaScript-built site repeats one set of details on every page: only look for pictures
  // and descriptions page by page when the site has real links in its HTML.
  const services = linkCount >= 3 ? await mapLimit(found, 5, (c) => enrich(c, siteDefaults)) : found.map((c) => ({ title: c.title || titleFromPath(new URL(c.link).pathname), description: c.description || '', link: webLink(c.link), image: c.image || '' }));
  return { source, services: services.filter((s) => s.title && s.link) };
}

// Page addresses from sitemap.xml (no files), same site only.
async function sitemapPages(origin) {
  const host = siteOf(new URL(origin).hostname);
  return (await sitemapUrls(origin)).filter((u) => {
    try {
      const x = new URL(u);
      return siteOf(x.hostname) === host && !FILE.test(x.pathname);
    } catch {
      return false;
    }
  });
}

module.exports = { previewServices, candidatesFrom, titleFromPath, sitemapPages };
