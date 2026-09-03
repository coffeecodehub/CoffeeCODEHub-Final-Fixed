const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.login = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const a = await Admin.findOne({ email, isActive: true });
    if (!a || !(await bcrypt.compare(password, a.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    a.lastLogin = new Date();
    await a.save();

    const token = jwt.sign(
      { id: String(a._id), email: a.email, role: a.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h', issuer: 'coffeecodehub-api', audience: 'coffeecodehub-admin' }
    );

    return res.json({
      success: true,
      token,
      admin: { id: a._id, name: a.name, email: a.email, role: a.role }
    });
  } catch (e) {
    console.error('Admin login error:', e.message);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

exports.me = async (req, res) => {
  const a = await Admin.findById(req.admin.id).select('-passwordHash');
  if (!a || !a.isActive) return res.status(401).json({ success: false, message: 'Admin account is unavailable' });
  res.json({ success: true, admin: a });
};
