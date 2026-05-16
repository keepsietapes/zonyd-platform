const logger = require('../utils/logger');
const { generateSingleContent } = require('../utils/aiClient');

/**
 * VISIONARY — Agente Visual
 * AGENTE 4 del ecosistema ZONYD LAB AI (Planeado)
 *
 * Genera prompts precisos para herramientas de IA visual
 * basados en el concepto del artista.
 */
async function generateVisualConcepts(artistName, genre, trackMood) {
  logger.info(`[Visionary] Generando conceptos visuales para ${artistName}`);

  const prompt = `Eres VISIONARY, un director de arte de ZONYD.
Genera 3 prompts en inglés listos para Midjourney o DALL-E para crear la portada de un sencillo.

Contexto:
- Artista: ${artistName}
- Género: ${genre}
- Mood: ${trackMood}

Devuelve JSON estricto:
{
  "prompts": ["Prompt 1...", "Prompt 2...", "Prompt 3..."]
}`;

  try {
    const rawResponse = await generateSingleContent(prompt);
    const jsonMatch = rawResponse.match(/\{\s*"prompts"[\s\S]*\}\s*/);
    return { success: true, ...JSON.parse(jsonMatch[0]) };
  } catch (err) {
    logger.error(`[Visionary] Error: ${err.message}`);
    return { success: false, error: 'Error generando conceptos visuales.' };
  }
}

module.exports = { generateVisualConcepts };
