const express = require('express');
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/my-account', accountController.getMyAccount);

module.exports = router;
