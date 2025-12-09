// backend/routes/vendor.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/vendor.controller');
const adminAuth = require('../middleware/adminAuth');

router.post('/register', ctrl.register);
router.get('/', ctrl.getVendors);
router.put('/:vendorId/approve', adminAuth, ctrl.approveVendor);

module.exports = router;