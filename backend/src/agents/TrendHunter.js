const logger = require('../utils/logger');
const { generateSingleContent } = require('../utils/aiClient');

/**
 * TREND HUNTER — Agente de Tendencias en Tiempo Real
 * AGENTE 12 del ecosistema ZONYD LAB AI (Propuesto)
 *
 * Simula (o integra con APIs) la detección de tendencias en TikTok y Spotify.
 * Genera alertas accionables para el artista basadas en su género musical.
 */

async function huntTrends(genre, country = 'MX') {
  logger.info(`[TrendHunter] Buscando tendencias para género=${genre} en país=${country}`);

  const prompt = `Eres TREND HUNTER, el Analista de Tendencias y Mentor Musical de ZONYD LAB AI.
Tu trabajo es explicarle a los artistas qué está funcionando en la música hoy de una manera muy fácil de entender, como un profesor amigable y experto.

CONTEXTO CULTURAL:
- Género musical del Artista: ${genre}
- País: ${country}

INSTRUCCIONES:
Genera 3 tendencias reales que estén sucediendo AHORA MISMO y que sean perfectas para el género ${genre}.
Explícalas de forma sencilla. Evita usar palabras complicadas como "macro-tendencias sociológicas", "funnel", "retención". Habla claro y directo.

El formato de salida DEBE SER ESTRICTAMENTE JSON (un array de objetos JSON), sin texto adicional:
[
  {
    "trend_name": "Nombre de la tendencia (ej: 'Voz muy cerca del micrófono' o 'Guitarras de los 2000s')",
    "platform": "TikTok | Spotify | YouTube Shorts | Instagram Reels",
    "description": "Explícale al artista en palabras sencillas por qué a la gente le está gustando esto y cómo suena.",
    "actionable_advice": "Qué debe hacer el artista EXACTAMENTE HOY. Dale un ejemplo claro (ej. 'Toma tu celular, ponte audífonos y graba un video cantando muy cerca de la cámara como si le contaras un secreto a alguien')."
  }
]

CERO EXPLICACIONES EXTERNAS. SOLO JSON VÁLIDO.`;

  try {
    const rawResponse = await generateSingleContent(prompt);
    
    // Extraer JSON del texto
    const jsonMatch = rawResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error('El modelo no devolvió un JSON válido.');
    }
    
    const trends = JSON.parse(jsonMatch[0]);
    return { success: true, genre, country, trends, timestamp: new Date().toISOString() };
  } catch (err) {
    logger.error(`[TrendHunter] Error cazando tendencias: ${err.message}`);
    return { success: false, error: 'Error analizando tendencias globales. Intenta de nuevo.' };
  }
}

module.exports = { huntTrends };
