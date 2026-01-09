const express = require('express');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.post('/deposit', transactionController.deposit);
router.post('/withdraw', transactionController.withdraw);
router.post('/transfer', transactionController.transfer);
router.post('/request', transactionController.requestMoney);
router.get('/history', transactionController.getHistory);

module.exports = router;
