const express = require('express');
const router = express.Router();
const { sendRegistrationEmail, sendVerificationSuccessEmail } = require('../controllers/authController');

// POST /api/auth/register - Dispara correo de verificación al registrarse
router.post('/register', sendRegistrationEmail);

// GET /api/auth/verify?email=xxx - Dispara correo de bienvenida al validar
router.get('/verify', sendVerificationSuccessEmail);

module.exports = router;
