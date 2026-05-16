const logger = require('../utils/logger');
const { generateSingleContent } = require('../utils/aiClient');

/**
 * RELEASE PREDICTOR — Agente de Predicción de Performance
 * AGENTE 13 del ecosistema ZONYD LAB AI (Propuesto)
 *
 * Utiliza variables del track, timing y metadata para predecir
 * el desempeño potencial del track en la primera semana.
 */

async function predictPerformance(artistScore, viralProbability, genre, releaseDay) {
  logger.info(`[ReleasePredictor] Prediciendo performance para artista con score: ${artistScore}`);

  const prompt = `Eres RELEASE PREDICTOR de ZONYD.
Tu objetivo es predecir el comportamiento de un lanzamiento en sus primeros 7 días basándote en el perfil del artista y el timing.

DATOS:
- Zonyd Artist Score actual: ${artistScore}/100
- Probabilidad de viralidad calculada: ${viralProbability}/100
- Género: ${genre}
- Día de lanzamiento: ${releaseDay}

INSTRUCCIONES:
Basado de forma estricta y realista en estos números (donde un score de 20 significa menos de 100 plays, y un score de 80 significa miles):
1. Predice un rango de streams realistas para la semana 1.
2. Predice el algoritmo de Spotify que más probabilidad tiene de activar (Release Radar, Discover Weekly, Radio, Ninguno).
3. Da 1 advertencia principal de riesgo.

Devuelve ESTRICTAMENTE JSON en este formato:
{
  "streams_prediction_range": "Ej: 150 - 300",
  "likely_algorithm": "Release Radar",
  "risk_warning": "Mensaje de riesgo si la estrategia falla",
  "confidence_level": "Baja | Media | Alta"
}

Solo devuelve JSON. No vendas humo ni exageres los números.`;

  try {
    const rawResponse = await generateSingleContent(prompt);
    
    // Extraer JSON
    const jsonMatch = rawResponse.match(/\{\s*"streams_prediction_range"[\s\S]*\}\s*/);
    if (!jsonMatch) {
      throw new Error('El modelo no devolvió un JSON válido.');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    return { success: true, ...result };
  } catch (err) {
    logger.error(`[ReleasePredictor] Error prediciendo: ${err.message}`);
    return { success: false, error: 'Error calculando predicción. Intenta de nuevo.' };
  }
}

module.exports = { predictPerformance };
