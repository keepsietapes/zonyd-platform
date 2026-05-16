const logger = require('../utils/logger');
const { generateSingleContent } = require('../utils/aiClient');

/**
 * RELEASE COMMAND — Agente de Optimización de Distribución
 * AGENTE 9 del ecosistema ZONYD LAB AI (Planeado)
 *
 * Analiza la metadata del release ANTES de enviarlo al partner de distribución.
 * Optimiza títulos, detecta mood, y genera el pitch para Spotify For Artists.
 */

async function optimizeReleaseMetadata(releaseData) {
  logger.info(`[ReleaseCommand] Optimizando metadata para: ${releaseData.title}`);

  const prompt = `Eres RELEASE COMMAND, un experto en distribución digital y SEO musical de ZONYD.
Tu objetivo es auditar y optimizar los metadatos de un lanzamiento antes de que se envíe a Spotify y Apple Music.

DATOS DEL LANZAMIENTO:
- Título original: "${releaseData.title}"
- Artista: ${releaseData.artistName}
- Género principal: ${releaseData.genre}
- Idioma: ${releaseData.language || 'Español'}

INSTRUCCIONES:
1. Mejora el SEO del título si es necesario (sin alterar la obra, pero sugiriendo formato ideal).
2. Sugiere 3 subgéneros exactos que Apple Music / Spotify reconozcan.
3. Sugiere 3 "Moods" oficiales para pitching editorial.
4. Genera un Pitch de 500 caracteres exactos, listo para copiar y pegar en "Spotify For Artists".

Devuelve ESTRICTAMENTE JSON en este formato:
{
  "optimized_title_suggestions": ["Sugerencia 1", "Sugerencia 2"],
  "subgenres": ["Sub 1", "Sub 2", "Sub 3"],
  "moods": ["Mood 1", "Mood 2", "Mood 3"],
  "spotify_pitch": "Texto del pitch para Spotify (max 500 chars)"
}

Solo devuelve el JSON válido.`;

  try {
    const rawResponse = await generateSingleContent(prompt);
    
    // Extraer JSON
    const jsonMatch = rawResponse.match(/\{\s*"optimized_title_suggestions"[\s\S]*\}\s*/);
    if (!jsonMatch) {
      throw new Error('El modelo no devolvió un JSON válido.');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    return { success: true, ...result };
  } catch (err) {
    logger.error(`[ReleaseCommand] Error optimizando metadata: ${err.message}`);
    return { success: false, error: 'Error analizando metadata. Intenta de nuevo.' };
  }
}

module.exports = { optimizeReleaseMetadata };
