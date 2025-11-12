require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// In-memory stores for starter
const otps = {};         // phone -> code
const riders = {};       // riderId -> {id, phone, name, lastLocation}
const socketsByRider = {}; // riderId -> socket.id

// Simple OTP endpoint (no SMS provider - you must wire Twilio/Termii)
app.post('/api/auth/otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otps[phone] = { code, expiresAt: Date.now() + (5*60*1000) };
  console.log('OTP for', phone, code);
  // TODO: send SMS with your provider
  return res.json({ ok: true, msg: 'OTP generated (check backend logs in this starter).' });
});

// Verify OTP
app.post('/api/auth/verify', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'phone and code required' });
  const entry = otps[phone];
  if (!entry || entry.code !== code || entry.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'invalid or expired code' });
  }
  delete otps[phone];
  // create or find rider
  let rider = Object.values(riders).find(r => r.phone === phone);
  if (!rider) {
    const id = 'r_' + Math.random().toString(36).slice(2,10);
    rider = { id, phone, name: null, lastLocation: null };
    riders[id] = rider;
  }
  const token = jwt.sign({ sub: rider.id, phone }, process.env.JWT_SECRET || 'devjwt', { expiresIn: '7d' });
  return res.json({ token, rider });
});

// Auth middleware
function authMiddleware(req, res, next){
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing auth' });
  const token = auth.replace(/^Bearer\s*/i, '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devjwt');
    req.riderId = payload.sub;
    next();
  } catch(e){
    return res.status(401).json({ error: 'invalid token' });
  }
}

// Rider posts location
app.post('/api/riders/location', authMiddleware, (req, res) => {
  const { lat, lng, accuracy } = req.body;
  const id = req.riderId;
  if (!riders[id]) return res.status(404).json({ error: 'rider not found' });
  riders[id].lastLocation = { lat, lng, accuracy, at: Date.now() };
  // broadcast to admin room
  io.to('admin').emit('location:update', { riderId: id, phone: riders[id].phone, name: riders[id].name, lastLocation: riders[id].lastLocation });
  return res.json({ ok: true });
});

// Admin list riders
app.get('/api/admin/riders', (req, res) => {
  return res.json(Object.values(riders));
});

// Admin ping endpoint (called from admin proxy)
app.post('/api/admin/ping', (req, res) => {
  const { riderId, message } = req.body || {};
  if (riderId) {
    io.to('rider:' + riderId).emit('ping', { message: message || 'Ping from dispatch' });
    return res.json({ ok: true });
  }
  return res.status(400).json({ error: 'riderId required' });
});

// Socket.io auth for riders and admin
io.use((socket, next) => {
  const { token, role } = socket.handshake.auth || {};
  if (role === 'admin') {
    socket.role = 'admin';
    return next();
  }
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devjwt');
    socket.riderId = payload.sub;
    socket.role = 'rider';
    return next();
  } catch(e){
    return next();
  }
});

io.on('connection', (socket) => {
  if (socket.role === 'admin') {
    socket.join('admin');
    console.log('admin connected', socket.id);
  } else if (socket.role === 'rider') {
    const rid = socket.riderId;
    socketsByRider[rid] = socket.id;
    socket.join('rider:' + rid);
    console.log('rider connected', rid);
  } else {
    console.log('unknown socket connected', socket.id);
  }

  socket.on('disconnect', () => {
    if (socket.role === 'rider') {
      delete socketsByRider[socket.riderId];
    }
  });

  socket.on('task:accept', (data) => {
    // broadcast accepted to admin
    io.to('admin').emit('task:accepted', { riderId: socket.riderId, taskId: data?.taskId || null });
  });

  socket.on('ping', (msg) => {
    if (socket.role === 'admin' && msg?.riderId) {
      io.to('rider:' + msg.riderId).emit('ping', { message: msg.message || 'Ping from dispatch' });
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log('Backend listening on', PORT));
