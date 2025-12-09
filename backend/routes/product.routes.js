// backend/routes/product.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/product.controller');

router.post('/', ctrl.createProduct);
router.put('/:productId/stock', ctrl.updateStock);
router.get('/vendor/:vendorId', ctrl.getProductsByVendor);

module.exports = router;