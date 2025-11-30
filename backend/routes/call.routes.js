// backend/routes/call.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/call.controller');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');

// Admin-only Twilio token (leave as admin)
router.post('/twilio/token', adminAuth, ctrl.twilioTokenForClient);

// Agora token: allow authenticated users (riders, customers) and admins.
router.post('/agora/token', auth, ctrl.agoraTokenForCall);

// create call record (admin or auth) — both allowed
router.post('/create', auth, ctrl.createCallRecord);

module.exports = router;
