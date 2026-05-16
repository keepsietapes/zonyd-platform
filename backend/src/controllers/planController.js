const prisma = require('../utils/prisma');

async function upgradePlan(req, res) {
  const { plan } = req.body;
  const planUpper = plan.toUpperCase();
  if (!['FREE', 'INDIE', 'PRO', 'LABEL'].includes(planUpper)) {
    return res.status(400).json({ error: 'Plan inválido' });
  }

  try {
    const artist = await prisma.artist.updateMany({
      where: { userId: req.user.id },
      data: { plan: planUpper }
    });
    res.json({ success: true, updated: artist.count > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { upgradePlan };
