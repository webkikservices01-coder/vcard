const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { POLICY_VERSION } = require('../constants/legal');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, acceptTerms } = req.body;
        // DPDP: record that the user agreed to the Terms and Privacy Policy.
        if (acceptTerms !== true) return res.status(400).json({ msg: 'Please accept the Terms & Conditions and Privacy Policy.' });

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists with this email' });

        const hashed = await bcrypt.hash(password, 10);
        const nameParts = (name || '').split(' ');
        user = new User({
            name,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email,
            phone: phone || '',
            password: hashed,
            consentAt: new Date(),
            consentVersion: POLICY_VERSION
        });
        await user.save();

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { name: user.name, email: user.email, plan: user.plan } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { name: user.name, email: user.email, plan: user.plan } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
