const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const {
  getAllUsers,
  getAllReleases,
  approveRelease,
  rejectRelease,
  getAdminStats,
  getAuditLogs,
  markReleaseLive,
} = require('../controllers/adminController');

// Todas las rutas de admin requieren autenticación + rol ADMIN
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

// Dashboard stats
router.get('/stats', getAdminStats);

// Audit logs
router.get('/logs', getAuditLogs);

// Users
router.get('/users', getAllUsers);

// Releases — soporta ?status=PENDING_APPROVAL
router.get('/releases', getAllReleases);
router.post('/releases/:id/approve', approveRelease);
router.post('/releases/:id/reject', rejectRelease);
router.post('/releases/:id/mark-live', markReleaseLive);

module.exports = router;
