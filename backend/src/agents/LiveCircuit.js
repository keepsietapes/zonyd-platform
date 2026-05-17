const logger = require('../utils/logger');
const { generateSingleContent, extractJson } = require('../utils/aiClient');

/**
 * LIVE CIRCUIT — Agente de Booking
 * AGENTE 11 del ecosistema ZONYD LAB AI (Planeado)
 *
 * Asiste en la creación de pitches para promotores y venues.
 */
async function generateBookingPitch(artistName, genre, region) {
  logger.info(`[LiveCircuit] Generando pitch de booking para ${artistName} en ${region}`);

  const prompt = `Eres LIVE CIRCUIT, un Booker de ZONYD.
Escribe un correo corto de presentación (Pitch) para conseguir un show local en un bar o festival emergente.

Contexto:
- Artista: ${artistName}
- Género: ${genre}
- Región: ${region}

Devuelve JSON estricto:
{
  "email_subject": "Asunto atractivo para el promotor",
  "email_body": "Cuerpo del correo, profesional pero directo."
}`;

  try {
    const rawResponse = await generateSingleContent(prompt);
    const parsedData = extractJson(rawResponse);
    return { success: true, ...parsedData };
  } catch (err) {
    logger.error(`[LiveCircuit] Error: ${err.message}`);
    return { success: false, error: 'Error generando pitch de booking.' };
  }
}

module.exports = { generateBookingPitch };
