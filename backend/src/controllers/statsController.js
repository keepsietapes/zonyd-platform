const prisma = require('../utils/prisma');

async function getDashboardStats(req, res) {
  try {
    const totalReleases = await prisma.release.count({
      where: { primaryArtistId: { not: '' } } // O filtrar por el artista del usuario si hay auth
    });

    const totalTracks = await prisma.track.count();

    // Suma de regalías (simulado si no hay datos)
    const totalRevenue = await prisma.royalty.aggregate({
      _sum: { amount: true }
    });

    // Streams totales (simulado de la tabla Analytics)
    const totalStreams = await prisma.analytics.aggregate({
      _sum: { streams: true }
    });

    res.json({
      revenue: totalRevenue._sum.amount || 0,
      streams: totalStreams._sum.streams || 0,
      activeReleases: totalReleases,
      nextPayout: (totalRevenue._sum.amount || 0) * 0.8 // Ejemplo de cálculo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getDashboardStats };
