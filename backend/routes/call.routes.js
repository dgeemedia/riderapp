// backend/routes/call.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/call.controller');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');

// agora token available to authenticated users (riders/admin)
router.post('/agora/token', auth, ctrl.agoraTokenForCall);

// admin notify rider to start a call
router.post('/notify', adminAuth, ctrl.notifyRider);

// web client HTML (no auth) - used by webview or admin
router.get('/client', ctrl.serveAgoraClientHtml);

module.exports = router;
