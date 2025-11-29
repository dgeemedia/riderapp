// backend/routes/auth.routes.js
const router = require('express').Router();
const otpLimiter = require('../middleware/rateLimit');
const ctrl = require('../controllers/auth.controller');

router.post('/otp', otpLimiter, ctrl.sendOtp);
router.post('/verify', ctrl.verify);

module.exports = router;
