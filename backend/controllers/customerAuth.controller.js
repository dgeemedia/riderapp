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
        { 
        sub: customer.rows[0].id, 
        role: 'customer',
        email: customer.rows[0].email
        },
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

exports.verifyPhone = async (req, res) => {
  try {
    const { token } = req.body;
    const customerId = req.user.id;

    const result = await db.query(
      'UPDATE customers SET is_verified = true, verification_token = NULL WHERE id = $1 AND verification_token = $2 RETURNING id, name, email, phone',
      [customerId, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    res.json({
      message: 'Phone verified successfully',
      customer: result.rows[0]
    });
  } catch (err) {
    console.error('Phone verification error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const customerId = req.user.id;
    const otp = generateOtp();

    await db.query(
      'UPDATE customers SET verification_token = $1 WHERE id = $2',
      [otp, customerId]
    );

    // In production, send OTP via SMS
    console.log(`OTP for customer ${customerId}: ${otp}`);

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const customer = await db.query(
      'SELECT id, email FROM customers WHERE email = $1',
      [email]
    );
    
    if (customer.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { sub: customer.rows[0].id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // In production, send email with reset link
    console.log(`Reset token for ${email}: ${resetToken}`);
    
    res.json({ message: 'Password reset instructions sent to email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  
  try {
    // Verify reset token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    if (payload.type !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.query(
      'UPDATE customers SET password_hash = $1 WHERE id = $2',
      [passwordHash, payload.sub]
    );
    
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const customerId = req.user.id;
    
    const result = await db.query(
      `SELECT id, name, email, phone, profile_image, address, 
              default_address_id, free_credits, is_verified, created_at
       FROM customers WHERE id = $1`,
      [customerId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Get wallet balance
    const walletResult = await db.query(
      'SELECT balance_bigint FROM wallets WHERE owner_id = $1 AND owner_type = $2',
      [customerId, 'customer']
    );
    
    const profile = {
      ...result.rows[0],
      wallet_balance: walletResult.rows[0]?.balance_bigint || 0
    };
    
    res.json({ customer: profile });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { name, email, phone, profile_image } = req.body;
    
    const result = await db.query(
      `UPDATE customers 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           profile_image = COALESCE($4, profile_image),
           updated_at = now()
       WHERE id = $5
       RETURNING id, name, email, phone, profile_image, updated_at`,
      [name, email, phone, profile_image, customerId]
    );
    
    res.json({ customer: result.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Email or phone already exists' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Get current password hash
    const result = await db.query(
      'SELECT password_hash FROM customers WHERE id = $1',
      [customerId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
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
      'UPDATE customers SET password_hash = $1, updated_at = now() WHERE id = $2',
      [newPasswordHash, customerId]
    );
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  // Since we're using JWT, client-side logout is sufficient
  // In production, you might want to implement a token blacklist
  res.json({ message: 'Logged out successfully' });
};