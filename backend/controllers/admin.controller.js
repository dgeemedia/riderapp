// backend/controllers/admin.controller.js
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redis = require('../redis');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });
  try {
    const r = await db.query('SELECT * FROM admins WHERE email=$1 LIMIT 1', [email]);
    if (!r.rows.length) return res.status(401).json({ error: 'invalid credentials' });
    const admin = r.rows[0];
    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ sub: admin.id, role: 'admin' }, process.env.JWT_SECRET || 'devjwt', { expiresIn: '7d' });
    return res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }});
  } catch (err) {
    console.error('admin login', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};

exports.listRiders = async (req, res) => {
  try {
    const rows = (await db.query('SELECT id, phone, name, created_at FROM riders ORDER BY created_at DESC LIMIT 200')).rows;
    const enriched = await Promise.all(rows.map(async r => {
      try {
        const cached = await redis.get(`rider:last:${r.id}`);
        r.lastLocation = cached ? JSON.parse(cached) : null;
      } catch { r.lastLocation = null; }
      return r;
    }));
    res.json(enriched);
  } catch (err) {
    console.error('listRiders', err?.message || err);
    res.status(500).json({ error: 'server error' });
  }
};

exports.pingRider = async (req, res) => {
  const { riderId, message } = req.body;
  // store ping to redis so if rider connected, socket will handle
  try {
    const socketId = await redis.get(`socket:rider:${riderId}`);
    if (socketId) {
      // we don't have direct reference to io here; admin UI can also call /socket through socket.io server
      // We'll just store the message in redis channel or emit via socket in sockets.js if desired.
      await redis.publish?.('d-riders:ping', JSON.stringify({ riderId, message }));
    }
    return res.json({ ok: true });
  } catch (err) {
    console.warn('pingRider error', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};

exports.assignTask = async (req, res) => {
  // body: { taskId, riderId }
  try {
    const { taskId, riderId } = req.body;
    if (!taskId || !riderId) return res.status(400).json({ error: 'taskId and riderId required' });

    // ensure task exists
    const tRes = await db.query('SELECT * FROM tasks WHERE id=$1 LIMIT 1', [taskId]);
    if (!tRes.rows.length) return res.status(404).json({ error: 'task not found' });

    // update assigned rider
    const u = await db.query('UPDATE tasks SET assigned_rider=$1, status=$2, updated_at=now() WHERE id=$3 RETURNING *', [riderId, 'assigned', taskId]);
    const task = u.rows[0];

    // notify rider via socket if connected
    try {
      const io = require('../server').io;
      if (io) {
        io.to('rider:' + riderId).emit('task:assign', { task });
      }
    } catch (e) { console.warn('emit assign error', e?.message || e); }

    return res.json({ ok: true, task });
  } catch (err) {
    console.error('assignTask', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};
