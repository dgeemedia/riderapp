// backend/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');
let RedisStore;
try {
  RedisStore = require('rate-limit-redis').default;
} catch (e) {
  RedisStore = null;
}
const redis = require('../redis');
const { normalizeIp } = require('../lib/util');

function tryCreateRedisStore() {
  if (!RedisStore || !redis) return null;
  try {
    // rate-limit-redis expects sendCommand; adapt to ioredis.call
    return new RedisStore({
      sendCommand: (...args) => {
        // args is array like ["SCRIPT","LOAD", script]
        const cmd = args[0];
        const rest = args.slice(1);
        // ioredis.call(cmd, ...rest)
        return redis.call(cmd, ...rest);
      }
    });
  } catch (err) {
    console.warn('Could not create Redis rate-limit store:', err.message || err);
    return null;
  }
}

const redisStore = tryCreateRedisStore();

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many OTP requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore || undefined,
  keyGenerator: (req) => {
    if (req.body && req.body.phone) return `otp:${req.body.phone}`;
    return `ip:${normalizeIp(req)}`;
  }
});

module.exports = otpLimiter;
