const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// GET /api/publishing — Dashboard de Publishing del artista
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const artist = await prisma.artist.findUnique({
      where: { userId: req.user.id },
      include: {
        releases: {
          where: { status: { in: ['DISTRIBUTED', 'LIVE'] } },
          include: { tracks: true },
        },
        royalties: true,
      },
    });

    if (!artist) return res.json({ registeredWorks: 0, editorialRoyalties: 0, contentIdClaims: 0, works: [], linkedSocieties: [] });

    const works = artist.releases.flatMap(r =>
      r.tracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: artist.stageName,
        pro: artist.proSociety || null,
        status: r.status === 'LIVE' ? 'Registered' : 'Pending',
        isrc: t.isrc,
      }))
    );

    const totalRoyalties = artist.royalties?.reduce((acc, r) => acc + (r.amount || 0), 0) || 0;

    res.json({
      registeredWorks: works.length,
      editorialRoyalties: parseFloat(totalRoyalties.toFixed(2)),
      contentIdClaims: 0,
      works,
      linkedSocieties: artist.proSociety ? [artist.proSociety] : [],
    });
  } catch (err) {
    logger.error(`[Publishing:GET] ${err.message}`);
    next(err);
  }
});

// POST /api/publishing/works — Registrar nueva obra
router.post('/works', authMiddleware, async (req, res, next) => {
  try {
    const artist = await prisma.artist.findUnique({ where: { userId: req.user.id } });
    if (!artist) return res.status(404).json({ error: 'Perfil de artista requerido.' });

    const { title, coAuthors = [], pro, lyrics } = req.body;
    if (!title) return res.status(400).json({ error: 'El título de la obra es requerido.' });

    // Registrar como track asociado a un release draft si no tiene release
    const work = await prisma.publishingWork.create({
      data: {
        artistId: artist.id,
        title,
        coAuthors,
        pro: pro || null,
        lyrics: lyrics || null,
        status: 'REGISTERED',
      },
    });

    await prisma.auditLog.create({
      data: { userId: req.user.id, action: 'PUBLISHING_WORK_REGISTERED', details: JSON.stringify({ workId: work.id, title }) },
    });

    res.json({ success: true, work });
  } catch (err) {
    logger.error(`[Publishing:POST/works] ${err.message}`);
    next(err);
  }
});

module.exports = router;
