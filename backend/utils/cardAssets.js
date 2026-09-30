// Final card files delivered after payment:
//  - pdf: print-quality 2-page business card (front: photo, name, role, contacts, QR; back: brand + QR)
//  - image: 2400x1260 JPG built by Cloudinary from the card photo (when the photo is on Cloudinary)
// The PDF is uploaded to Cloudinary so WhatsApp and email can fetch it by URL.
const axios = require('axios');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { cardImage } = require('./cardImage');
const { useCloudinary } = require('./upload');

const SITE = (process.env.SITE_URL || 'https://aicardly.com').replace(/\/$/, '');
const W = 504; // 3.5in x 2in business card at 2x (points)
const H = 288;
const PINK = '#E70C65';
const DARK = '#12141A';

const oneLine = (s, n) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};

// JPEG of the photo, cropped square on the face (Cloudinary), or the raw file for other hosts.
async function photoBuffer(url) {
  if (!url) return null;
  const src = /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url)
    ? url.replace('/image/upload/', '/image/upload/f_jpg,w_500,h_500,c_thumb,g_face/')
    : url;
  try {
    const { data, headers } = await axios.get(src, { responseType: 'arraybuffer', timeout: 10000 });
    return /jpe?g|png/i.test(headers['content-type'] || '') ? Buffer.from(data) : null;
  } catch {
    return null;
  }
}

function contactsOf(card, user) {
  const links = card.dynamicLinks || [];
  const find = (re) => links.find((l) => l?.url && (re.test(l.fieldType || '') || re.test(l.title || '')));
  const phone = find(/phone|mobile|call/i)?.url || user.phone || '';
  const email = (find(/mail/i)?.url || user.email || '').replace(/^mailto:/i, '');
  const web = find(/web|site/i)?.url || '';
  return { phone: phone.replace(/^tel:/i, ''), email, web: web.replace(/^https?:\/\//, '').replace(/\/$/, '') };
}

async function buildPdf(card, user) {
  const p = card.personalInfo || {};
  const url = `${SITE}/${card.username}`;
  const name = oneLine(p.name || user.name, 32);
  const role = oneLine([p.designation, p.company].filter(Boolean).join(' · '), 48);
  const c = contactsOf(card, user);
  const [photo, qr] = await Promise.all([
    photoBuffer(p.profilePic),
    QRCode.toBuffer(url, { margin: 1, width: 400, color: { dark: '#111111', light: '#FFFFFF' } }),
  ]);

  const doc = new PDFDocument({ size: [W, H], margin: 0, info: { Title: `${name} – Aicardly card`, Author: 'Aicardly' } });
  const chunks = [];
  doc.on('data', (d) => chunks.push(d));
  const done = new Promise((res) => doc.on('end', () => res(Buffer.concat(chunks))));

  // Front
  doc.rect(0, 0, W, H).fill(DARK);
  doc.rect(0, 0, 8, H).fill(PINK);
  let x = 36;
  if (photo) {
    doc.save().circle(96, 110, 58).clip().image(photo, 38, 52, { width: 116, height: 116 }).restore();
    doc.circle(96, 110, 58).lineWidth(4).stroke(PINK);
    x = 176;
  }
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(name.length > 22 ? 20 : 25).text(name, x, photo ? 70 : 60, { width: 330 - (x - 36) + 20 });
  if (role) doc.fillColor('#FF6B9D').font('Helvetica').fontSize(12).text(role, x, doc.y + 4, { width: 300 - (x - 36) + 20 });
  let y = 196;
  doc.font('Helvetica').fontSize(10).fillColor('#CBD5E1');
  for (const line of [c.phone, c.email, c.web].filter(Boolean).slice(0, 3)) {
    doc.text(line, 36, y, { width: 330 });
    y += 16;
  }
  doc.roundedRect(W - 128, H - 150, 108, 108, 8).fill('#FFFFFF');
  doc.image(qr, W - 122, H - 144, { width: 96 });
  doc.fillColor('#94A3B8').fontSize(7.5).text('Scan to save contact', W - 128, H - 36, { width: 108, align: 'center' });
  doc.fillColor(PINK).font('Helvetica-Bold').fontSize(12).text('Aicardly', W - 128, 24, { width: 108, align: 'right' });

  // Back
  doc.addPage({ size: [W, H], margin: 0 });
  doc.rect(0, 0, W, H).fill(PINK);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(30).text('AICARDLY', 40, 92);
  if (p.company) doc.font('Helvetica').fontSize(14).text(oneLine(p.company, 40), 40, 132, { width: 280 });
  doc.fontSize(11).text(url.replace(/^https?:\/\//, ''), 40, H - 56, { width: 300 });
  doc.roundedRect(W - 164, 62, 132, 132, 10).fill('#FFFFFF');
  doc.image(qr, W - 156, 70, { width: 116 });

  doc.end();
  return done;
}

function uploadPdf(buffer, publicId) {
  if (!useCloudinary) return Promise.reject(new Error('Cloudinary is not configured'));
  const cloudinary = require('cloudinary').v2;
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: 'raw', folder: 'aicardly/cards', public_id: `${publicId}.pdf`, overwrite: true }, (err, r) =>
        err ? reject(err) : resolve(r.secure_url)
      )
      .end(buffer);
  });
}

// Returns { pdfUrl, imageUrl } for a card (imageUrl '' when the photo isn't on Cloudinary).
async function buildCardAssets(card, user, orderId) {
  const p = card.personalInfo || {};
  const name = oneLine(p.name || user.name, 60);
  const role = oneLine([p.designation, p.company].filter(Boolean).join(' · '), 70);
  const imageUrl = cardImage({ photo: p.profilePic, name, role, link: `${SITE}/${card.username}`.replace(/^https?:\/\//, ''), dpr: 2 }) || '';
  const pdf = await buildPdf(card, user);
  const pdfUrl = await uploadPdf(pdf, `card-${card.username}-${orderId}`);
  return { pdfUrl, imageUrl };
}

module.exports = { buildCardAssets, buildPdf };
