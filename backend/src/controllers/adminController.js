const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const { validateForDistribution } = require('../services/dspValidationService');
const { distributionQueue } = require('../jobs/distributionQueue');
const { orchestrator } = require('../services/distributionOrchestrator');
const { ValidationError, NotFoundError } = require('../utils/errors');

/**
 * GET /api/admin/users
 */
async function getAllUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        firstName: true,
        lastName: true,
        artistProfiles: { select: { stageName: true, plan: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/releases — Soporta ?status=PENDING_APPROVAL para la cola de moderación
 */
async function getAllReleases(req, res, next) {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

    const releases = await prisma.release.findMany({
      where,
      include: {
        tracks: { select: { id: true, title: true, isrc: true, status: true, explicit: true } },
        artist: { select: { stageName: true, avatarUrl: true, plan: true } },
        deliveries: { select: { dspName: true, status: true, deliveredAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    res.json(releases);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/releases/:id/approve
 * Aprueba un release y lo encola para distribución inmediata.
 */
async function approveRelease(req, res, next) {
  const { id } = req.params;
  try {
    const release = await prisma.release.findUnique({
      where: { id },
      include: {
        tracks: { include: { splits: true, collaborators: { include: { artist: true } } } },
        artist: true,
      },
    });

    if (!release) throw new NotFoundError('Lanzamiento no encontrado');
    if (release.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        error: `Solo se pueden aprobar releases en estado PENDING_APPROVAL. Estado actual: ${release.status}`,
      });
    }

    // Validación técnica DSP antes de aprobar
    const validation = await validateForDistribution(release);
    if (!validation.isValid) {
      logger.warn(`[AdminController] Aprobación rechazada para ${id}: ${validation.errors.join(', ')}`);
      throw new ValidationError(`El lanzamiento no cumple requisitos técnicos: ${validation.errors.join(' | ')}`);
    }

    // Actualizar a APPROVED
    const updatedRelease = await prisma.release.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    // Registrar en AuditLog
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'RELEASE_APPROVED',
        details: JSON.stringify({
          releaseId: id,
          title: release.title,
          approvedBy: req.user.email,
          validationScore: validation.score,
        }),
      },
    });

    // Encolar para distribución inmediata
    try {
      if (distributionQueue?.add) {
        const job = await distributionQueue.add('distribute-release', { releaseId: id });
        logger.info(`[AdminController] Release ${id} aprobado y encolado — Job: ${job.id}`);
      } else {
        setImmediate(() => orchestrator.orchestrate(id).catch(e => logger.error(`BG distribution error: ${e.message}`)));
      }
    } catch (qErr) {
      logger.warn(`[AdminController] No se pudo encolar (Redis offline): ${qErr.message}`);
    }

    logger.info(`[AdminController] Release ${id} aprobado por ${req.user.email}`);
    res.json({
      success: true,
      message: 'Lanzamiento aprobado y enviado a distribución.',
      release: updatedRelease,
      validationScore: validation.score,
      warnings: validation.warnings,
    });

  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/releases/:id/reject
 * Rechaza un release con razón documentada.
 */
async function rejectRelease(req, res, next) {
  const { id } = req.params;
  const { reason = 'No cumple políticas de distribución.' } = req.body;

  try {
    const release = await prisma.release.findUnique({ where: { id } });
    if (!release) throw new NotFoundError('Lanzamiento no encontrado');

    await prisma.release.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'RELEASE_REJECTED',
        details: JSON.stringify({ releaseId: id, reason, rejectedBy: req.user.email }),
      },
    });

    logger.info(`[AdminController] Release ${id} rechazado por ${req.user.email}: ${reason}`);
    res.json({ success: true, message: 'Release rechazado.', reason });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/stats — Estadísticas del panel de admin
 */
async function getAdminStats(req, res, next) {
  try {
    const [
      totalUsers,
      pendingReleases,
      totalReleases,
      activeDistributions,
      totalRoyalties,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.release.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.release.count(),
      prisma.release.count({ where: { status: { in: ['DISTRIBUTED', 'LIVE'] } } }),
      prisma.royalty.aggregate({ _sum: { amount: true } }),
    ]);

    res.json({
      totalUsers,
      pendingReleases,
      totalReleases,
      activeDistributions,
      totalRevenue: totalRoyalties._sum.amount || 0,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/logs — Últimos AuditLogs del sistema
 */
async function getAuditLogs(req, res, next) {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { email: true, role: true } },
      },
    });
    res.json(logs);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/releases/:id/mark-live
 * Marcar manualmente un release como LIVE en los DSPs.
 */
async function markReleaseLive(req, res, next) {
  const { id } = req.params;
  try {
    const release = await prisma.release.update({
      where: { id },
      data: { status: 'LIVE' },
    });

    await prisma.dspDelivery.updateMany({
      where: { releaseId: id, status: 'DELIVERED' },
      data: { status: 'LIVE' },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'RELEASE_MARKED_LIVE',
        details: JSON.stringify({ releaseId: id, markedBy: req.user.email }),
      },
    });

    res.json({ success: true, message: 'Release marcado como LIVE.', release });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllUsers,
  getAllReleases,
  approveRelease,
  rejectRelease,
  getAdminStats,
  getAuditLogs,
  markReleaseLive,
};
