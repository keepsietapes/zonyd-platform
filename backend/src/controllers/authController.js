const { sendWelcomeEmail, sendValidationSuccessEmail } = require('../services/emailService');

/**
 * POST /api/auth/register
 * Llamado desde el frontend justo después del registro (Google o Email).
 * Recibe: { email, name }
 * Envía el correo #1: Verificación con botón de validar cuenta.
 */
const sendRegistrationEmail = async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'El campo email es requerido.' });
  }

  try {
    console.log(`📧 Enviando correo de verificación a: ${email}`);
    await sendWelcomeEmail(email, name || 'Artista');
    res.json({ success: true, message: 'Correo de verificación enviado.' });
  } catch (error) {
    console.error('❌ Error al enviar correo de verificación:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/auth/verify?email=xxx
 * Llamado cuando el usuario hace clic en el enlace de validación del correo #1.
 * Envía el correo #2: Bienvenida con resumen de planes.
 */
const sendVerificationSuccessEmail = async (req, res) => {
  const { email, name } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'El campo email es requerido.' });
  }

  try {
    console.log(`✅ Verificando cuenta y enviando bienvenida a: ${email}`);
    await sendValidationSuccessEmail(email, name || 'Artista');
    // Redirigir al dashboard después de validar
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error('❌ Error al enviar correo de bienvenida:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { sendRegistrationEmail, sendVerificationSuccessEmail };
