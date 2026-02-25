const formidable = require('formidable');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../model/User');

const JWT_SECRET = process.env.JWT_SECRET || 'kara-saaram-secret-change-in-production';
const JWT_EXPIRY = '30d'; // Extended to 30 days for better user experience

const get = (fields, key) => (Array.isArray(fields[key]) ? fields[key][0] : fields[key]);

const sendUser = (res, user, status = 200) => {
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.status(status).json({ success: true, message: status === 201 ? 'Registered successfully' : 'Login successful', token, user: { id: user.id, email: user.email, name: user.name } });
};

const login = async (req, res) => {
    const [user] = await User.findAll({ where: { email: req.auth.email } });
    if (!user || !(await bcrypt.compare(req.auth.password, user.password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    sendUser(res, user);
};

const register = (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields) => {
        if (err) return res.status(400).json({ success: false, message: 'Invalid form data' });
        const email = String(get(fields, 'email') || '').trim().toLowerCase();
        const password = String(get(fields, 'password') || '');
        const name = String(get(fields, 'name') || '').trim() || null;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
        if (password.length < 6) return res.status(400).json({ success: false, message: 'Password at least 6 characters' });
        if (await User.findOne({ where: { email } })) return res.status(400).json({ success: false, message: 'Email already registered' });
        const user = await User.create({ email, password: await bcrypt.hash(password, 10), name });
        sendUser(res, user, 201);
    });
};

module.exports = { register, login };
