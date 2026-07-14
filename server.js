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

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected!'))
    .catch(err => console.log('MongoDB Error:', err));

app.get('/', (req, res) => res.send('MYcardLINK API running!'));

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
