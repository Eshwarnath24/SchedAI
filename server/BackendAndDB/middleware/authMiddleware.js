const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'schedai_jwt_secret_key_2026_amrita';

/**
 * Middleware: Verify JWT token from Authorization header.
 * Attaches decoded payload to req.user.
 */
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not authorized. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Not authorized. Token is invalid or expired.' });
    }
};

/**
 * Middleware: Ensure the authenticated user is a student.
 * Must be used AFTER the `protect` middleware.
 */
const studentOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'student') {
        return res.status(403).json({ error: 'Access denied. Students only.' });
    }
    next();
};

/**
 * Middleware: Ensure the authenticated user is an Admin.
 * Must be used AFTER the `protect` middleware.
 */
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};

module.exports = { protect, studentOnly, adminOnly };
