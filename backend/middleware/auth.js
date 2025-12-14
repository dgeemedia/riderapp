// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

// Generic auth middleware that can handle multiple roles
const authMiddleware = (allowedRoles = []) => {
  // If allowedRoles is a string, convert to array
  if (typeof allowedRoles === 'string') {
    allowedRoles = [allowedRoles];
  }
  
  return (req, res, next) => {
    try {
      const authHeader = req.headers?.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
      }
      
      const token = authHeader.replace(/^Bearer\s*/i, '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      // Verify token
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'devjwt');
      
      // Check if user has required role
      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      // Attach user info to request
      req.user = {
        id: payload.sub,
        role: payload.role
      };
      
      // For backward compatibility
      if (payload.role === 'rider') {
        req.riderId = payload.sub;
      }
      
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
};

module.exports = authMiddleware;