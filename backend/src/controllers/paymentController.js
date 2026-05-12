const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../utils/prisma');

/**
 * Crea una sesión de Checkout de Stripe para suscripciones
 */
module.exports = {
  createCheckoutSession: async (req, res) => {
    const { planId } = req.body; 
    const userId = req.user.id;
    const planConfig = {
      'PRO': { price: 'price_12345_pro', name: 'Plan PRO' },
      'LABEL': { price: 'price_12345_label', name: 'Plan LABEL' }
    };

    try {
      const { generateIdempotencyKey } = require('../utils/idempotency');
      const idempotencyKey = generateIdempotencyKey('checkout', `${userId}_${planId}`);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: planConfig[planId].name },
            unit_amount: planId === 'PRO' ? 999 : 2999,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `https://app.zonyd.com/dashboard/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `https://app.zonyd.com/dashboard/settings?success=false`,
        customer_email: req.user.email,
        metadata: { userId, planId }
      }, {
        idempotencyKey
      });
      res.json({ id: session.id });
    } catch (error) {
      console.error('Stripe Checkout Error:', error);
      res.status(500).json({ error: 'No se pudo crear la sesión de pago' });
    }

  },

  createPayoutRequest: async (req, res) => {
    const { amount, method } = req.body;
    try {
      const LedgerService = require('../services/ledgerService');
      
      // El LedgerService ya valida fondos insuficientes y actualiza la billetera de forma atómica
      const updatedWallet = await LedgerService.recordTransaction(
        req.user.id,
        -Math.abs(parseFloat(amount)), // Monto negativo para débito
        'WITHDRAWAL',
        `Retiro de fondos solicitado vía ${method || 'PAYPAL'}`,
        { method }
      );

      // Registrar la solicitud oficial de Payout
      const payout = await prisma.payout.create({
        data: { 
          walletId: updatedWallet.id, 
          amount: parseFloat(amount), 
          method: method || 'PAYPAL', 
          status: 'PENDING' 
        }
      });

      res.json({ success: true, payoutId: payout.id, newBalance: updatedWallet.balance });
    } catch (error) {
      console.error('Payout Error:', error);
      res.status(400).json({ error: error.message || 'Error al procesar el retiro' });
    }
  },

  handleWebhook: async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const LedgerService = require('../services/ledgerService');
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { userId, planId } = session.metadata;

        // 1. Actualizar el plan del artista
        await prisma.artist.update({
          where: { userId: userId },
          data: { plan: planId }
        });

        // 2. Registrar el pago en el Ledger para auditoría (aunque sea una suscripción externa)
        await LedgerService.recordTransaction(
          userId,
          session.amount_total / 100, // Stripe envía en centavos
          'SUBSCRIPTION_PAYMENT',
          `Pago de suscripción Plan ${planId}`,
          { stripeSessionId: session.id, planId }
        );
      }
      res.json({ received: true });
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

};
