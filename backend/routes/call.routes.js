// backend/routes/call.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/call.controller');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');

// generate Twilio token for a client (web)
router.post('/twilio/token', adminAuth, ctrl.twilioTokenForClient);

// generate Agora token for a call
router.post('/agora/token', adminAuth, ctrl.agoraTokenForCall);

// optional: create call record
router.post('/create', adminAuth, ctrl.createCallRecord);

module.exports = router;
