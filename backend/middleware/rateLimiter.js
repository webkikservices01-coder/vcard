const rateLimit = require('express-rate-limit');

// Public, unauthenticated AI endpoints (unlike the rest of the API, which is
// either auth-gated or plan-gated) — this is the only abuse guard they get.
const platformChatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many messages. Please wait a few minutes and try again.' },
});

const platformLeadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many requests. Please wait a few minutes and try again.' },
});

const themeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many theme requests. Please wait a few minutes and try again.' },
});

module.exports = { platformChatLimiter, platformLeadLimiter, themeLimiter };
