// backend/routes/order.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const adminAuth = require('../middleware/adminAuth');

router.post('/', ctrl.createOrder);
router.put('/:orderId/assign-rider', adminAuth, ctrl.assignRiderToOrder);

module.exports = router;