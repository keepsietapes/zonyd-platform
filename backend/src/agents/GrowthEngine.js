const logger = require('../utils/logger');
const { generateSingleContent, extractJson } = require('../utils/aiClient');

/**
 * GROWTH ENGINE — Agente de Campañas Publicitarias
 * AGENTE 6 del ecosistema ZONYD LAB AI (Planeado)
 *
 * Asiste en la creación y segmentación de campañas (Meta/TikTok Ads).
 */
async function generateAdsStrategy(genre, budget) {
  logger.info(`[GrowthEngine] Generando estrategia de Ads para ${genre} con $${budget}`);

  const prompt = `Eres GROWTH ENGINE, un Media Buyer de ZONYD.
Crea una estrategia de Ads para un artista de ${genre} con un presupuesto de $${budget} USD.

Devuelve JSON estricto:
{
  "recommended_platform": "TikTok | Instagram",
  "audience_targeting": "Descripción de la segmentación (intereses, edades)",
  "ad_format": "Video vertical | Carrusel",
  "budget_split": "Cómo dividir el presupuesto diario"
}`;

  try {
    const rawResponse = await generateSingleContent(prompt);
    const parsedData = extractJson(rawResponse);
    return { success: true, ...parsedData };
  } catch (err) {
    logger.error(`[GrowthEngine] Error: ${err.message}`);
    return { success: false, error: 'Error generando estrategia de ads.' };
  }
}

module.exports = { generateAdsStrategy };
