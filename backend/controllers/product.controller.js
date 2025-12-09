// backend/controllers/product.controller.js
const db = require('../db');

exports.createProduct = async (req, res) => {
    const { vendor_id, name, description, price, category, image_url } = req.body;
    
    try {
        // Check if vendor is approved
        const vendorCheck = await db.query(
            'SELECT is_approved FROM vendors WHERE id = $1',
            [vendor_id]
        );
        
        if (!vendorCheck.rows[0]?.is_approved) {
            return res.status(403).json({ error: 'Vendor not approved' });
        }
        
        const product = await db.query(
            `INSERT INTO products (vendor_id, name, description, price_bigint, category, image_url) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [vendor_id, name, description, price * 100, category, image_url]
        );
        
        res.status(201).json({ product: product.rows[0] });
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateStock = async (req, res) => {
    const { productId } = req.params;
    const { in_stock } = req.body;
    
    try {
        const product = await db.query(
            'UPDATE products SET in_stock = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [in_stock, productId]
        );
        
        res.json({ product: product.rows[0] });
    } catch (err) {
        console.error('Update stock error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getProductsByVendor = async (req, res) => {
    const { vendorId } = req.params;
    
    try {
        const products = await db.query(
            'SELECT * FROM products WHERE vendor_id = $1 ORDER BY created_at DESC',
            [vendorId]
        );
        
        res.json({ products: products.rows });
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};