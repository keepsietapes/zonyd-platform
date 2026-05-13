const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotifyController');
const authMiddleware = require('../middleware/authMiddleware');

// Login: opcional authMiddleware para capturar userId en el state
// El usuario debe estar logueado en Zonyd para vincular su Spotify
router.get('/login', authMiddleware, spotifyController.login);

// Callback: NO usa authMiddleware — viene de Spotify, sin JWT de Zonyd
// El userId viaja en el `state` param
router.get('/callback', spotifyController.callback);

// Stats: protegida — requiere JWT de Zonyd
router.get('/stats', authMiddleware, spotifyController.getStats);

module.exports = router;
