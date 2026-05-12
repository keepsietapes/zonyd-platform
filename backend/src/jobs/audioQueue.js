const { Queue } = require('bullmq');

// const connection = new Redis({
//   host: process.env.REDIS_HOST || '127.0.0.1',
//   port: process.env.REDIS_PORT || 6379,
//   maxRetriesPerRequest: null,
//   enableOfflineQueue: false,
//   connectTimeout: 1000
// });
// Mock temporal para evitar inundar los logs de errores de Redis en local
const connection = {}; 
const audioQueue = { on: () => {}, add: () => {} };

module.exports = { audioQueue, connection };
