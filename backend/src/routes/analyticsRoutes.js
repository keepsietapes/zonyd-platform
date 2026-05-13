const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.get('/', authMiddleware, analyticsController.getAnalytics);
router.get('/score', authMiddleware, analyticsController.getScore);
router.get('/deezer', authMiddleware, analyticsController.getDeezerStats);

module.exports = router;
