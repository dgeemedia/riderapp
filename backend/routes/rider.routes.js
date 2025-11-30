// backend/routes/rider.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/rider.controller');
const auth = require('../middleware/auth');

// Register device token (Expo/FCM) for push notifications
// POST /api/riders/register-device
router.post('/register-device', auth, ctrl.registerDevice);

// Rider location update (auth required)
router.post('/location', auth, ctrl.updateLocation);

// Get available riders (no auth required)
router.get('/available', ctrl.getAvailable);

module.exports = router;
