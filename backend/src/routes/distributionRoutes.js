const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const {
  distribute,
  getDistributionStatus,
  requestTakedown,
  getProviderHealth,
} = require('../controllers/distributionController');

// GET /api/distribute/health — Estado del provider (público para monitoring)
router.get('/health', getProviderHealth);

// Todas las rutas de abajo requieren autenticación
router.use(authMiddleware);

// POST /api/distribute/:id — Encolar release para distribución (solo ADMIN)
router.post('/:id', requireRole('ADMIN'), distribute);

// GET /api/distribute/:id/status — Estado de distribución (artista puede ver el suyo)
router.get('/:id/status', getDistributionStatus);

// POST /api/distribute/:id/takedown — Solicitar retiro (solo ADMIN)
router.post('/:id/takedown', requireRole('ADMIN'), requestTakedown);

module.exports = router;
