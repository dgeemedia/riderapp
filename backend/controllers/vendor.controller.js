// backend/controllers/vendor.controller.js
const db = require('../db');

exports.register = async (req, res) => {
    const { business_name, description, logo_url, address, phone, email } = req.body;
    
    try {
        const vendor = await db.query(
            'INSERT INTO vendors (business_name, description, logo_url, address, phone, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [business_name, description, logo_url, address, phone, email]
        );
        
        // Notify admin about new vendor registration
        const io = require('../server').io;
        io.to('admin').emit('vendor:registration', { vendor: vendor.rows[0] });
        
        res.status(201).json({ vendor: vendor.rows[0] });
    } catch (err) {
        console.error('Vendor registration error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.approveVendor = async (req, res) => {
    const { vendorId } = req.params;
    const adminId = req.adminId;
    
    try {
        const vendor = await db.query(
            'UPDATE vendors SET is_approved = TRUE, approved_at = NOW(), approved_by = $1 WHERE id = $2 RETURNING *',
            [adminId, vendorId]
        );
        
        // Notify vendor about approval (you can implement email/SMS notification)
        
        res.json({ vendor: vendor.rows[0] });
    } catch (err) {
        console.error('Vendor approval error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getVendors = async (req, res) => {
    try {
        const vendors = await db.query(
            'SELECT * FROM vendors ORDER BY created_at DESC'
        );
        res.json({ vendors: vendors.rows });
    } catch (err) {
        console.error('Get vendors error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};