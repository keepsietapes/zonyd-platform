const express = require('express');
const router = express.Router();
const { createRelease, getReleases } = require('../controllers/releaseController');
const { validateRelease } = require('../validators/releaseValidator');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, validateRelease, createRelease);
router.get('/', authMiddleware, getReleases);
module.exports = router;
