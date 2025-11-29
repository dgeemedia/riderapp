// backend/controllers/rider.controller.js
const db = require('../db');
const redis = require('../redis');

exports.updateLocation = async (req, res) => {
  const { lat, lng, accuracy } = req.body;
  const riderId = req.riderId;
  if (!riderId) return res.status(401).json({ error: 'unauth' });
  try {
    await db.query('INSERT INTO rider_locations (rider_id, lat, lng, accuracy) VALUES ($1,$2,$3,$4)', [riderId, lat, lng, accuracy]);
  } catch (err) { console.error('DB loc insert', err?.message || err); }
  try { if (redis) await redis.set(`rider:last:${riderId}`, JSON.stringify({ lat, lng, accuracy, at: Date.now() }), 'EX', 60*60*24); } catch (e) {}
  // emit to admin via socket mapping (sockets already emit globally when saved)
  return res.json({ ok: true });
};

exports.getAvailable = async (req, res) => {
  try {
    const rows = (await db.query('SELECT id, phone, name FROM riders WHERE is_active = true')).rows;
    const enriched = await Promise.all(rows.map(async r => {
      try {
        const cached = await redis.get(`rider:last:${r.id}`);
        r.lastLocation = cached ? JSON.parse(cached) : null;
      } catch { r.lastLocation = null; }
      return r;
    }));
    res.json(enriched);
  } catch (err) {
    console.error('getAvailable', err?.message || err);
    res.status(500).json({ error: 'server error' });
  }
};
