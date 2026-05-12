const express = require('express');
const router = express.Router();
const { getBalance, requestWithdrawal } = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/balance', authMiddleware, getBalance);
router.post('/withdraw', authMiddleware, requestWithdrawal);
module.exports = router;
