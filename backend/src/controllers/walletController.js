const prisma = require('../utils/prisma');

async function getBalance(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId: req.user.id }
    });

    if (!wallet) {
      return res.json({ balance: 0 });
    }

    const totalRevenue = await prisma.royalty.aggregate({
      where: { walletId: wallet.id },
      _sum: { amount: true }
    });

    const totalPaid = await prisma.payout.aggregate({
      where: { walletId: wallet.id, status: 'PAID' },
      _sum: { amount: true }
    });
    
    const balance = (totalRevenue._sum.amount || 0) - (totalPaid._sum.amount || 0);
    res.json({ balance });
  } catch (error) {
    console.error('Error getBalance:', error);
    res.status(500).json({ error: 'Error al obtener el saldo' });
  }
}

async function requestWithdrawal(req, res) {
  try {
    const { amount } = req.body;
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.id }
    });

    if (!wallet) return res.status(404).json({ error: "Wallet no encontrada" });

    const totalRevenue = await prisma.royalty.aggregate({
      where: { walletId: wallet.id },
      _sum: { amount: true }
    });

    const totalPaid = await prisma.payout.aggregate({
      where: { walletId: wallet.id, status: 'PAID' },
      _sum: { amount: true }
    });

    const balance = (totalRevenue._sum.amount || 0) - (totalPaid._sum.amount || 0);

    if(amount > balance) return res.status(400).json({error: "Fondos insuficientes"});

    const payout = await prisma.payout.create({ 
      data: { 
        amount, 
        walletId: wallet.id,
        method: 'PAYPAL',
        status: 'PENDING'
      } 
    });
    res.json(payout);
  } catch (error) {
    console.error('Error requestWithdrawal:', error);
    res.status(500).json({ error: 'Error al procesar el retiro' });
  }
}

module.exports = { getBalance, requestWithdrawal };
