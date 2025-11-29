// backend/controllers/task.controller.js
const db = require('../db');
const redis = require('../redis');

// helper functions (can be moved to lib if needed)
async function ensureWallet(ownerId, ownerType) {
  try {
    const r = await db.query('SELECT * FROM wallets WHERE owner_id=$1 AND owner_type=$2 LIMIT 1', [ownerId, ownerType]);
    if (r.rows.length) return r.rows[0];
    const ins = await db.query('INSERT INTO wallets (owner_id, owner_type, balance_bigint) VALUES ($1,$2,$3) RETURNING *', [ownerId, ownerType, 0]);
    return ins.rows[0];
  } catch (err) { console.warn('ensureWallet', err?.message || err); return null; }
}

async function ensureMonthlyGrant(customerId) {
  try {
    const r = await db.query('SELECT free_credits, last_monthly_grant FROM customers WHERE id=$1 LIMIT 1', [customerId]);
    if (!r.rows.length) return;
    let { free_credits, last_monthly_grant } = r.rows[0];
    const now = new Date();
    const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
    const lastGrantTS = last_monthly_grant ? Date.parse(last_monthly_grant) : 0;
    if (lastGrantTS < monthStart) {
      free_credits = (free_credits || 0) + 1;
      const then = new Date().toISOString();
      await db.query('UPDATE customers SET free_credits=$1, last_monthly_grant=$2 WHERE id=$3', [free_credits, then, customerId]);
    }
  } catch (err) { console.warn('ensureMonthlyGrant', err?.message || err); }
}

async function getNearestRider(lat, lng) {
  try {
    const q = `
      SELECT rl.rider_id, rl.lat, rl.lng
      FROM rider_locations rl
      INNER JOIN (
        SELECT rider_id, max(recorded_at) as maxt
        FROM rider_locations GROUP BY rider_id
      ) latest ON latest.rider_id = rl.rider_id AND latest.maxt = rl.recorded_at
      WHERE rl.lat IS NOT NULL AND rl.lng IS NOT NULL
      LIMIT 200;
    `;
    const res = await db.query(q);
    if (!res.rows.length) return null;
    let best = null, bestScore = Infinity;
    for (const r of res.rows) {
      const dlat = r.lat - lat;
      const dlng = r.lng - lng;
      const score = dlat * dlat + dlng * dlng;
      if (score < bestScore) { bestScore = score; best = r.rider_id; }
    }
    return best;
  } catch (err) { console.warn('getNearestRider', err?.message || err); return null; }
}

exports.createTask = async (req, res) => {
  const { customer_id, pickup, dropoff, created_by_type } = req.body;
  if (!pickup || !dropoff) return res.status(400).json({ error: 'pickup & dropoff required' });

  let is_chargeable = true;
  if (created_by_type === 'admin') is_chargeable = false;

  if (created_by_type === 'customer' && customer_id) {
    try {
      await ensureMonthlyGrant(customer_id);
      const c = await db.query('SELECT free_credits FROM customers WHERE id=$1 LIMIT 1', [customer_id]);
      const freeCredits = c.rows[0] ? (c.rows[0].free_credits || 0) : 0;
      if (freeCredits > 0) {
        await db.query('UPDATE customers SET free_credits = free_credits - 1 WHERE id = $1', [customer_id]);
        is_chargeable = false;
      }
    } catch (err) { console.warn('free credit logic error', err?.message || err); }
  }

  try {
    const ins = await db.query(
      `INSERT INTO tasks (source_platform, source_id, pickup, dropoff, is_chargeable, created_by_type, created_by, payment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      ['d-riders', null, pickup, dropoff, is_chargeable, created_by_type || 'customer', customer_id || null, is_chargeable ? 'unpaid' : 'paid']
    );
    const task = ins.rows[0];

    if (!task.assigned_rider) {
      const riderId = await getNearestRider(pickup.lat, pickup.lng);
      if (riderId) {
        await db.query('UPDATE tasks SET assigned_rider=$1, status=$2 WHERE id=$3', [riderId, 'assigned', task.id]);
        // send socket event to rider channel
        // We'll use socket.io server from global export through sockets file mapping: admin clients listen on 'admin' room
        // the socket logic will deliver messages if rider connected
        // we use redis to store socket mapping in sockets.js when connecting
        // emit via global io is not exported; instead we rely on setting socket mapping key so admin UI loads from DB + Redis
      }
    }

    return res.json({ ok: true, task });
  } catch (err) {
    console.error('create task', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};

exports.acceptTask = async (req, res) => {
  const taskId = req.params.id;
  const riderId = req.riderId;
  try {
    const tRes = await db.query('SELECT * FROM tasks WHERE id = $1 LIMIT 1', [taskId]);
    if (!tRes.rows.length) return res.status(404).json({ error: 'task not found' });
    const task = tRes.rows[0];
    if (task.status === 'accepted') return res.status(400).json({ error: 'task already accepted' });
    if (task.assigned_rider && task.assigned_rider !== riderId) return res.status(403).json({ error: 'task assigned to another rider' });

    if (task.is_chargeable) {
      const customerId = task.created_by;
      const wRes = await db.query('SELECT * FROM wallets WHERE owner_id=$1 AND owner_type=$2 LIMIT 1', [customerId, 'customer']);
      if (!wRes.rows.length) return res.status(402).json({ error: 'customer wallet not found' });
      const wallet = wRes.rows[0];
      const price = parseInt(task.price_bigint || 10000, 10);
      if (wallet.balance_bigint < price) return res.status(402).json({ error: 'customer has insufficient funds' });

      await db.query('UPDATE wallets SET balance_bigint = balance_bigint - $1, updated_at = now() WHERE id=$2', [price, wallet.id]);
      await db.query('INSERT INTO wallet_transactions (wallet_id, amount_bigint, type, meta) VALUES ($1,$2,$3,$4)', [wallet.id, -price, 'capture', JSON.stringify({ taskId })]);

      const platformFee = Math.floor(price * 0.10);
      const riderCredit = price - platformFee;
      const rWallet = await ensureWallet(riderId, 'rider');
      await db.query('UPDATE wallets SET balance_bigint = balance_bigint + $1, updated_at = now() WHERE id=$2', [riderCredit, rWallet.id]);
      await db.query('INSERT INTO wallet_transactions (wallet_id, amount_bigint, type, meta) VALUES ($1,$2,$3,$4)', [rWallet.id, riderCredit, 'capture', JSON.stringify({ taskId })]);
    }

    await db.query('UPDATE tasks SET assigned_rider=$1, status=$2, payment_status=$3 WHERE id=$4', [riderId, 'accepted', task.is_chargeable ? 'paid' : 'paid', taskId]);

    return res.json({ ok: true });
  } catch (err) {
    console.error('acceptTask', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};
