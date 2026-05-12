const express = require('express');
const router = express.Router();
const { simulateStreams, getAnalytics } = require('../controllers/royaltyController');

router.post('/simulate', simulateStreams);
router.get('/analytics', getAnalytics);
module.exports = router;
