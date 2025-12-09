// backend/controllers/order.controller.js
const db = require('../db');

exports.createOrder = async (req, res) => {
    const { customer_id, vendor_id, items, delivery_address, special_instructions } = req.body;
    
    try {
        // Start transaction
        await db.query('BEGIN');
        
        // Calculate total
        let total = 0;
        for (const item of items) {
            const product = await db.query(
                'SELECT price_bigint, in_stock FROM products WHERE id = $1',
                [item.product_id]
            );
            
            if (!product.rows[0]?.in_stock) {
                await db.query('ROLLBACK');
                return res.status(400).json({ error: `Product ${item.product_id} out of stock` });
            }
            
            total += product.rows[0].price_bigint * item.quantity;
        }
        
        // Create order
        const order = await db.query(
            `INSERT INTO orders (customer_id, vendor_id, total_amount_bigint, delivery_address, special_instructions) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [customer_id, vendor_id, total, delivery_address, special_instructions]
        );
        
        // Add order items
        for (const item of items) {
            const product = await db.query(
                'SELECT price_bigint FROM products WHERE id = $1',
                [item.product_id]
            );
            
            await db.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price_at_time_bigint) 
                 VALUES ($1, $2, $3, $4)`,
                [order.rows[0].id, item.product_id, item.quantity, product.rows[0].price_bigint]
            );
        }
        
        await db.query('COMMIT');
        
        // Notify admin about new order
        const io = require('../server').io;
        io.to('admin').emit('order:created', { order: order.rows[0] });
        
        res.status(201).json({ order: order.rows[0] });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.assignRiderToOrder = async (req, res) => {
    const { orderId } = req.params;
    const { riderId } = req.body;
    
    try {
        const order = await db.query(
            'UPDATE orders SET rider_id = $1, status = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [riderId, 'assigned', orderId]
        );
        
        // Create task for rider (reusing your existing task system)
        const task = await db.query(
            `INSERT INTO tasks (source_platform, source_id, pickup, dropoff, is_chargeable, created_by_type, assigned_rider, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            ['mypadifood', order.rows[0].id, { address: 'Vendor Location' }, order.rows[0].delivery_address, true, 'admin', riderId, 'assigned']
        );
        
        // Notify rider
        const io = require('../server').io;
        io.to('rider:' + riderId).emit('order:assigned', { order: order.rows[0], task: task.rows[0] });
        
        res.json({ order: order.rows[0], task: task.rows[0] });
    } catch (err) {
        console.error('Assign rider error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};