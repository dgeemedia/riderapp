// backend/controllers/customerAuth.controller.js
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateOtp } = require('../lib/util');

exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;
  
  try {
    // Check if customer exists
    const existing = await db.query(
      'SELECT * FROM customers WHERE email = $1 OR phone = $2',
      [email, phone]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Customer already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create customer
    const customer = await db.query(
      `INSERT INTO customers (name, email, phone, password_hash, verification_token) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, created_at`,
      [name, email, phone, passwordHash, generateOtp()]
    );
    
    // Create wallet for customer
    await db.query(
      'INSERT INTO wallets (owner_id, owner_type, balance_bigint) VALUES ($1, $2, $3)',
      [customer.rows[0].id, 'customer', 0]
    );
    
    // Generate token
    const token = jwt.sign(
      { sub: customer.rows[0].id, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      customer: customer.rows[0],
      token
    });
  } catch (err) {
    console.error('Customer registration error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const customer = await db.query(
      'SELECT * FROM customers WHERE email = $1 OR phone = $1',
      [email]
    );
    
    if (customer.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, customer.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { sub: customer.rows[0].id, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      customer: {
        id: customer.rows[0].id,
        name: customer.rows[0].name,
        email: customer.rows[0].email,
        phone: customer.rows[0].phone
      },
      token
    });
  } catch (err) {
    console.error('Customer login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};