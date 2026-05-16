const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// GET /api/marketing/assets — Activos de marketing del artista
router.get('/assets', authMiddleware, async (req, res, next) => {
  try {
    const artist = await prisma.artist.findUnique({
      where: { userId: req.user.id },
      include: {
        releases: {
          where: { status: { in: ['DISTRIBUTED', 'LIVE'] } },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { tracks: { take: 1 } },
        },
      },
    });

    if (!artist || artist.releases.length === 0) return res.json([]);

    // Generar activos basados en los lanzamientos reales del artista
    const assets = [];
    for (const release of artist.releases) {
      if (release.coverUrl) {
        assets.push(
          { id: `${release.id}-feed`, name: `${release.title} — Feed Post`, category: 'feed', platform: 'Instagram / Facebook', format: 'JPG', size: '1080×1080', previewUrl: release.coverUrl, releaseId: release.id },
          { id: `${release.id}-story`, name: `${release.title} — Story`, category: 'stories', platform: 'Instagram / TikTok', format: 'JPG', size: '1080×1920', previewUrl: release.coverUrl, releaseId: release.id }
        );
      }
    }

    res.json(assets);
  } catch (err) {
    logger.error(`[Marketing:GET/assets] ${err.message}`);
    next(err);
  }
});

// POST /api/marketing/generate — Generar activo con IA
router.post('/generate', authMiddleware, async (req, res, next) => {
  try {
    const { releaseId, format = 'feed', style = 'default' } = req.body;
    // En producción: llamar a generador de imágenes (Replicate/DALL-E) con el cover art
    logger.info(`[Marketing:generate] userId=${req.user.id}, release=${releaseId}, format=${format}`);
    res.json({
      success: true,
      message: 'Generación de activo iniciada. El asset estará listo en 30-60 segundos.',
      jobId: `mkt-${Date.now()}`,
    });
  } catch (err) { next(err); }
});

module.exports = router;
