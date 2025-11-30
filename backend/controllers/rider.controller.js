// backend/controllers/rider.controller.js
const db = require('../db');
const redis = require('../redis');

exports.registerDevice = async (req, res) => {
  try {
    const riderId = req.riderId;
    if (!riderId) return res.status(401).json({ error: 'unauth' });

    const { pushToken, platform } = req.body;
    if (!pushToken) return res.status(400).json({ error: 'pushToken required' });

    // upsert into rider_devices (unique on rider_id + push_token)
    await db.query(
      `INSERT INTO rider_devices (rider_id, push_token, platform, created_at, updated_at)
       VALUES ($1, $2, $3, now(), now())
       ON CONFLICT (rider_id, push_token) DO UPDATE
         SET platform = EXCLUDED.platform, updated_at = now()`,
      [riderId, pushToken, platform || null]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error('registerDevice error', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};

exports.updateLocation = async (req, res) => {
  const { lat, lng, accuracy } = req.body;
  const riderId = req.riderId;
  if (!riderId) return res.status(401).json({ error: 'unauth' });
  try {
    await db.query(
      'INSERT INTO rider_locations (rider_id, lat, lng, accuracy) VALUES ($1,$2,$3,$4)',
      [riderId, lat, lng, accuracy]
    );
  } catch (err) {
    console.error('DB loc insert', err?.message || err);
  }
  try {
    if (redis && typeof redis.set === 'function') {
      await redis.set(`rider:last:${riderId}`, JSON.stringify({ lat, lng, accuracy, at: Date.now() }), 'EX', 60*60*24);
    }
  } catch (e) {
    console.warn('Redis set error', e?.message || e);
  }
  // emit to admin room so dashboard updates quickly (server sockets file handles join)
  try {
    const serverModule = require('../server');
    const io = serverModule && serverModule.io;
    if (io) {
      io.to('admin').emit('location:update', { riderId, lastLocation: { lat, lng, accuracy, at: Date.now() }});
    }
  } catch (e) {
    // don't crash on emit
  }
  return res.json({ ok: true });
};

exports.getAvailable = async (req, res) => {
  try {
    const rows = (await db.query('SELECT id, phone, name, is_online FROM riders WHERE is_active = true')).rows;
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
    console.error('getAvailable', err?.message || err);
    res.status(500).json({ error: 'server error' });
  }
};
