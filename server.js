const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({
    verify: (req, res, buf) => { req.rawBody = buf.toString('utf8'); },
}));

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

// Routes
app.use('/api/auth',            require('./routes/auth'));
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
app.use('/api/admin',           require('./routes/admin'));

app.get('/', (req, res) => res.send('MYcardLINK API running!'));

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
