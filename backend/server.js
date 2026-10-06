const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
// Vercel sits in front of the app: trust its X-Forwarded-For so rate limits and logs see the real visitor IP.
app.set('trust proxy', 1);
const { requestLogger, logEvent } = require('./utils/logger');
const PORT = process.env.PORT || 5000;

// CORS_ORIGINS = comma-separated list (e.g. https://yourdomain.com,https://www.yourdomain.com).
// Unset = allow all origins (same as before).
const corsOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const siteCors = cors(corsOrigins.length ? { origin: corsOrigins } : undefined);
// The admin panel (/admin, /api/admin) has its own, stricter CORS (routes/admin/index.js).
const isAdminPath = (p) => p === '/admin' || p.startsWith('/admin/') || p.startsWith('/api/admin');
app.use((req, res, next) => (isAdminPath(req.path) ? next() : siteCors(req, res, next)));
// One log line per API request (method, path, status, ms, IP, user). See utils/logger.js.
app.use(requestLogger);

// Fix: Only apply express.json() when Content-Type is application/json so multipart/form-data uploads work perfectly
app.use((req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        return next();
    }
    express.json({
        verify: (req, res, buf) => { req.rawBody = buf.toString('utf8'); },
    })(req, res, next);
});

// Uploads directory ensure karein aur static serve karein
const uploadDir = path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
    // Read-only filesystem on Vercel; uploads go to Cloudinary there (utils/upload.js).
    console.error('Could not create uploads directory:', err.message);
}
app.use('/uploads', express.static(uploadDir));
// Brand images used in emails (the logo in every email header).
app.use('/brand', express.static(path.join(__dirname, 'assets', 'brand'), { maxAge: '7d' }));

// Admin panel pages (static build, no database needed). Switched off unless ADMIN_ENABLED=true.
const { createAdminApi, createAdminUi } = require('./routes/admin');
app.use('/admin', createAdminUi());

// On serverless (Vercel), mongoose.connect() is fire-and-forget across cold
// starts, so a request can arrive before the connection is ready and throw.
// Gate every request on the (cached, shared) connection promise instead.
let dbConnectPromise = null;
function connectDB() {
    if (mongoose.connection.readyState === 1) return Promise.resolve();
    if (!dbConnectPromise) {
        dbConnectPromise = mongoose.connect(process.env.MONGO_URI)
            .then(conn => { console.log('MongoDB Connected!'); return conn; })
            .catch(err => { dbConnectPromise = null; throw err; });
    }
    return dbConnectPromise;
}

app.use((req, res, next) => {
    connectDB().then(() => next()).catch(err => {
        console.error('MongoDB connection error:', err);
        res.status(503).json({ msg: 'Database unavailable, please retry' });
    });
});

// Warm-up ping: the site calls this on page load so a cold serverless function and its
// DB connection are ready before the user submits the login form.
// ?db=1 also times one database round trip (to see how far the database is from this server).
app.get('/api/ping', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (req.query.db !== '1') return res.json({ ok: true });
    const t = Date.now();
    await mongoose.connection.db.admin().ping();
    res.json({ ok: true, dbMs: Date.now() - t, region: process.env.VERCEL_REGION || 'local' });
});

// Routes
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/vcard',           require('./routes/vcard'));
app.use('/api/products',        require('./routes/products'));
app.use('/api/portfolio',       require('./routes/portfolio'));
app.use('/api/testimonials',    require('./routes/testimonials'));
app.use('/api/gallery',         require('./routes/gallery'));
app.use('/api/custom-sections', require('./routes/customSections'));
app.use('/api/support',         require('./routes/support'));
app.use('/api/stats',           require('./routes/stats'));
app.use('/api/settings',        require('./routes/settings'));
app.use('/api/transactions',    require('./routes/transactions'));
app.use('/api/ai',              require('./routes/ai'));
app.use('/api/ai-call',         require('./routes/aiCall'));
app.use('/api/geo',             require('./routes/geo'));
app.use('/api/admin',           createAdminApi());
app.use('/api/og',              require('./routes/og'));
app.use('/api/wedding',         require('./routes/wedding'));
app.use('/api/card-orders',     require('./routes/cardOrders'));
app.use('/api/webhooks',        require('./routes/webhooks'));
app.use('/api/cron',            require('./routes/cron'));

app.get('/', (req, res) => res.send('Aicardly API running!'));

// Anything a route didn't catch: log it and answer with JSON instead of an HTML stack trace.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    logEvent(req, 'http.exception', err.message, { level: 'error', meta: { stack: String(err.stack || '').split(/\r?\n/).slice(0, 4).join(' | ') } });
    res.status(err.status || 500).json({ msg: 'Something went wrong. Please try again.' });
});

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;