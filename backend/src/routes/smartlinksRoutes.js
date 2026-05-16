const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// GET /api/smartlinks — Lista SmartLinks del artista
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const artist = await prisma.artist.findFirst({ where: { userId: req.user.id } });
    if (!artist) return res.json([]);

    const links = await prisma.smartLink.findMany({
      where: { artistId: artist.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(links);
  } catch (err) {
    logger.error(`[SmartLinks:GET] ${err.message}`);
    next(err);
  }
});

// POST /api/smartlinks — Crear SmartLink
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const artist = await prisma.artist.findFirst({ where: { userId: req.user.id } });
    if (!artist) return res.status(404).json({ error: 'Perfil de artista no encontrado.' });

    const { title = 'Nuevo SmartLink', coverUrl, stores } = req.body;
    const link = await prisma.smartLink.create({
      data: {
        artistId: artist.id,
        title,
        coverUrl: coverUrl || null,
        status: 'Draft',
        clicks: 0,
        artistName: artist.stageName,
        stores: stores || [],
      },
    });
    
    try {
      await prisma.auditLog.create({
        data: { userId: req.user.id, action: 'SMARTLINK_CREATED', details: JSON.stringify({ linkId: link.id, title }) },
      });
    } catch (logErr) {
      logger.warn(`[SmartLinks:POST] AuditLog write failed: ${logErr.message}`);
    }

    res.json(link);
  } catch (err) {
    logger.error(`[SmartLinks:POST] ${err.message}`);
    next(err);
  }
});

// PATCH /api/smartlinks/:id — Actualizar SmartLink
router.patch('/:id', authMiddleware, async (req, res, next) => {
  try {
    const artist = await prisma.artist.findFirst({ where: { userId: req.user.id } });
    const link = await prisma.smartLink.findFirst({ where: { id: req.params.id, artistId: artist?.id } });
    if (!link) return res.status(404).json({ error: 'SmartLink no encontrado.' });

    const updated = await prisma.smartLink.update({
      where: { id: req.params.id },
      data: { ...req.body, updatedAt: new Date() },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

module.exports = router;
