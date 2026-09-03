const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const header = String(req.headers.authorization || '');
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = header.slice(7).trim();
  if (!token || token.length > 4096) {
    return res.status(401).json({ success: false, message: 'Invalid authentication token' });
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'coffeecodehub-api',
      audience: 'coffeecodehub-admin'
    });
    if (!req.admin?.id || req.admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Administrator access required' });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
