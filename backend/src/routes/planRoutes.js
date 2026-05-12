const express = require('express');
const router = express.Router();
const { upgradePlan } = require('../controllers/planController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/upgrade', authMiddleware, upgradePlan);

module.exports = router;
