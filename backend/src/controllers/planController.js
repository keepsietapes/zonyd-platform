const prisma = require('../utils/prisma');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function upgradePlan(req, res) {
  const { plan } = req.body;
  const planUpper = plan.toUpperCase();
  if (!['FREE', 'INDIE', 'PRO', 'LABEL'].includes(planUpper)) {
    return res.status(400).json({ error: 'Plan inválido' });
  }

  // Si es FREE, simplemente actualizamos en la BD
  if (planUpper === 'FREE') {
    try {
      const artist = await prisma.artist.updateMany({
        where: { userId: req.user.id },
        data: { plan: planUpper }
      });
      return res.json({ success: true, updated: artist.count > 0 });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Precios en centavos (USD)
  const planPrices = {
    'INDIE': 499,
    'PRO': 999,
    'LABEL': 2999
  };

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Zonyd ${planUpper} Plan`,
              description: `Suscripción mensual al plan ${planUpper}`,
            },
            unit_amount: planPrices[planUpper],
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/settings?tab=plan&session_id={CHECKOUT_SESSION_ID}&plan=${planUpper}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/settings?tab=plan`,
      metadata: {
        userId: req.user.id,
        plan: planUpper
      }
    });

    res.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Error creando sesión de Stripe:', error);
    res.status(500).json({ error: error.message });
  }
}

async function confirmPayment(req, res) {
  const { session_id, plan } = req.body;
  if (!session_id || !plan) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid') {
      const planUpper = plan.toUpperCase();
      const artist = await prisma.artist.updateMany({
        where: { userId: req.user.id },
        data: { plan: planUpper }
      });
      return res.json({ success: true, plan: planUpper });
    } else {
      return res.status(400).json({ error: 'Pago no completado' });
    }
  } catch (error) {
    console.error('Error verificando sesión de Stripe:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { upgradePlan, confirmPayment };
