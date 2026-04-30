const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        const user = await User.findById(decoded.userId);
        if (!user || !user.isAdmin) return res.status(403).json({ msg: 'Admin access required' });
        next();
    } catch {
        res.status(401).json({ msg: 'Invalid token' });
    }
};
