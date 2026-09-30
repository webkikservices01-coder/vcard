// Backend logging.
//  - requestLogger: one JSON line per API request in the server logs (Vercel → Logs), with
//    method, path, status, time taken, user and IP. 5xx responses are also saved as events.
//  - logEvent: an important event (sign-up, login, email, payment, enquiry, error), printed and
//    saved to AppLog for the admin Logs page.
// Request bodies are never logged, so passwords, tokens and messages stay out of the logs.
const AppLog = require('../models/AppLog');

const clientIp = (req) =>
  String((req && (req.headers['x-forwarded-for'] || req.socket?.remoteAddress)) || '')
    .split(',')[0]
    .trim();

function logEvent(req, type, msg, { level = 'info', userId = null, email = '', meta } = {}) {
  const entry = {
    type,
    level,
    msg,
    userId: userId || req?.user?.userId || null,
    email: email ? String(email).toLowerCase() : '',
    ip: clientIp(req),
    path: req ? req.originalUrl.split('?')[0] : '',
    meta,
  };
  const line = JSON.stringify({ at: new Date().toISOString(), event: type, level, msg, email: entry.email || undefined, userId: entry.userId || undefined, meta });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
  // Saving never blocks or breaks the request.
  AppLog.create(entry).catch((err) => console.error('[logger] could not save event:', err.message));
}

function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const path = req.originalUrl.split('?')[0];
    const line = { at: new Date().toISOString(), req: `${req.method} ${path}`, status: res.statusCode, ms, ip: clientIp(req) };
    if (req.user?.userId) line.userId = req.user.userId;
    console.log(JSON.stringify(line));
    if (res.statusCode >= 500) logEvent(req, 'http.error', `${req.method} ${path} returned ${res.statusCode}`, { level: 'error', meta: { ms } });
  });
  next();
}

module.exports = { logEvent, requestLogger, clientIp };
