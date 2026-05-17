const logger = require('../utils/logger');
const { generateSingleContent, extractJson } = require('../utils/aiClient');

/**
 * SONIC FORGE — Agente Productor (Análisis Estructural)
 * AGENTE 2 del ecosistema ZONYD LAB AI (Planeado)
 *
 * Analiza un género o estado de ánimo para sugerir estructuras musicales,
 * tempos, e instrumentación. (No genera audio real directamente, sino el blueprint).
 */
async function generateMusicalBlueprint(genre, mood) {
  logger.info(`[SonicForge] Generando blueprint musical para ${genre} (${mood})`);

  const prompt = `Eres SONIC FORGE, un Productor Musical top de ZONYD.
Genera un blueprint musical (estructura de canción, tempo, instrumentos clave) para una pista.

Contexto:
- Género: ${genre}
- Mood: ${mood}

Devuelve JSON estricto:
{
  "recommended_bpm_range": "Ej: 120-128",
  "key_instruments": ["Inst 1", "Inst 2", "Inst 3"],
  "song_structure": "Intro - Verse - Chorus - Verse - Chorus - Outro",
  "production_tip": "Un consejo clave de producción para este género."
}`;

  try {
    const rawResponse = await generateSingleContent(prompt);
    const parsedData = extractJson(rawResponse);
    return { success: true, ...parsedData };
  } catch (err) {
    logger.error(`[SonicForge] Error: ${err.message}`);
    return { success: false, error: 'Error generando blueprint musical.' };
  }
}

module.exports = { generateMusicalBlueprint };
