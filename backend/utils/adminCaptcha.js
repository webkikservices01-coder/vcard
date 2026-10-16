// Picture check on the admin sign-in after repeated failed attempts from one IP. No outside
// service: we draw five letters as a slightly messy SVG and sign a short-lived token with a hash
// of the answer (nothing is stored). Settings → security.captchaAfter sets when it starts.
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { adminConfig } = require('./adminConfig');

const ALPHABET = 'ABCDEFGHJKLMNPRSTUVWXYZ23456789'; // no 0/O, 1/I/L
const AUD = 'aicardly-admin-captcha';
const rnd = (a, b) => a + Math.random() * (b - a);
const hash = (code) => crypto.createHash('sha256').update(`${adminConfig().jwtSecret}:${String(code).trim().toUpperCase()}`).digest('hex');

function drawSvg(code) {
  const w = 180;
  const h = 60;
  const lines = Array.from({ length: 6 }, () => `<path d="M${rnd(0, w).toFixed(0)} ${rnd(0, h).toFixed(0)} Q ${rnd(0, w).toFixed(0)} ${rnd(0, h).toFixed(0)} ${rnd(0, w).toFixed(0)} ${rnd(0, h).toFixed(0)}" stroke="hsl(${rnd(0, 360).toFixed(0)},45%,55%)" stroke-width="${rnd(1, 2.2).toFixed(1)}" fill="none"/>`).join('');
  const dots = Array.from({ length: 30 }, () => `<circle cx="${rnd(0, w).toFixed(0)}" cy="${rnd(0, h).toFixed(0)}" r="${rnd(0.6, 1.6).toFixed(1)}" fill="hsl(${rnd(0, 360).toFixed(0)},40%,60%)"/>`).join('');
  const letters = [...code]
    .map((c, i) => {
      const x = 22 + i * 32 + rnd(-4, 4);
      const y = 40 + rnd(-6, 6);
      return `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" transform="rotate(${rnd(-24, 24).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" font-family="Verdana, Arial, sans-serif" font-size="${rnd(26, 32).toFixed(0)}" font-weight="700" fill="hsl(${rnd(200, 340).toFixed(0)},55%,32%)">${c}</text>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#f4f1f6"/>${dots}${letters}${lines}</svg>`;
}

function newCaptcha() {
  const code = Array.from({ length: 5 }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join('');
  const token = jwt.sign({ h: hash(code) }, adminConfig().jwtSecret, { expiresIn: 300, audience: AUD, algorithm: 'HS256' });
  return { token, image: `data:image/svg+xml;base64,${Buffer.from(drawSvg(code)).toString('base64')}` };
}

function checkCaptcha(token, answer) {
  try {
    const p = jwt.verify(String(token || ''), adminConfig().jwtSecret, { audience: AUD, algorithms: ['HS256'] });
    return !!answer && crypto.timingSafeEqual(Buffer.from(p.h), Buffer.from(hash(answer)));
  } catch {
    return false;
  }
}

module.exports = { newCaptcha, checkCaptcha };
