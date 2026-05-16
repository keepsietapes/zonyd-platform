const logger = require('../utils/logger');
const { generateSingleContent } = require('../utils/aiClient');

/**
 * SYNC BRIDGE — Agente de Sync Licensing
 * AGENTE 10 del ecosistema ZONYD LAB AI (Planeado)
 *
 * Clasifica tracks y genera descripciones para Music Supervisors.
 */
async function generateSyncMetadata(trackName, genre) {
  logger.info(`[SyncBridge] Generando metadata de sync para ${trackName}`);

  const prompt = `Eres SYNC BRIDGE de ZONYD.
Genera metadata de Sync Licensing para la canción "${trackName}" (${genre}).

Devuelve JSON estricto:
{
  "sync_moods": ["Mood 1", "Mood 2"],
  "perfect_for": ["Netflix Drama", "Videojuego de carreras", "Anuncio de ropa"],
  "supervisor_description": "Una frase corta que le venda la canción a un music supervisor."
}`;

  try {
    const rawResponse = await generateSingleContent(prompt);
    const jsonMatch = rawResponse.match(/\{\s*"sync_moods"[\s\S]*\}\s*/);
    return { success: true, ...JSON.parse(jsonMatch[0]) };
  } catch (err) {
    logger.error(`[SyncBridge] Error: ${err.message}`);
    return { success: false, error: 'Error generando metadata de sync.' };
  }
}

module.exports = { generateSyncMetadata };
