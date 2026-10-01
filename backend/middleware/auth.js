const jwt = require('jsonwebtoken');
const { accountStatus } = require('../utils/accountStatus');

const DENIED = {
    blocked: 'Your account has been blocked. Please contact support.',
    removed: 'This account no longer exists.',
    missing: 'Please sign in again.',
    inactive: 'This account is inactive. Please contact support.',
    revoked: 'Your password was changed. Please sign in again.',
};

// Site users only (x-auth-token signed with JWT_SECRET). Admin panel tokens never work here:
// they are signed with a different secret and carry typ "admin" (see middleware/admin/).
module.exports = async function(req, res, next) {
    // Header se token nikalna
    const token = req.header('x-auth-token');

    // Agar token nahi hai
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    let decoded;
    try {
        // Token verify karna
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ msg: 'Token is not valid' });
    }
    if (!decoded || decoded.typ === 'admin' || !decoded.userId) {
        return res.status(401).json({ msg: 'Token is not valid' });
    }

    // Blocked / removed from the admin panel: stops working at once, even with a valid token.
    try {
        const status = await accountStatus(decoded.userId, decoded.iat);
        if (status !== 'ok') {
            return res.status(status === 'missing' || status === 'revoked' ? 401 : 403).json({ msg: DENIED[status], code: `ACCOUNT_${status.toUpperCase()}` });
        }
    } catch (err) {
        return res.status(503).json({ msg: 'Please try again in a moment.' });
    }

    req.user = decoded; // req.user mein userId save ho jayega
    next();
};
