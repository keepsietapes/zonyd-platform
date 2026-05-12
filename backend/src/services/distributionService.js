const prisma = require('../utils/prisma');

async function processDistribution(releaseId) {
  console.log(`[DistributionService] Iniciando procesamiento para release ${releaseId}...`);

  // 1. Simular tiempo de procesamiento (en modo real aquí se generaría el XML DDEX)
  // En desarrollo lo hacemos rápido
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 2. Actualizar estado a DISTRIBUTED y generar pre-save real
  const preSaveUrl = `https://zonyd.com/pre/${releaseId.substring(0, 8)}`;
  
  const updatedRelease = await prisma.release.update({
    where: { id: releaseId },
    data: {
      status: 'DISTRIBUTED',
      preSaveUrl,
      distributedAt: new Date()
    }
  });

  console.log(`[DistributionService] Distribución completada para ${releaseId}.`);
  return updatedRelease;
}

module.exports = { processDistribution };
