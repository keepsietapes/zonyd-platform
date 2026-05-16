const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// GET /api/audience — Datos de audiencia del artista
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const artist = await prisma.artist.findFirst({
      where: { userId: req.user.id },
      include: {
        fans: {
          take: 200,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!artist) return res.json({ totalFans: 0, superfans: 0, countries: 0, fans: [] });

    const fans = (artist.fans || []).map(f => ({
      id: f.id,
      name: f.name || 'Fan Anónimo',
      email: f.email || '',
      location: f.country || '—',
      engagement: f.engagementScore || 0,
      lastSeen: f.lastActiveAt ? new Date(f.lastActiveAt).toLocaleDateString() : '—',
    }));

    const superfans = fans.filter(f => f.engagement >= 80).length;
    const countries = new Set(fans.map(f => f.location).filter(l => l !== '—')).size;

    res.json({
      totalFans: fans.length,
      superfans,
      countries,
      fans,
    });
  } catch (err) {
    logger.error(`[Audience:GET] ${err.message}`);
    next(err);
  }
});

module.exports = router;
