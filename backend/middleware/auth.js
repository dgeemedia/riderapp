// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing auth' });
  const token = auth.replace(/^Bearer\s*/i, '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devjwt');
    req.riderId = payload.sub;
    req._authPayload = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

module.exports = authMiddleware;
