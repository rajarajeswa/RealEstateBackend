const formidable = require('formidable');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kara-saaram-secret-change-in-production';

const get = (fields, key) => (Array.isArray(fields[key]) ? fields[key][0] : fields[key]);

const parseAuthForm = (req, res, next) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        if (err) return res.status(400).json({ success: false, message: 'Invalid form data' });
        const email = String(get(fields, 'email') || '').trim().toLowerCase();
        const password = get(fields, 'password');
        const name = String(get(fields, 'name') || '').trim() || null;
        req.auth = { email, password: password != null ? String(password) : '', name };
        if (!req.auth.email || !req.auth.password) return res.status(400).json({ success: false, message: 'Email and password required' });
        next();
    });
};

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Login required to proceed' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.userId, email: decoded.email };
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
    }
};

module.exports = { parseAuthForm, verifyToken };
