// backend/controllers/auth.controller.js
const db = require('../db');
const redis = require('../redis');
const twilio = require('twilio');
const { generateOtp } = require('../lib/util');
const twilioClient = (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) ? twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN) : null;
const axios = require('axios');
const jwt = require('jsonwebtoken');

exports.sendOtp = async (req, res) => {
  const { phone, provider = 'twilio' } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });

  const code = generateOtp();
  try {
    if (redis && typeof redis.set === 'function') {
      await redis.set(`otp:${phone}`, code, 'EX', 300);
    }
  } catch (err) {
    console.warn('Redis OTP set error', err?.message || err);
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
        from: process.env.TWILIO_FROM,
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
};

exports.verify = async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'phone and code required' });
  let stored = null;
  try { stored = await redis.get(`otp:${phone}`); } catch (e) { console.warn(e?.message || e); }
  if (!stored || stored !== code) return res.status(401).json({ error: 'invalid or expired code' });
  try { if (redis) await redis.del(`otp:${phone}`); } catch (e) {}
  try {
    const find = await db.query('SELECT * FROM riders WHERE phone = $1 LIMIT 1', [phone]);
    let rider;
    if (find.rows.length) rider = find.rows[0];
    else {
      const ins = await db.query('INSERT INTO riders (phone) VALUES ($1) RETURNING *', [phone]);
      rider = ins.rows[0];
    }
    const token = jwt.sign({ sub: rider.id, phone }, process.env.JWT_SECRET || 'devjwt', { expiresIn: '7d' });
    return res.json({ token, rider });
  } catch (err) {
    console.error('verify error', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};
