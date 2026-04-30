const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Header se token nikalna
    const token = req.header('x-auth-token');

    // Agar token nahi hai
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Token verify karna
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // req.user mein userId save ho jayega
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};