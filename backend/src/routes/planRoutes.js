const express = require('express');
const router = express.Router();
const { upgradePlan, confirmPayment } = require('../controllers/planController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/upgrade', authMiddleware, upgradePlan);
router.post('/confirm-payment', authMiddleware, confirmPayment);

module.exports = router;
