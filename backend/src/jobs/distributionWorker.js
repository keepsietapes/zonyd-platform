const { Worker } = require('bullmq');
const { connection } = require('./audioQueue');
const { orchestrator } = require('../services/distributionOrchestrator');
const logger = require('../utils/logger');

/**
 * Distribution Worker — Zonyd BullMQ Worker
 * 
 * Reemplaza el worker anterior que solo llamaba processDistribution (setTimeout).
 * Ahora llama al DistributionOrchestrator real con todo el pipeline.
 * 
 * Cola: 'distribution'
 * Concurrencia: 3 jobs simultáneos (configurable)
 */
const worker = new Worker(
  'distribution',
  async (job) => {
    const { releaseId } = job.data;

    logger.info(`[DistributionWorker] Procesando job ${job.id} — Release: ${releaseId}`);

    const result = await orchestrator.orchestrate(releaseId, {
      attemptsMade: job.attemptsMade,
      jobId: job.id,
    });

    return result;
  },
  {
    connection,
    concurrency: parseInt(process.env.DISTRIBUTION_WORKER_CONCURRENCY || '3', 10),
    limiter: {
      max: 10,
      duration: 60000, // max 10 distribuciones por minuto
    },
  }
);

worker.on('completed', (job, result) => {
  logger.info(`[DistributionWorker] ✅ Job ${job.id} completado — Release: ${job.data.releaseId} | Delivery: ${result?.deliveryId}`);
});

worker.on('failed', (job, err) => {
  logger.error(`[DistributionWorker] ❌ Job ${job?.id} fallido (Attempt ${job?.attemptsMade}/${job?.opts?.attempts}): ${err.message}`);
});

worker.on('stalled', (jobId) => {
  logger.warn(`[DistributionWorker] ⚠️ Job ${jobId} en estado stalled. Revisando...`);
});

worker.on('error', (err) => {
  logger.error(`[DistributionWorker] Error del worker: ${err.message}`);
});

module.exports = worker;
