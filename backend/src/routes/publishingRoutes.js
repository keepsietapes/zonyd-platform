const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// GET /api/publishing — Dashboard de Publishing del artista
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const artist = await prisma.artist.findFirst({
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
    let artist = await prisma.artist.findFirst({ where: { userId: req.user.id } });
    if (!artist) {
      artist = await prisma.artist.create({ data: { userId: req.user.id, stageName: 'Artista', plan: 'FREE' } });
    }

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
    }).catch(e => logger.warn(`[Publishing] AuditLog: ${e.message}`));

    res.json({ success: true, work });
  } catch (err) {
    logger.error(`[Publishing:POST/works] ${err.message}`);
    next(err);
  }
});

// PATCH /api/publishing/society — Vincular/desvincular sociedad PRO
router.patch('/society', authMiddleware, async (req, res, next) => {
  try {
    let artist = await prisma.artist.findFirst({ where: { userId: req.user.id } });
    if (!artist) {
      artist = await prisma.artist.create({ data: { userId: req.user.id, stageName: 'Artista', plan: 'FREE' } });
    }

    const { society } = req.body;
    
    if (society === null || society === '') {
      const updated = await prisma.artist.update({
        where: { id: artist.id },
        data: { proSociety: null }
      });
      return res.json({ success: true, proSociety: null });
    }

    const validSocieties = ['SACM', 'ASCAP', 'BMI', 'SGAE', 'SESAC', 'SOCAN', 'PRS'];
    if (!validSocieties.includes(society)) {
      return res.status(400).json({ error: `Sociedad no válida. Opciones: ${validSocieties.join(', ')}` });
    }

    const updated = await prisma.artist.update({
      where: { id: artist.id },
      data: { proSociety: society }
    });

    res.json({ success: true, proSociety: updated.proSociety });
  } catch (err) {
    logger.error(`[Publishing:PATCH/society] ${err.message}`);
    next(err);
  }
});

module.exports = router;
