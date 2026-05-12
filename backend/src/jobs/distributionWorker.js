const { Worker } = require('bullmq');
const { connection } = require('./audioQueue'); 
const { processDistribution } = require('../services/distributionService');

const worker = new Worker('distribution-simulator', async job => {
  const { releaseId } = job.data;
  await processDistribution(releaseId);
}, { connection });

module.exports = worker;
