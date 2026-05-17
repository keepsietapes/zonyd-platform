const logger = require('../utils/logger');
const { generateSingleContent, extractJson } = require('../utils/aiClient');

/**
 * FAN GRID — Agente de Community Management
 * AGENTE 8 del ecosistema ZONYD LAB AI (Planeado)
 *
 * Clasifica comentarios y sugiere respuestas sin riesgo de automatización invasiva.
 */
async function analyzeComment(commentText) {
  logger.info(`[FanGrid] Analizando comentario de fan...`);

  const prompt = `Eres FAN GRID, el Community Manager de ZONYD.
Clasifica el siguiente comentario de un fan y sugiere 2 posibles respuestas.

Comentario: "${commentText}"

Devuelve JSON estricto:
{
  "sentiment": "Positivo | Negativo | Neutro | Superfan",
  "suggested_replies": ["Respuesta 1", "Respuesta 2"]
}`;

  try {
    const rawResponse = await generateSingleContent(prompt);
    const parsedData = extractJson(rawResponse);
    return { success: true, ...parsedData };
  } catch (err) {
    logger.error(`[FanGrid] Error: ${err.message}`);
    return { success: false, error: 'Error analizando comentario.' };
  }
}

module.exports = { analyzeComment };
