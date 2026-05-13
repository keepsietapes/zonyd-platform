const express = require('express');
const router = express.Router();
const { createOrUpdateArtist, getArtistProfile, verifyArtistEmail } = require('../controllers/artistController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/profile', authMiddleware, getArtistProfile);
router.post('/onboarding', authMiddleware, createOrUpdateArtist);
router.put('/profile', authMiddleware, createOrUpdateArtist); // PUT para updates desde Settings
router.get('/verify', verifyArtistEmail);

module.exports = router;
