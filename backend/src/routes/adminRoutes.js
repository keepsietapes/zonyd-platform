const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/rbacMiddleware');
const { getAllUsers, getAllReleases, approveRelease } = require('../controllers/adminController');

// Todas las rutas requieren rol ADMIN
router.use(requireRole('ADMIN'));

router.get('/users', getAllUsers);
router.get('/releases', getAllReleases);
router.post('/releases/:id/approve', approveRelease);

module.exports = router;
