// backend/middleware/adminAuth.js
const jwt = require('jsonwebtoken');

function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing auth' });
  const token = auth.replace(/^Bearer\s*/i, '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devjwt');
    if (payload.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
    req.adminId = payload.sub;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

module.exports = adminAuth;
