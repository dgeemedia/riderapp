// backend/routes/admin.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const adminAuth = require('../middleware/adminAuth');

router.post('/login', ctrl.login);
router.get('/riders', adminAuth, ctrl.listRiders);
router.post('/ping', adminAuth, ctrl.pingRider);
router.post('/assign-task', adminAuth, ctrl.assignTask);

module.exports = router;
