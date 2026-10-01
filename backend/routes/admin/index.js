// Admin panel: API under /api/admin and the panel itself (ADMIN app, built into admin-ui/)
// under /admin. Separate from the site's user API in every way: own accounts (models/Admin.js),
// own JWT secret, own cookies, own CORS, CSRF and security headers. See README "Admin panel".
const path = require('path');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const { adminEnabled, ipAllowlist, adminHelmet, adminCors, noStore, csrfProtect } = require('../../middleware/admin/security');
const { requireAdmin } = require('../../middleware/admin/auth');
const { logEvent } = require('../../utils/logger');

function createAdminApi() {
  const router = express.Router();
  router.use(adminEnabled, ipAllowlist, adminHelmet, adminCors, cookieParser(), noStore, csrfProtect);

  router.use('/auth', require('./auth'));

  // Everything below needs a signed-in admin; each route also checks its permission.
  router.use(requireAdmin);
  router.use('/dashboard', require('./dashboard'));
  router.use('/users', require('./users'));
  router.use('/cards', require('./cards'));
  router.use('/payments', require('./payments'));
  router.use('/plans', require('./plans'));
  router.use('/admins', require('./admins'));
  router.use('/leads', require('./leads'));
  router.use('/', require('./activity'));

  router.use((req, res) => res.status(404).json({ msg: 'Not found' }));
  // eslint-disable-next-line no-unused-vars
  router.use((err, req, res, next) => {
    logEvent(req, 'admin.exception', err.message, { level: 'error', meta: { stack: String(err.stack || '').split(/\r?\n/).slice(0, 4).join(' | ') } });
    res.status(err.status && err.status < 500 ? err.status : 500).json({ msg: err.status && err.status < 500 ? err.message : 'Something went wrong.' });
  });
  return router;
}

const UI_DIR = path.join(__dirname, '..', '..', 'admin-ui');

function createAdminUi() {
  const router = express.Router();
  router.use(adminEnabled, ipAllowlist, adminHelmet);
  // Hashed build files: cache for a year. index.html: never cached.
  router.use('/assets', express.static(path.join(UI_DIR, 'assets'), { immutable: true, maxAge: '1y', fallthrough: false }));
  router.use(express.static(UI_DIR, { index: false, maxAge: '1h' }));
  router.use((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(404).end();
    const index = path.join(UI_DIR, 'index.html');
    if (!fs.existsSync(index)) return res.status(503).type('text').send('Admin panel is not built yet. Run "npm run build" in the ADMIN folder.');
    res.set('Cache-Control', 'no-store');
    res.sendFile(index);
  });
  return router;
}

module.exports = { createAdminApi, createAdminUi };
