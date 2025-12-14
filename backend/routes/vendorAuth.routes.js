// backend/routes/vendorAuth.routes.js
const express = require('express');
const router = express.Router();
const vendorAuthController = require('../controllers/vendorAuth.controller');
const auth = require('../middleware/auth');

// These routes don't require authentication
router.post('/login', vendorAuthController.login);
router.post('/register', vendorAuthController.register);
router.post('/forgot-password', vendorAuthController.forgotPassword);
router.post('/reset-password', vendorAuthController.resetPassword);

// These routes require vendor authentication
router.get('/profile', auth('vendor'), vendorAuthController.getProfile);
router.put('/profile', auth('vendor'), vendorAuthController.updateProfile);
router.post('/change-password', auth('vendor'), vendorAuthController.changePassword);
router.post('/logout', auth('vendor'), vendorAuthController.logout);

module.exports = router;