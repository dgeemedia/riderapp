// backend/routes/customerAuth.routes.js
const express = require('express');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuth.controller');
const auth = require('../middleware/auth');

// These routes don't require authentication
router.post('/register', customerAuthController.register);
router.post('/login', customerAuthController.login);
router.post('/forgot-password', customerAuthController.forgotPassword);
router.post('/reset-password', customerAuthController.resetPassword);

// These routes require customer authentication
router.post('/verify-phone', auth('customer'), customerAuthController.verifyPhone);
router.post('/resend-otp', auth('customer'), customerAuthController.resendOtp);
router.get('/profile', auth('customer'), customerAuthController.getProfile);
router.put('/profile', auth('customer'), customerAuthController.updateProfile);
router.post('/change-password', auth('customer'), customerAuthController.changePassword);
router.post('/logout', auth('customer'), customerAuthController.logout);

module.exports = router;