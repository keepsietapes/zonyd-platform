const { Queue } = require('bullmq');
const Redis = require('ioredis');
const logger = require('../utils/logger');

const connection = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableOfflineQueue: true,
  connectTimeout: 10000, // 10 segundos para dar margen en despliegues
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

connection.on('error', (err) => {
  logger.error('Redis Connection Error:', err);
});

// Definir la cola con Dead Letter Queue (vía reintentos y eventos)
const distributionQueue = new Queue('distribution', { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false, // Mantener fallidos para inspección manual (DLQ-like)
  }
});

distributionQueue.on('error', (err) => {
  logger.error('BullMQ Distribution Queue Error:', err);
});

module.exports = { distributionQueue, connection };

