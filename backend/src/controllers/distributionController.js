const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const { generateDDEXPackage } = require('../services/ddexService');
const { distributionQueue } = require('../jobs/distributionQueue');
const { orchestrator } = require('../services/distributionOrchestrator');
const { requireRole } = require('../middleware/rbacMiddleware');

/**
 * POST /api/distribute/:id
 * Encola un release para distribución.
 * Reemplaza la versión anterior que llamaba a generateManifest() inexistente.
 */
async function distribute(req, res, next) {
  const { id } = req.params;

  try {
    const release = await prisma.release.findUnique({
      where: { id },
      include: { tracks: true, artist: true },
    });

    if (!release) {
      return res.status(404).json({ error: 'Release no encontrado.' });
    }

    if (release.status !== 'APPROVED') {
      return res.status(400).json({
        error: 'El release debe estar en estado APPROVED para distribuirse.',
        currentStatus: release.status,
      });
    }

    // Encolar en BullMQ (con fallback síncrono si Redis no está disponible)
    let jobId;
    try {
      if (distributionQueue?.add) {
        const job = await distributionQueue.add('distribute-release', { releaseId: id });
        jobId = job.id;
        logger.info(`[DistributionController] Release ${id} encolado en BullMQ — Job: ${jobId}`);
      } else {
        throw new Error('Queue no disponible');
      }
    } catch (queueErr) {
      logger.warn(`[DistributionController] Redis offline — ejecutando distribución en background: ${queueErr.message}`);
      setImmediate(() => {
        orchestrator.orchestrate(id).catch(err =>
          logger.error(`[DistributionController] Error en distribución background: ${err.message}`)
        );
      });
    }

    res.json({
      success: true,
      message: 'Release encolado para distribución. Recibirás notificación al completar.',
      releaseId: id,
      jobId: jobId || 'background',
      status: 'PROCESSING',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/distribute/:id/status
 * Obtener el estado actual de distribución de un release.
 */
async function getDistributionStatus(req, res, next) {
  const { id } = req.params;

  try {
    const release = await prisma.release.findUnique({
      where: { id },
      include: {
        deliveries: {
          orderBy: { deliveredAt: 'desc' },
        },
      },
    });

    if (!release) {
      return res.status(404).json({ error: 'Release no encontrado.' });
    }

    const dspSummary = release.deliveries.map(d => ({
      dsp: d.dspName,
      status: d.status,
      deliveredAt: d.deliveredAt,
      partnerDeliveryId: d.partnerDeliveryId,
      ddexPackageUrl: d.ddexPackageUrl,
    }));

    res.json({
      releaseId: id,
      title: release.title,
      status: release.status,
      distributedAt: release.distributedAt,
      preSaveUrl: release.preSaveUrl,
      dsps: dspSummary,
      dspCount: dspSummary.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/distribute/:id/takedown
 * Solicitar el retiro de un release de los DSPs.
 */
async function requestTakedown(req, res, next) {
  const { id } = req.params;
  const { reason = 'Artist request' } = req.body;

  try {
    const results = await orchestrator.requestTakedown(id, reason);
    res.json({ success: true, message: 'Takedown iniciado.', results });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/distribute/health
 * Estado del provider de distribución activo.
 */
async function getProviderHealth(req, res, next) {
  try {
    const health = await orchestrator.checkProviderHealth();
    const mode = process.env.DISTRIBUTION_MODE || 'simulation';
    res.json({
      provider: orchestrator.provider.name,
      mode,
      ...health,
      timestamp: new Date(),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { distribute, getDistributionStatus, requestTakedown, getProviderHealth };
