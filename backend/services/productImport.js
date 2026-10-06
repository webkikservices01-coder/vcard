// "Import products from my website": brings the owner's products (name, picture, price, link and a
// short description) from their own online shop. Nothing is written by AI. Sources, in order:
//   1. Shopify stores: /products.json
//   2. WooCommerce (WordPress) stores: the public Store API /wp-json/wc/store/v1/products
//   3. Product details published on the page itself (schema.org Product / ItemList in JSON-LD)
//   4. Product pages linked from the page or listed in the sitemap (/product/…, /products/…, /shop/…),
//      each read for its schema.org Product data or og:/product: price tags.
const { parse } = require('node-html-parser');
const { fetchPage } = require('../utils/safeFetch');
const { webLink } = require('../models/Product');
const { sitemapPages } = require('./serviceImport');

const MAX = 30;
const PRODUCT_PATH = /\/(products?|shop|store|item|items|p)\/[^/?#]+/i;
const FILE = /\.(pdf|jpe?g|png|gif|webp|svg|zip|docx?|xlsx?|mp4|mp3|xml|txt)$/i;

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const text = (html) => clean(parse(`<div>${String(html || '')}</div>`).text);
const short = (s, n = 300) => {
  const t = clean(s);
  return t.length > n ? `${t.slice(0, n - 3).replace(/\s+\S*$/, '')}…` : t;
};
const siteOf = (h) => h.replace(/^www\./, '').toLowerCase();
// "₹1,499.00" / "1499" / 1499 → "1499"; "1499.5" → "1499.50"; nothing usable → "".
const priceOf = (v) => {
  const n = Number(String(v ?? '').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return '';
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};
const abs = (u, base) => {
  try {
    return webLink(new URL(u, base).href);
  } catch {
    return '';
  }
};
const item = ({ title, description, price, image, link }, base) => ({
  title: clean(title).slice(0, 120),
  description: short(description),
  price: priceOf(price),
  image: image ? abs(image, base) : '',
  link: link ? abs(link, base) : '',
});
const json = async (u) => {
  try {
    const { html } = await fetchPage(u, { timeoutMs: 8000, maxBytes: 4 * 1024 * 1024, types: /json/i });
    return JSON.parse(html);
  } catch {
    return null;
  }
};

// ─── 1. Shopify ──────────────────────────────────────────────────────────────
async function fromShopify(origin) {
  const data = await json(`${origin}/products.json?limit=${MAX}`);
  if (!Array.isArray(data?.products)) return [];
  return data.products.map((p) =>
    item(
      {
        title: p.title,
        description: text(p.body_html),
        price: p.variants?.[0]?.price,
        image: p.images?.[0]?.src || p.image?.src,
        link: `${origin}/products/${p.handle}`,
      },
      origin
    )
  );
}

// ─── 2. WooCommerce ──────────────────────────────────────────────────────────
async function fromWoo(origin) {
  const data = await json(`${origin}/wp-json/wc/store/v1/products?per_page=${MAX}`);
  if (!Array.isArray(data)) return [];
  return data.map((p) => {
    const minor = Number(p.prices?.currency_minor_unit ?? 2);
    const raw = Number(p.prices?.sale_price || p.prices?.price);
    return item(
      {
        title: text(p.name),
        description: text(p.short_description || p.description),
        price: Number.isFinite(raw) && raw > 0 ? raw / 10 ** minor : '',
        image: p.images?.[0]?.src,
        link: p.permalink,
      },
      origin
    );
  });
}

// ─── 3. schema.org data on a page ────────────────────────────────────────────
function ldNodes(root) {
  const out = [];
  const walk = (n) => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(walk);
    out.push(n);
    if (n['@graph']) walk(n['@graph']);
    if (n.itemListElement) walk(n.itemListElement);
    if (n.item) walk(n.item);
  };
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      walk(JSON.parse(s.text));
    } catch {
      /* broken JSON-LD */
    }
  }
  return out;
}
const isProduct = (n) => [].concat(n['@type'] || []).some((t) => /^(Product|ProductGroup|IndividualProduct)$/i.test(t));
const offerPrice = (o) => {
  const first = [].concat(o || [])[0] || {};
  return first.price ?? first.lowPrice ?? first.priceSpecification?.price ?? '';
};
const ldImage = (img) => {
  const first = [].concat(img || [])[0];
  return typeof first === 'string' ? first : first?.url || first?.contentUrl || '';
};
function productsOnPage(root, url) {
  return ldNodes(root)
    .filter(isProduct)
    .map((n) => item({ title: n.name, description: n.description, price: offerPrice(n.offers), image: ldImage(n.image), link: n.url || n['@id'] || url }, url))
    .filter((p) => p.title);
}

