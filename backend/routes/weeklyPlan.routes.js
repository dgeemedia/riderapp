// backend/routes/weeklyPlan.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/weeklyPlan.controller');
const adminAuth = require('../middleware/adminAuth');

router.post('/', ctrl.createWeeklyPlan);
router.post('/process-daily', adminAuth, ctrl.processDailyOrders);

module.exports = router;