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

// Public card contact form.
const enquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many messages. Please wait a few minutes and try again.' },
});

// Public card AI chat: each message costs a model call, so cap it per visitor IP.
const cardChatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many messages. Please wait a few minutes and try again.' },
});

// Chat feedback (NPS) and offer clicks.
const feedbackLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many requests. Please wait a few minutes and try again.' },
});

// Sign-in / sign-up attempts per IP (slows password guessing).
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many attempts. Please wait a few minutes and try again.' },
});

// Password reset emails and resets per IP.
const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many requests. Please wait a few minutes and try again.' },
});

// Card orders: new payment link / resend link / resend card (each sends email + WhatsApp).
const cardOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  // Per signed-in user (runs after auth), so people behind one office IP don't block each other.
  keyGenerator: (req) => (req.user?.userId ? `user:${req.user.userId}` : req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many requests. Please wait a few minutes and try again.' },
});

// Starting a live AI call (each one costs per minute).
const aiCallLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many calls. Please wait a while and try again.' },
});

module.exports = { aiCallLimiter, authLimiter, forgotLimiter, platformChatLimiter, platformLeadLimiter, themeLimiter, enquiryLimiter, cardChatLimiter, feedbackLimiter, cardOrderLimiter };
