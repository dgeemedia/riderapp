// backend/routes/rider.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/rider.controller');
const auth = require('../middleware/auth');

router.post('/location', auth, ctrl.updateLocation);
router.get('/available', ctrl.getAvailable);

module.exports = router;
