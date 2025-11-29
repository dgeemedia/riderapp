// backend/lib/util.js
function normalizeIp(req) {
  // req.ip may be '::ffff:127.0.0.1' from Node - normalize to IPv4 if possible
  const ip = req.ip || (req.headers && (req.headers['x-forwarded-for'] || req.connection?.remoteAddress)) || '';
  if (!ip) return '';
  return ip.replace('::ffff:', '').replace('::1', '127.0.0.1');
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { normalizeIp, generateOtp };
