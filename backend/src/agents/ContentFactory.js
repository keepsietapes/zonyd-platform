const logger = require('../utils/logger');
const { generateSingleContent } = require('../utils/aiClient');

/**
 * CONTENT FACTORY — Generador Masivo de Assets Post-Lanzamiento
 * AGENTE 15 del ecosistema ZONYD LAB AI (Propuesto)
 *
 * Toma los metadatos de un lanzamiento (Release) y genera automáticamente
 * un plan y copies de promoción de 30 días, pitch de prensa y variaciones para redes.
 */

async function generateReleaseCampaign(releaseName, artistName, genre, trackMood) {
  logger.info(`[ContentFactory] Generando campaña masiva para "${releaseName}" de ${artistName}`);

  const prompt = `Eres CONTENT FACTORY, la mente maestra de marketing musical y estratega de contenido de ZONYD LAB AI.
Tu objetivo no es crear posts genéricos. Tu objetivo es diseñar una arquitectura de contenido profundamente auténtica, culturalmente resonante y basada en la identidad del artista. Rechaza consejos anticuados ("comenta qué opinas", "haz un baile"). Buscamos retención profunda, creación de culto (cult-following) y conversión de oyentes a superfans.

CONTEXTO PSICOLÓGICO Y SONORO DEL LANZAMIENTO:
- Artista: ${artistName}
- Título de la obra: "${releaseName}"
- Género / Subcultura: ${genre}
- Mood principal / Textura Emocional: ${trackMood}

TAREA:
Desarrolla una campaña post-lanzamiento de 30 días. La narrativa debe sentirse como un documental de autor, no como un anuncio comercial.
El formato de salida debe ser ESTRICTAMENTE JSON válido, respetando la estructura a continuación sin texto markdown externo:

{
  "campaign_title": "Nombre conceptual de la campaña (ej. 'Fase 1: El Descenso')",
  "core_message": "El mensaje central de la canción explicado de forma simple y emocional.",
  "press_pitch": "Un mensaje claro y directo (3 líneas) para enviar a curadores o blogs. Debe explicar el ritmo, el sentimiento y por qué a sus oyentes les gustará.",
  "social_angles": [
    {
      "angle": "Idea del Video (ej. 'Grabación Vocal Raw')",
      "description": "Explícale al artista EXACTAMENTE qué grabar. (ej. 'Pon tu celular en el piso, apaga la luz del cuarto y grábate cantando el coro con los ojos cerrados').",
      "caption": "El texto exacto que debe ir en la descripción del video. Claro, humano y sin parecer un anuncio."
    }
  ],
  "content_calendar": {
    "week_1_impact": "Semana 1: Qué hacer exactamente para que la canción empiece a sonar (ej. Sube 3 videos enfocándote en la letra más triste).",
    "week_2_community": "Semana 2: Cómo acercarte a los fans que ya te escucharon (ej. Haz un Live de 15 minutos en Instagram respondiendo qué te inspiró).",
    "week_3_lore": "Semana 3: Muestra el proceso (ej. Sube una foto de tu libreta de composición o un audio de WhatsApp de tu maqueta).",
    "week_4_conversion": "Semana 4: Cómo invitarlos a seguir escuchando (ej. Crea una playlist con tu canción y tus influencias musicales y compártela)."
  }
}

REGLAS ESTRICTAS:
1. DEBE ser JSON parseable.
2. NADA de lenguaje técnico de marketing (NO uses palabras como 'Retargeting', 'Embudos de conversión', 'ROI', 'CPM'). Habla como un maestro de música ayudando a su alumno.
3. EJEMPLIFICA todo. Si le pides hacer algo, dile *cómo* se hace.
4. Todo debe respirar la identidad del género ${genre}.`;

  try {
    const rawResponse = await generateSingleContent(prompt);
    
    // Extraer JSON del texto
    const jsonMatch = rawResponse.match(/\{\s*"campaign_title"[\s\S]*\}\s*/);
    if (!jsonMatch) {
      throw new Error('El modelo no devolvió un JSON válido.');
    }
    
    const campaign = JSON.parse(jsonMatch[0]);
    return { success: true, ...campaign };
  } catch (err) {
    logger.error(`[ContentFactory] Error generando campaña: ${err.message}`);
    return { success: false, error: 'Error procesando la campaña. Intenta de nuevo.' };
  }
}

module.exports = { generateReleaseCampaign };
