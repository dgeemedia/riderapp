// backend/routes/task.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/task.controller');
const auth = require('../middleware/auth');

router.post('/', ctrl.createTask);
router.post('/:id/accept', auth, ctrl.acceptTask);

module.exports = router;
