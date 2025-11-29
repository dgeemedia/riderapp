// backend/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const db = require('./db');
const redis = require('./redis'); // ioredis client instance
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit'); // IPv6-safe key helper
const twilio = require('twilio');
const axios = require('axios');
const admin = require('firebase-admin');

// Firebase Admin init
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  try {
    const sa = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString());
    admin.initializeApp({
      credential: admin.credential.cert(sa)
    });
  } catch (err) {
    console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:', err.message || err);
  }
}

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM;
const twilioClient = (TWILIO_SID && TWILIO_TOKEN) ? twilio(TWILIO_SID, TWILIO_TOKEN) : null;

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ==================== RATE LIMITER ====================
let RedisStore;
try {
  RedisStore = require('rate-limit-redis').default; // Node Redis/ioredis compatible
} catch (err) {
  RedisStore = null;
}

let redisRateLimitStore = null;
if (RedisStore && redis) {
  try {
    // Using ioredis call binding
    redisRateLimitStore = new RedisStore({
      sendCommand: redis.call.bind(redis)
    });
  } catch (err) {
    console.warn('RedisStore not initialized, falling back to MemoryStore:', err.message || err);
  }
}

// OTP rate limiter
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many OTP requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisRateLimitStore || undefined, // fallback to MemoryStore
  keyGenerator: (req) => {
    if (req.body && req.body.phone) return `otp:${req.body.phone}`;
    return ipKeyGenerator(req); // IPv6-safe fallback
  }
});

// ==================== HELPER ====================
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==================== ROUTES ====================

// POST /api/auth/otp
app.post('/api/auth/otp', otpLimiter, async (req, res) => {
  const { phone, provider = 'twilio' } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });

  const code = generateOtp();

  try {
    if (redis && typeof redis.set === 'function') {
      await redis.set(`otp:${phone}`, code, 'EX', 300);
    }
  } catch (err) {
    console.warn('Redis error setting otp:', err.message || err);
  }

  try {
    if (provider === 'termii' && process.env.TERMII_API_KEY) {
      await axios.post('https://api.ng.termii.com/api/sms/send', {
        to: phone,
        from: 'D-RIDERS',
        sms: `Your D-Riders code is ${code}`,
        type: 'plain'
      }, {
        headers: { Authorization: `Bearer ${process.env.TERMII_API_KEY}` }
      });
    } else if (twilioClient) {
      await twilioClient.messages.create({
        body: `Your D-Riders login code is ${code}`,
        from: TWILIO_FROM,
        to: phone
      });
    } else {
      console.log(`OTP for ${phone}: ${code} (no SMS provider configured)`);
    }
    return res.json({ ok: true, msg: 'OTP sent' });
  } catch (err) {
    console.error('sms send error', err?.response?.data || err.message);
    return res.status(500).json({ error: 'failed to send OTP' });
  }
});

// POST /api/auth/verify
app.post('/api/auth/verify', async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'phone and code required' });

  let stored = null;
  try {
    if (redis && typeof redis.get === 'function') {
      stored = await redis.get(`otp:${phone}`);
    }
  } catch (err) {
    console.warn('Redis error getting otp:', err.message || err);
  }

  if (!stored || stored !== code) return res.status(401).json({ error: 'invalid or expired code' });

  try {
    if (redis && typeof redis.del === 'function') {
      await redis.del(`otp:${phone}`);
    }
  } catch (err) {
    console.warn('Redis error deleting otp:', err.message || err);
  }

  let rider;
  try {
    const find = await db.query('SELECT * FROM riders WHERE phone = $1 LIMIT 1', [phone]);
    if (find.rows.length) rider = find.rows[0];
    else {
      const insert = await db.query('INSERT INTO riders (phone) VALUES ($1) RETURNING *', [phone]);
      rider = insert.rows[0];
    }
  } catch (err) {
    console.error('DB error in verify:', err.message || err);
    return res.status(500).json({ error: 'server error' });
  }

  const token = jwt.sign({ sub: rider.id, phone }, process.env.JWT_SECRET || 'devjwt', { expiresIn: '7d' });
  return res.json({ token, rider });
});

// Auth middleware
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing auth' });
  const token = auth.replace(/^Bearer\s*/i, '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devjwt');
    req.riderId = payload.sub;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// Rider location
app.post('/api/riders/location', authMiddleware, async (req, res) => {
  const { lat, lng, accuracy } = req.body;
  const riderId = req.riderId;

  try {
    await db.query('INSERT INTO rider_locations (rider_id, lat, lng, accuracy) VALUES ($1,$2,$3,$4)', [riderId, lat, lng, accuracy]);
  } catch (err) {
    console.error('DB error inserting rider location:', err.message || err);
  }

  try {
    if (redis && typeof redis.set === 'function') {
      await redis.set(`rider:last:${riderId}`, JSON.stringify({ lat, lng, accuracy, at: Date.now() }), 'EX', 60 * 60 * 24);
    }
  } catch (err) {
    console.warn('Redis error setting last location:', err.message || err);
  }

  io.to('admin').emit('location:update', { riderId, lastLocation: { lat, lng, accuracy, at: Date.now() }});
  return res.json({ ok: true });
});

// Admin riders
app.get('/api/admin/riders', async (req, res) => {
  try {
    const rows = (await db.query('SELECT id, phone, name, created_at FROM riders ORDER BY created_at DESC LIMIT 100')).rows;
    const enriched = await Promise.all(rows.map(async r => {
      try {
        if (redis && typeof redis.get === 'function') {
          const cached = await redis.get(`rider:last:${r.id}`);
          r.lastLocation = cached ? JSON.parse(cached) : null;
        } else r.lastLocation = null;
      } catch {
        r.lastLocation = null;
      }
      return r;
    }));
    res.json(enriched);
  } catch (err) {
    console.error('DB error fetching riders:', err.message || err);
    res.status(500).json({ error: 'server error' });
  }
});

// Push notifications
async function sendPushToFcm(token, payload) {
  if (!admin.apps.length) return;
  const message = { token, notification: { title: payload.title, body: payload.body }, data: payload.data || {} };
  return admin.messaging().send(message);
}

// ==================== SOCKET.IO ====================
io.use((socket, next) => {
  const { token, role } = socket.handshake.auth || {};
  if (role === 'admin') { socket.role = 'admin'; return next(); }
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devjwt');
    socket.riderId = payload.sub;
    socket.role = 'rider';
    return next();
  } catch { return next(); }
});

io.on('connection', (socket) => {
  if (socket.role === 'admin') {
    socket.join('admin');
    console.log('admin connected', socket.id);
  } else if (socket.role === 'rider') {
    const rid = socket.riderId;
    socket.join('rider:' + rid);
    try { if (redis && typeof redis.set === 'function') redis.set(`socket:rider:${rid}`, socket.id, 'EX', 60*60*24); } 
    catch (err) { console.warn('Redis error storing socket mapping:', err.message || err); }
    console.log('rider connected', rid);
  }

  socket.on('disconnect', () => {
    if (socket.role === 'rider') {
      try { if (redis && typeof redis.del === 'function') redis.del(`socket:rider:${socket.riderId}`); } 
      catch (err) { console.warn('Redis error deleting socket mapping:', err.message || err); }
    }
  });

  socket.on('task:accept', (data) => io.to('admin').emit('task:accepted', { riderId: socket.riderId, taskId: data?.taskId || null }));
  socket.on('ping', (msg) => { if (socket.role === 'admin' && msg?.riderId) io.to('rider:' + msg.riderId).emit('ping', { message: msg.message || 'Ping from dispatch' }); });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log('Backend listening on', PORT));
