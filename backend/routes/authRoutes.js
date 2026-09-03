const r = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/authController');
const auth = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' }
});

r.post('/login', loginLimiter, c.login);
r.get('/me', auth, c.me);

module.exports = r;
