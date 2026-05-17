const prisma = require('../utils/prisma');

async function getDashboardStats(req, res) {
  try {
    const artist = await prisma.artist.findFirst({
      where: { userId: req.user.id }
    });

    if (!artist) {
      return res.json({
        revenue: 0,
        streams: 0,
        activeReleases: 0,
        nextPayout: 0,
        activeSmartLinks: 0
      });
    }

    const totalReleases = await prisma.release.count({
      where: { primaryArtistId: artist.id }
    });

    // Suma de regalías del artista
    const totalRevenue = await prisma.royalty.aggregate({
      where: { artistId: artist.id },
      _sum: { amount: true }
    });

    // Streams totales de los tracks del artista
    const totalStreams = await prisma.analytics.aggregate({
      where: {
        track: {
          release: {
            primaryArtistId: artist.id
          }
        }
      },
      _sum: { streams: true }
    });

    // SmartLinks activos del artista
    const activeSmartLinks = await prisma.smartLink.count({
      where: { artistId: artist.id }
    });

    res.json({
      revenue: totalRevenue._sum.amount || 0,
      streams: totalStreams._sum.streams || 0,
      activeReleases: totalReleases,
      nextPayout: (totalRevenue._sum.amount || 0) * 0.8, // Ejemplo de cálculo
      activeSmartLinks: activeSmartLinks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getDashboardStats };
