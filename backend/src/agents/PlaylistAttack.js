const logger = require('../utils/logger');
const { generateSingleContent, extractJson } = require('../utils/aiClient');

/**
 * PLAYLIST ATTACK — Agente de Pitching a Curadores
 * AGENTE 14 del ecosistema ZONYD LAB AI (Propuesto)
 *
 * Automatiza o asiste en el proceso de buscar y contactar a
 * curadores de playlists independientes para un género específico.
 */

async function generatePlaylistPitch(artistName, trackName, genre, trackVibe) {
  logger.info(`[PlaylistAttack] Generando pitches para ${artistName} - ${trackName}`);

  const prompt = `Eres PLAYLIST ATTACK, un publirrelacionista musical de ZONYD.
Tu objetivo es ayudar a un artista independiente a enviar su música a curadores de playlists en SubmitHub / Groover / correos directos.

DATOS:
- Artista: ${artistName}
- Canción: "${trackName}"
- Género: ${genre}
- Vibe/Mood: ${trackVibe}

INSTRUCCIONES:
Genera 3 versiones distintas de "Pitches" (mensajes cortos de contacto):
1. Versión "SubmitHub" (Muy directo, al grano, foco en géneros y drops, max 40 palabras).
2. Versión "Email a Curador Indie" (Educado, cuenta un poco más sobre el vibe, max 80 palabras).
3. Versión "DM de Instagram" (Casual, no invasivo, con emojis adecuados, max 30 palabras).

Devuelve ESTRICTAMENTE JSON en este formato:
{
  "submithub_pitch": "Texto aquí",
  "email_pitch": "Texto aquí",
  "dm_pitch": "Texto aquí"
}

Solo devuelve JSON válido.`;

  try {
    const rawResponse = await generateSingleContent(prompt);
    
    // Extraer JSON
    const result = extractJson(rawResponse);
    return { success: true, ...result };
  } catch (err) {
    logger.error(`[PlaylistAttack] Error generando pitch: ${err.message}`);
    return { success: false, error: 'Error generando pitches de playlist. Intenta de nuevo.' };
  }
}

module.exports = { generatePlaylistPitch };
