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
    { 
        sub: vendor.rows[0].id, 
        role: 'vendor',
        email: vendor.rows[0].email
    },
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

exports.register = async (req, res) => {
  const { business_name, description, phone, email, password, address, tax_id } = req.body;
  
  try {
    // Check if vendor exists
    const existing = await db.query(
      'SELECT * FROM vendors WHERE email = $1 OR phone = $2',
      [email, phone]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Vendor already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create vendor
    const vendor = await db.query(
      `INSERT INTO vendors 
       (business_name, description, phone, email, password_hash, address, tax_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, business_name, email, phone, is_approved, created_at`,
      [business_name, description, phone, email, passwordHash, JSON.stringify(address), tax_id]
    );
    
    // Create wallet for vendor
    await db.query(
      'INSERT INTO wallets (owner_id, owner_type, balance_bigint) VALUES ($1, $2, $3)',
      [vendor.rows[0].id, 'vendor', 0]
    );
    
    res.status(201).json({
      vendor: vendor.rows[0],
      message: 'Vendor registered. Please wait for admin approval.'
    });
  } catch (err) {
    console.error('Vendor registration error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const vendor = await db.query(
      'SELECT id, email FROM vendors WHERE email = $1',
      [email]
    );
    
    if (vendor.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { sub: vendor.rows[0].id, type: 'password_reset', role: 'vendor' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // In production, send email with reset link
    console.log(`Reset token for vendor ${email}: ${resetToken}`);
    
    res.json({ message: 'Password reset instructions sent to email' });
  } catch (err) {
    console.error('Vendor forgot password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  
  try {
    // Verify reset token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    if (payload.type !== 'password_reset' || payload.role !== 'vendor') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.query(
      'UPDATE vendors SET password_hash = $1, updated_at = now() WHERE id = $2',
      [passwordHash, payload.sub]
    );
    
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Vendor reset password error:', err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const result = await db.query(
      `SELECT id, business_name, description, logo_url, cover_image, 
              address, phone, email, tax_id, bank_account, is_approved, 
              is_active, rating, total_orders, created_at
       FROM vendors WHERE id = $1`,
      [vendorId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Get categories
    const categoriesResult = await db.query(
      'SELECT category FROM vendor_categories WHERE vendor_id = $1',
      [vendorId]
    );
    
    // Get wallet balance
    const walletResult = await db.query(
      'SELECT balance_bigint FROM wallets WHERE owner_id = $1 AND owner_type = $2',
      [vendorId, 'vendor']
    );
    
    const profile = {
      ...result.rows[0],
      categories: categoriesResult.rows.map(row => row.category),
      wallet_balance: walletResult.rows[0]?.balance_bigint || 0
    };
    
    res.json({ vendor: profile });
  } catch (err) {
    console.error('Get vendor profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { 
      business_name, description, logo_url, cover_image, 
      phone, address, tax_id, bank_account 
    } = req.body;
    
    const result = await db.query(
      `UPDATE vendors 
       SET business_name = COALESCE($1, business_name),
           description = COALESCE($2, description),
           logo_url = COALESCE($3, logo_url),
           cover_image = COALESCE($4, cover_image),
           phone = COALESCE($5, phone),
           address = COALESCE($6, address),
           tax_id = COALESCE($7, tax_id),
           bank_account = COALESCE($8, bank_account),
           updated_at = now()
       WHERE id = $9
       RETURNING id, business_name, description, logo_url, cover_image, 
                 phone, address, tax_id, bank_account, updated_at`,
      [
        business_name, description, logo_url, cover_image,
        phone, JSON.stringify(address), tax_id, JSON.stringify(bank_account),
        vendorId
      ]
    );
    
    res.json({ vendor: result.rows[0] });
  } catch (err) {
    console.error('Update vendor profile error:', err);
    
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Email or phone already exists' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Get current password hash
    const result = await db.query(
      'SELECT password_hash FROM vendors WHERE id = $1',
      [vendorId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.query(
      'UPDATE vendors SET password_hash = $1, updated_at = now() WHERE id = $2',
      [newPasswordHash, vendorId]
    );
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Vendor change password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};