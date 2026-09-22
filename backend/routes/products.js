const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const auth = require('../middleware/auth');
const Product = require('../models/Product');
const vCard = require('../models/vCard');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Helper: Get or Automatically Create vCard if missing so product saving never fails
const getOrCreateCardId = async (userId) => {
    let card = await vCard.findOne({ userId });
    if (!card) {
        card = new vCard({
            userId,
            username: `user_${userId.toString().slice(-6)}`,
            personalInfo: { name: 'My Profile', designation: 'Professional' }
        });
        await card.save();
    }
    return card._id;
};

// GET all products
router.get('/', auth, async (req, res) => {
    try {
        const vcardId = await getOrCreateCardId(req.user.userId);
        const items = await Product.find({ vcardId }).sort('order');
        res.json(items);
    } catch (err) { 
        console.error('Get Products Error:', err);
        res.status(500).send('Server Error'); 
    }
});

// POST create product (Single clean handler)
router.post('/', [auth, upload.single('coverImage')], async (req, res) => {
    try {
        const vcardId = await getOrCreateCardId(req.user.userId);
        
        const { title, description, price, link } = req.body;
        const coverImage = req.file ? `/uploads/${req.file.filename}` : '';
        
        const count = await Product.countDocuments({ vcardId });
        const item = new Product({ 
            vcardId, 
            title, 
            description, 
            price, 
            coverImage, 
            link, 
            order: count 
        });
        
        await item.save();
        res.json(item);
    } catch (err) { 
        console.error('Product Save Error:', err); 
        res.status(500).json({ msg: 'Server Error saving product', error: err.message }); 
    }
});

// PUT update product
router.put('/:id', [auth, upload.single('coverImage')], async (req, res) => {
    try {
        const { title, description, price, link } = req.body;
        const update = { title, description, price, link };
        
        if (req.file) {
            update.coverImage = `/uploads/${req.file.filename}`;
        }
        
        const item = await Product.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
        res.json(item);
    } catch (err) { 
        console.error('Product Update Error:', err);
        res.status(500).send('Server Error'); 
    }
});

// DELETE product
router.delete('/:id', auth, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Deleted' });
    } catch (err) { 
        console.error('Product Delete Error:', err);
        res.status(500).send('Server Error'); 
    }
});

module.exports = router;