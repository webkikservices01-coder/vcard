// A photo for services and projects that have a website link but no picture: a screenshot of
// the page (WordPress mShots), saved to Cloudinary so the card shows it at once, every time.
// mShots answers the first request with a "generating" placeholder (a 400x300 GIF from
// /mshots/v1/default) and the real screenshot a few seconds later, so this waits for it.
const background = require('./background');
const { useCloudinary } = require('./upload');

const SHOT_W = 800;
const SHOT_H = 600;
const mshotsUrl = (link) => `https://s0.wp.com/mshots/v1/${encodeURIComponent(link)}?w=${SHOT_W}&h=${SHOT_H}`;
const isWebPage = (link) => /^https?:\/\//i.test(link || '') && !/\.pdf($|[?#])/i.test(link) && !/youtu\.?be/i.test(link);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Resolves to the screenshot URL once mShots has made it, or '' after ~30 s.
async function readyShot(link) {
  const url = mshotsUrl(link);
  for (let i = 0; i < 8; i++) {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AicardlyBot/1.0)' } });
      const type = res.headers.get('content-type') || '';
      await res.arrayBuffer();
      if (res.ok && /jpe?g|png|webp/.test(type) && !/\/mshots\/v1\/default/.test(res.url)) return url;
    } catch {
      /* try again */
    }
    await sleep(4000);
  }
  return '';
}

// Screenshot → Cloudinary. Returns the stored image's URL, or '' when it couldn't be made.
async function captureShot(link) {
  if (!isWebPage(link) || !useCloudinary) return '';
  const ready = await readyShot(link);
  if (!ready) return '';
  const cloudinary = require('cloudinary').v2;
  const up = await cloudinary.uploader.upload(ready, {
    folder: `${process.env.CLOUDINARY_FOLDER || 'webcard'}/shots`,
    resource_type: 'image',
    format: 'jpg',
  });
  return up.secure_url || '';
}

// Gives every item of `docs` that has a web link and no picture a screenshot (a few at a time).
// linkField: 'link' for services/products, 'url' for portfolio projects.
async function fillShots(Model, docs, linkField) {
  const todo = docs.filter((d) => !d.coverImage && isWebPage(d[linkField])).slice(0, 24);
  // Pages shared by several items are captured once.
  const byLink = new Map();
  for (const d of todo) byLink.set(d[linkField], [...(byLink.get(d[linkField]) || []), d._id]);
  const links = [...byLink.keys()];
  let done = 0;
  const worker = async () => {
    while (links.length) {
      const link = links.shift();
      try {
        const image = await captureShot(link);
        if (image) {
          await Model.updateMany({ _id: { $in: byLink.get(link) }, coverImage: { $in: ['', null] } }, { $set: { coverImage: image } });
          done++;
        }
      } catch (err) {
        console.error('Screenshot failed:', link, err.message);
      }
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  return done;
}

// Runs after the response; the same card isn't processed twice within 10 minutes on this instance.
const recent = new Map();
function fillShotsLater(Model, docs, linkField, key) {
  if (key) {
    const at = recent.get(key);
    if (at && at > Date.now() - 10 * 60 * 1000) return;
    recent.set(key, Date.now());
    if (recent.size > 2000) recent.delete(recent.keys().next().value);
  }
  if (!docs.some((d) => !d.coverImage && isWebPage(d[linkField]))) return;
  background(fillShots(Model, docs, linkField));
}

// An image from elsewhere, copied to Cloudinary (so it never disappears or slows the card).
// Screenshots are first waited for. Without Cloudinary (local dev) the address is kept as is.
async function storeImage(url) {
  const { checkUrl } = require('./safeFetch');
  checkUrl(url);
  let src = url;
  if (/s0\.wp\.com\/mshots\/v1\//.test(url)) {
    const page = decodeURIComponent(url.split('/mshots/v1/')[1].split('?')[0]);
    src = await readyShot(page);
    if (!src) return '';
  }
  if (!useCloudinary) return src;
  const cloudinary = require('cloudinary').v2;
  const up = await cloudinary.uploader.upload(src, { folder: `${process.env.CLOUDINARY_FOLDER || 'webcard'}/imported`, resource_type: 'image', timeout: 30000 });
  return up.secure_url || '';
}

module.exports = { storeImage, readyShot, captureShot, fillShots, fillShotsLater, mshotsUrl, isWebPage };
