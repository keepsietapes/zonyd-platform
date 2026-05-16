const prisma = require('../utils/prisma');
const { generateUPC, generateISRC } = require('../services/codeService');
const { distributionQueue } = require('../jobs/distributionQueue');
const logger = require('../utils/logger');
const { NotFoundError } = require('../utils/errors');

async function createRelease(req, res, next) {
  const { title, trackIds, splits, genre, coverUrl, releaseDate, explicit } = req.body;
  try {
    logger.info(`Iniciando creación de lanzamiento: ${title} para usuario ${req.user.id}`);
    
    // 1. Obtener o crear perfil de artista primario
    let artist = await prisma.artist.findFirst({ where: { userId: req.user.id } });
    if (!artist) {
      artist = await prisma.artist.create({
        data: {
          userId: req.user.id,
          stageName: req.user.firstName || 'Artista Independiente'
        }
      });
    }

    // 2. Crear el lanzamiento con metadatos extendidos
    const release = await prisma.release.create({
      data: {
        title: title || 'Sin Título',
        genre: genre || 'Alternative',
        coverUrl: coverUrl || 'https://zonyd.com/default-cover.png',
        releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
        primaryArtistId: artist.id,
        upc: generateUPC(),
        status: 'PENDING_APPROVAL',
      }
    });

    // 3. Gestionar el track (audio)
    let finalTrackId;
    if (req.body.audioFile) {
      // Crear track nuevo desde la subida directa a R2
      const newTrack = await prisma.track.create({
        data: {
          title: title || 'Untitled Track',
          audioUrl: req.body.audioFile, // Nombre del archivo en R2
          releaseId: release.id,
          artistId: artist.id,
          isrc: generateISRC(),
          status: 'ready'
        }
      });
      finalTrackId = newTrack.id;
    } else if (trackIds && trackIds.length > 0) {
      finalTrackId = trackIds[0];
      if (finalTrackId.startsWith('local-')) {
        // Track mock desde el frontend, lo creamos
        const newTrack = await prisma.track.create({
          data: {
            title: title || 'Untitled Track',
            releaseId: release.id,
            artistId: artist.id,
            isrc: generateISRC(),
            status: 'ready'
          }
        });
        finalTrackId = newTrack.id;
      } else {
        await prisma.track.update({
          where: { id: finalTrackId },
          data: { releaseId: release.id, isrc: generateISRC(), status: 'ready' }
        });
      }
    }

    // 4. Crear Splits de regalías si existen
    if (finalTrackId && splits && splits.length > 0) {
      for (const split of splits) {
        await prisma.split.create({
          data: {
            trackId: finalTrackId,
            artistId: split.artistId === 'me' ? artist.id : split.artistId,
            percentage: parseFloat(split.percentage)
          }
        });
      }
    }


    // 5. Notificar al sistema de distribución (con fallback)
    try {
      if (distributionQueue && distributionQueue.add) {
        await distributionQueue.add('process-release', { releaseId: release.id });
      } else {
        const { processDistribution } = require('../services/distributionService');
        processDistribution(release.id).catch(e => logger.error("Fallback distribution error:", e));
      }
    } catch (e) {
      logger.warn("Redis offline - Distribución en cola local");
    }

    res.status(201).json({
      success: true,
      message: "Lanzamiento creado exitosamente y enviado a revisión.",
      releaseId: release.id,
      upc: release.upc
    });
  } catch (error) {
    logger.error("Error crítico en createRelease:", error.message);
    next(error);
  }
}

async function getReleases(req, res, next) {
  try {
    // Obtener todos los IDs de artistas vinculados al usuario
    const userArtists = await prisma.artist.findMany({ 
      where: { userId: req.user.id },
      select: { id: true }
    });
    
    if (userArtists.length === 0) return res.json([]);

    const artistIds = userArtists.map(a => a.id);

    const releases = await prisma.release.findMany({
      where: { primaryArtistId: { in: artistIds } },
      include: { tracks: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    res.json(releases);
  } catch (error) {
    next(error);
  }
}

module.exports = { createRelease, getReleases };
