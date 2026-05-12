const express = require('express');
const router = express.Router();
const { chatWithAssistant } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/chat', authMiddleware, chatWithAssistant);

module.exports = router;
