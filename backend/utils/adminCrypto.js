// Small crypto helpers for the admin panel: random tokens, hashing, constant-time compare, and
// AES-256-GCM for 2FA secrets at rest (key: ADMIN_ENCRYPTION_KEY, else derived from ADMIN_JWT_SECRET).
const crypto = require('crypto');
const { adminConfig } = require('./adminConfig');

const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');
const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');

function safeEqual(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

const key = () => {
  const { encryptionKey, jwtSecret } = adminConfig();
  return crypto.createHash('sha256').update(`aicardly-admin-enc:${encryptionKey || jwtSecret}`).digest();
};

function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64url')).join('.');
}

function decrypt(box) {
  const [iv, tag, data] = String(box || '').split('.').map((p) => Buffer.from(p, 'base64url'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

module.exports = { randomToken, sha256, safeEqual, encrypt, decrypt };
