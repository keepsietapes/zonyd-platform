const express = require('express');
const router = express.Router();
const { distribute } = require('../controllers/distributionController');

router.post('/:id', distribute);
module.exports = router;
