const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        // 1. Getting token and check of it's there
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.status(401).json({ message: 'You are not logged in!' });
        }

        // 2. Verification token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET || 'secret-key-just-for-dev');

        // 3. Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ message: 'The user belonging to this token no longer does exist.' });
        }

        // Grant access to protected route
        req.user = currentUser;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }
        next();
    };
};
