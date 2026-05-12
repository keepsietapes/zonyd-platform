const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotifyController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas de autenticación Spotify
router.get('/login', spotifyController.login);
router.get('/callback', spotifyController.callback);

// Rutas de datos (Protegidas por authMiddleware de Zonyd)
router.get('/stats', authMiddleware, spotifyController.getStats);

module.exports = router;
