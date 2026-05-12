const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

async function chatWithAssistant(req, res, next) {
  const { message } = req.body;
  const userId = req.user.id;

  try {
    logger.info(`Consulta recibida para Zonyd AI de usuario ${userId}`);

    // 1. Obtener Contexto Real del Artista
    const artist = await prisma.artist.findUnique({
      where: { userId },
      include: {
        releases: { take: 5, orderBy: { createdAt: 'desc' } },
        wallets: true
      }
    });

    const artistName = artist?.stageName || 'Artista';
    const balance = artist?.wallets?.balance || 0;
    const releaseCount = artist?.releases?.length || 0;

    // 2. Zonyd Master AI - Base de Conocimiento y Motor de Respuestas
    const manualZonyd = `
    Eres Zonyd AI, el asistente legal, técnico y estratégico oficial de la plataforma Zonyd (Distribución Musical).
    
    TÉRMINOS Y CONDICIONES Y PRIVACIDAD (Resumen para soporte):
    - Zonyd retiene el 0% de las regalías en cuentas PRO, y porcentajes variables en cuentas FREE.
    - Los usuarios mantienen el 100% de la propiedad intelectual de sus masters.
    - Los retiros se realizan vía PayPal con un mínimo de $10 USD. Los reportes de regalías llegan 45 días después del cierre de mes por parte de Spotify/Apple.
    - Política de Privacidad: Zonyd no vende datos de fans a terceros. Solo usamos métricas para el dashboard del artista.

    RESOLUCIÓN DE ERRORES FRECUENTES:
    1. Error "Active premium subscription required": El artista intentó vincular Spotify for Artists, pero la cuenta que creó la App en Spotify Developer no es Premium. Solución: Usar una cuenta Premium o crear la App con un amigo Premium.
    2. Fallo de ISRC/UPC: Zonyd los genera automáticamente. Si falla, verificar que todos los campos obligatorios del release estén completos.
    3. Rechazo de Portada: La imagen debe ser exactamente 3000x3000px, RGB, JPG/PNG, sin logos de tiendas.

    PREGUNTAS FRECUENTES (FAQ):
    - ¿Cuánto tarda en subir mi música? 24 a 48 horas tras la aprobación.
    - ¿Puedo hacer splits de ganancias? Sí, en el paso 3 del formulario de lanzamiento.

    ESTADO DEL USUARIO ACTUAL:
    - Artista: ${artistName}
    - Lanzamientos: ${releaseCount}
    - Balance: $${balance} USD

    REGLAS: Responde de forma profesional, directa y como un manager experto de la industria musical.
    `;

    const lowerMessage = message.toLowerCase();
    let response = "";

    // GUARDRAILS: Verificamos si la consulta es sobre temas prohibidos o sensibles
    const isSensitiveFinancial = lowerMessage.includes("inversión") || lowerMessage.includes("cuanto ganaré") || lowerMessage.includes("predicción");
    const isLegalDispute = lowerMessage.includes("demanda") || lowerMessage.includes("legal") || lowerMessage.includes("copyright dispute");

    if (isSensitiveFinancial) {
      response = "Como Zonyd AI, no puedo dar asesoría financiera o predicciones de ingresos exactas. Te recomiendo consultar el manual de regalías en nuestra web para entender cómo se calculan los pagos.";
    } else if (isLegalDispute) {
      response = "Para disputas legales o de copyright activas, por favor contacta directamente a nuestro equipo legal en soporte@zonyd.com. Yo no puedo validar la legitimidad de una disputa.";
    } else if (lowerMessage.includes("hola") || lowerMessage.includes("ayuda")) {
      response = `¡Hola, ${artistName}! Soy Zonyd AI. Tengo acceso a nuestro manual de operaciones y a tus métricas. Tienes un balance de $${balance} USD. ¿En qué puedo asistirte técnica o operativamente hoy?`;
    } else if (lowerMessage.includes("error") || lowerMessage.includes("falla") || lowerMessage.includes("spotify")) {
      response = "Según nuestro manual técnico: Si tienes un error al conectar Spotify ('Active premium subscription required'), la cuenta de desarrollador debe ser Premium. ¿Es ese tu caso?";
    } else if (lowerMessage.includes("terminos") || lowerMessage.includes("condiciones") || lowerMessage.includes("privacidad")) {
      response = "Políticas de Zonyd: Tú conservas el 100% del copyright. Nosotros solo administramos la distribución. Para más detalles, revisa la sección 'Términos' en tu perfil.";
    } else if (lowerMessage.includes("pagos") || lowerMessage.includes("retiro") || lowerMessage.includes("dinero")) {
      response = `Tu balance actual es de $${balance} USD. Según las políticas de Zonyd, puedes retirar vía PayPal al alcanzar los $10 USD.`;
    } else {
      response = `He analizado tu consulta. Para darte una respuesta precisa sobre esto, necesito que contactes a soporte humano o revises el manual de ayuda, ya que no tengo información suficiente para garantizar la exactitud de la respuesta en este tema específico.`;
    }


    res.json({ 
      response,
      context: {
        artistName,
        releaseCount,
        balance
      }
    });
  } catch (error) {
    logger.error('Error en Zonyd AI Engine:', error);
    next(error);
  }
}

module.exports = { chatWithAssistant };
