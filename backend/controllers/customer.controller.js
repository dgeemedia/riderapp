// backend/controllers/customer.controller.js
const db = require('../db');
const redis = require('../redis');

exports.register = async (req, res) => {
  const { name, phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  try {
    const r = await db.query('SELECT * FROM customers WHERE phone=$1 LIMIT 1', [phone]);
    if (r.rows.length) return res.json({ customer: r.rows[0] });
    const ins = await db.query('INSERT INTO customers (name, phone, free_credits, last_free_reset) VALUES ($1,$2,$3,$4) RETURNING *',
      [name || null, phone, 2, new Date()]);
    const customer = ins.rows[0];
    // ensure wallet
    await db.query('INSERT INTO wallets (owner_id, owner_type, balance_bigint) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [customer.id, 'customer', 0]);
    return res.json({ customer });
  } catch (err) {
    console.error('customer register', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};
