const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getLegalDocuments,
  recordAcceptance,
  getUserLegalStatus,
} = require('../controllers/legalController');

// Público: listar documentos disponibles
router.get('/documents', getLegalDocuments);

// Requiere autenticación
router.use(authMiddleware);

// Registrar aceptación de documentos
router.post('/accept', recordAcceptance);

// Estado de aceptación del usuario actual
router.get('/user-status', getUserLegalStatus);

module.exports = router;
