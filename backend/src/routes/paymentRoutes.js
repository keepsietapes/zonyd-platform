const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const auditLog = require('../middleware/auditMiddleware');

// Ruta para crear sesión de pago (Protegida)
router.post('/create-checkout-session', authMiddleware, auditLog('PAYMENT_CHECKOUT_CREATE'), paymentController.createCheckoutSession);

// Ruta para solicitar retiro (Protegida)
router.post('/payout', authMiddleware, auditLog('WITHDRAWAL_REQUEST'), paymentController.createPayoutRequest);

// Webhook para Stripe (Sin authMiddleware porque lo llama Stripe)
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleWebhook);

module.exports = router;