// ─── 4. Product pages ────────────────────────────────────────────────────────
function productLinks(root, base) {
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
    if (!/^https?:$/.test(u.protocol) || siteOf(u.hostname) !== host || FILE.test(u.pathname) || !PRODUCT_PATH.test(u.pathname)) continue;
    if (/\/(cart|checkout|account|category|categories|tag|collections?)\b/i.test(u.pathname) && !/\/products?\//i.test(u.pathname)) continue;
    u.hash = '';
    u.search = '';
    if (seen.has(u.href)) continue;
    seen.add(u.href);
    out.push(u.href);
  }
  return out;
}
async function readProductPage(link) {
  try {
    const { url, html } = await fetchPage(link, { timeoutMs: 7000, maxBytes: 2 * 1024 * 1024 });
    const root = parse(html);
    const fromLd = productsOnPage(root, url)[0];
    if (fromLd) return { ...fromLd, link: webLink(url) };
    const meta = (...names) => {
      for (const n of names) {
        const v = root.querySelector(`meta[property="${n}"]`)?.getAttribute('content') || root.querySelector(`meta[name="${n}"]`)?.getAttribute('content');
        if (v) return clean(v);
      }
      return '';
    };
    const price = meta('product:price:amount', 'og:price:amount');
    const title = meta('og:title') || clean(root.querySelector('h1')?.text) || clean(root.querySelector('title')?.text);
    if (!title || !price) return null; // without a price it is probably not a product page
    return item({ title: title.split(/\s[|–—]\s/)[0], description: meta('og:description', 'description'), price, image: meta('og:image'), link: url }, url);
  } catch {
    return null;
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

const dedupe = (list) => {
  const seen = new Set();
  return list.filter((p) => {
    const k = `${p.link}|${p.title.toLowerCase()}`;
    if (!p.title || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

async function previewProducts(rawUrl) {
  const start = webLink(rawUrl);
  if (!start) throw Object.assign(new Error('Please enter your website or shop link, e.g. https://yourshop.com'), { status: 400 });
  const { url, html } = await fetchPage(start, { timeoutMs: 12000 });
  const origin = new URL(url).origin;
  const root = parse(html);

  const shop = await fromShopify(origin);
  if (shop.length) return { source: 'shopify', products: dedupe(shop).slice(0, MAX) };
  const woo = await fromWoo(origin);
  if (woo.length) return { source: 'woocommerce', products: dedupe(woo).slice(0, MAX) };

  const onPage = productsOnPage(root, url);
  if (onPage.length >= 2) return { source: 'page', products: dedupe(onPage).slice(0, MAX) };

  let links = productLinks(root, url);
  let source = 'pages';
  if (!links.length) {
    links = (await sitemapPages(origin).catch(() => [])).filter((u) => PRODUCT_PATH.test(new URL(u).pathname));
    source = 'sitemap';
  }
  const pages = (await mapLimit(links.slice(0, MAX), 5, readProductPage)).filter(Boolean);
  const products = dedupe([...onPage, ...pages]).slice(0, MAX);
  if (!products.length) {
    throw Object.assign(new Error("We couldn't find products on that link. Try your shop or products page (Shopify, WooCommerce and most online shops work)."), { status: 404 });
  }
  return { source, products };
}

module.exports = { previewProducts };
