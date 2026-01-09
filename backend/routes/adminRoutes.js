const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// protect all routes after this middleware
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.get('/users', adminController.getAllUsers);
router.get('/accounts', adminController.getAllAccounts);
router.patch('/accounts/:id/status', adminController.updateAccountStatus);

module.exports = router;
