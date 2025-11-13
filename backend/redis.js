// backend/redis.js
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL); // e.g. Upstash REDIS REST or tls://... url

module.exports = redis;
