const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const { validateForDistribution } = require('../services/dspValidationService');
const { ValidationError, NotFoundError } = require('../utils/errors');

async function getAllUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
      take: 100
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function getAllReleases(req, res, next) {
  try {
    const releases = await prisma.release.findMany({ 
      include: { tracks: true, artist: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(releases);
  } catch (error) {
    next(error);
  }
}

async function approveRelease(req, res, next) {
  const { id } = req.params;
  try {
    const release = await prisma.release.findUnique({
      where: { id },
      include: { tracks: true }
    });

    if (!release) throw new NotFoundError('Lanzamiento no encontrado');

    // 1. Validación Técnica DSP antes de Aprobar
    const validation = await validateForDistribution(release);
    if (!validation.isValid) {
      logger.warn(`Intento de aprobación fallido para release ${id}: ${validation.errors.join(', ')}`);
      throw new ValidationError(`El lanzamiento no cumple los requisitos técnicos: ${validation.errors.join(' | ')}`);
    }

    // 2. Actualizar estado
    const updatedRelease = await prisma.release.update({
      where: { id },
      data: { 
        status: 'APPROVED',
        distributedAt: new Date() 
      }
    });

    logger.info(`Lanzamiento ${id} aprobado y validado técnicamente para distribución.`);
    res.json({ 
      success: true, 
      message: 'Lanzamiento aprobado y validado técnicamente.',
      release: updatedRelease 
    });

  } catch (error) {
    next(error);
  }
}

module.exports = { getAllUsers, getAllReleases, approveRelease };
