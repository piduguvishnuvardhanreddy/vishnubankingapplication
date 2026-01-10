const express = require('express');
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/my-account', accountController.getMyAccount);
router.post('/balance-secure', accountController.getSecureBalance);

module.exports = router;
