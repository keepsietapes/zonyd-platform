const express = require('express');
const router = express.Router();
const { createOrUpdateArtist, getArtistProfile, verifyArtistEmail } = require('../controllers/artistController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/profile', authMiddleware, getArtistProfile);
router.post('/onboarding', authMiddleware, createOrUpdateArtist);
router.get('/verify', verifyArtistEmail);

module.exports = router;
