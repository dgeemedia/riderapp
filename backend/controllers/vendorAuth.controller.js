// backend/controllers/vendorAuth.controller.js
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const vendor = await db.query(
      'SELECT * FROM vendors WHERE email = $1 AND is_approved = true',
      [email]
    );
    
    if (vendor.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials or vendor not approved' });
    }
    
    const isValid = await bcrypt.compare(password, vendor.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { sub: vendor.rows[0].id, role: 'vendor' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      vendor: {
        id: vendor.rows[0].id,
        business_name: vendor.rows[0].business_name,
        email: vendor.rows[0].email,
        phone: vendor.rows[0].phone
      },
      token
    });
  } catch (err) {
    console.error('Vendor login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};