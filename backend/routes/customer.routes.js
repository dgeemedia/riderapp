// backend/routes/customer.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/customer.controller');

router.post('/register', ctrl.register);

module.exports = router;
