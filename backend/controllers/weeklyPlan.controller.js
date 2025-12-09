// backend/controllers/weeklyPlan.controller.js
const db = require('../db');

exports.createWeeklyPlan = async (req, res) => {
    const { customer_id, start_date, end_date, plan_items } = req.body;
    
    try {
        // Create weekly plan
        const weeklyPlan = await db.query(
            `INSERT INTO weekly_plans (customer_id, start_date, end_date) 
             VALUES ($1, $2, $3) RETURNING *`,
            [customer_id, start_date, end_date]
        );
        
        // Add plan items
        for (const item of plan_items) {
            await db.query(
                `INSERT INTO weekly_plan_items (weekly_plan_id, day_of_week, meal_type, product_id, quantity, special_instructions) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [weeklyPlan.rows[0].id, item.day_of_week, item.meal_type, item.product_id, item.quantity, item.special_instructions]
            );
        }
        
        // Notify admin
        const io = require('../server').io;
        io.to('admin').emit('weekly_plan:created', { weeklyPlan: weeklyPlan.rows[0] });
        
        res.status(201).json({ weeklyPlan: weeklyPlan.rows[0] });
    } catch (err) {
        console.error('Create weekly plan error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.processDailyOrders = async (req, res) => {
    const { date } = req.body;
    
    try {
        const dayOfWeek = new Date(date).getDay();
        
        // Get all active weekly plans for this day
        const planItems = await db.query(
            `SELECT wpi.*, wp.customer_id 
             FROM weekly_plan_items wpi
             JOIN weekly_plans wp ON wp.id = wpi.weekly_plan_id
             WHERE wpi.day_of_week = $1 AND wp.status = 'active'`,
            [dayOfWeek]
        );
        
        // Group by vendor and create orders
        const vendorGroups = {};
        for (const item of planItems.rows) {
            const product = await db.query(
                'SELECT vendor_id, price_bigint FROM products WHERE id = $1',
                [item.product_id]
            );
            
            if (!product.rows[0]) continue;
            
            const vendorId = product.rows[0].vendor_id;
            if (!vendorGroups[vendorId]) {
                vendorGroups[vendorId] = {
                    customer_id: item.customer_id,
                    items: []
                };
            }
            
            vendorGroups[vendorId].items.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_time: product.rows[0].price_bigint
            });
        }
        
        // Create orders for each vendor group
        const createdOrders = [];
        for (const [vendorId, group] of Object.entries(vendorGroups)) {
            const total = group.items.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);
            
            const order = await db.query(
                `INSERT INTO orders (customer_id, vendor_id, total_amount_bigint, delivery_address, scheduled_for, status) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [group.customer_id, vendorId, total, { address: 'Customer Address' }, date, 'pending']
            );
            
            createdOrders.push(order.rows[0]);
            
            // Add order items
            for (const item of group.items) {
                await db.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, price_at_time_bigint) 
                     VALUES ($1, $2, $3, $4)`,
                    [order.rows[0].id, item.product_id, item.quantity, item.price_at_time]
                );
            }
        }
        
        // Notify admin about daily orders
        const io = require('../server').io;
        io.to('admin').emit('daily_orders:created', { orders: createdOrders, date });
        
        res.json({ orders: createdOrders });
    } catch (err) {
        console.error('Process daily orders error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};