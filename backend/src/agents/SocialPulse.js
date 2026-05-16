const logger = require('../utils/logger');
const { generateSingleContent } = require('../utils/aiClient');

/**
 * SOCIAL PULSE — Agente de Contenido y Redes Sociales
 * AGENTE 5 del ecosistema ZONYD LAB AI
 *
 * Genera ideas de contenido estructurado para redes sociales
 * adaptadas al estilo del artista y plataforma.
 */

const PLATFORM_SPECS = {
  tiktok: { duration: '15-60s', style: 'Rápido, hook visual en 2s, orgánico, tendencia', hashtags: 4 },
  reels: { duration: '15-30s', style: 'Estético, texto en pantalla, audio de alta calidad', hashtags: 8 },
  shorts: { duration: '15-60s', style: 'Retención alta, loopable, call to action claro', hashtags: 3 },
  instagram_post: { style: 'Carrusel o foto de alta calidad, caption envolvente', hashtags: 15 },
};

/**
 * Genera ideas de contenido para una plataforma específica.
 */
async function generateContentIdeas(platform, count, genre, mood, trackName = '') {
  logger.info(`[SocialPulse] Generando ${count} ideas para ${platform} (Género: ${genre})`);
  
  const specs = PLATFORM_SPECS[platform.toLowerCase()] || PLATFORM_SPECS.tiktok;
  
  const prompt = `Eres SOCIAL PULSE, el director creativo digital de ZONYD.
Tu objetivo es crear contenido viral y de alta retención para un artista independiente.

CONTEXTO:
- Plataforma: ${platform.toUpperCase()}
- Género musical: ${genre}
- Mood/Vibe: ${mood}
- Canción a promocionar: ${trackName || '(Cualquier track propio)'}

REGLAS DE LA PLATAFORMA:
- Estilo requerido: ${specs.style}
- Cantidad de hashtags: ${specs.hashtags}

TAREA:
Genera exactamente ${count} ideas de contenido distintas y altamente creativas.
Para cada idea, proporciona el siguiente formato JSON estricto (devuelve un array de objetos JSON):
[
  {
    "title": "Título corto de la idea",
    "hook": "El gancho visual/texto de los primeros 3 segundos",
    "description": "Descripción detallada de la toma, actuación y texto en pantalla",
    "caption": "El texto descriptivo para el post",
    "hashtags": ["#tag1", "#tag2"]
  }
]

Asegúrate de que el formato sea JSON válido y no devuelvas texto fuera del JSON.`;

  try {
    const rawResponse = await generateSingleContent(prompt);
    
    // Extraer JSON del texto (por si hay markdown de código)
    const jsonMatch = rawResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error('El modelo no devolvió un JSON válido.');
    }
    
    const ideas = JSON.parse(jsonMatch[0]);
    return { success: true, platform, count: ideas.length, ideas };
  } catch (err) {
    logger.error(`[SocialPulse] Error generando ideas: ${err.message}`);
    return { success: false, error: 'No se pudieron generar ideas en este momento. Intenta de nuevo.' };
  }
}

module.exports = { generateContentIdeas };
