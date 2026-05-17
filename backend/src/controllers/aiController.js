const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const { orchestrate } = require('../agents/ZonydCore');

async function chatWithAssistant(req, res, next) {
  const { message, history = [] } = req.body;
  const userId = req.user.id;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
  }

  try {
    logger.info(`[ZonydAI] Consulta de usuario ${userId}: "${message.substring(0, 80)}"`);

    // Obtener contexto del artista
    const artist = await prisma.artist.findFirst({
      where: { userId },
      select: { plan: true, stageName: true, id: true }
    });

    const artistPlan = artist?.plan || 'FREE';
    const artistName = artist?.stageName || 'Artista';

    // Llamar al agente real ZonydCore (Gemini 2.0)
    let result;
    try {
      result = await orchestrate(userId, artistPlan, message, history);
    } catch (agentErr) {
      logger.warn(`[ZonydAI] ZonydCore falló, usando fallback contextual: ${agentErr.message}`);

      // Obtener balance real para respuestas sobre pagos
      const wallet = await prisma.wallet.findUnique({ where: { userId } }).catch(() => null);
      const balance = (wallet?.balance || 0).toFixed(2);
      const lowerMsg = message.toLowerCase();
      let response;

      if (lowerMsg.includes('streams') || lowerMsg.includes('reproducciones') || lowerMsg.includes('oyentes') || lowerMsg.includes('1000') || lowerMsg.includes('estrategia') || lowerMsg.includes('crecimiento')) {
        response = `¡Hola ${artistName}! Claro que sí, lograr **1,000 streams en un mes** es un objetivo totalmente alcanzable si ejecutas esta estrategia de 3 fases:\n\n**Fase 1: Preparación y Pitching (14 días antes)**\n1. Sube tu canción a Zonyd con al menos 2 semanas de anticipación.\n2. Haz el pitch oficial en tu panel de Spotify for Artists indicando género, instrumentos y vibra.\n3. Crea un **Smart Link** en Zonyd y ponlo en tu bio.\n\n**Fase 2: El Gancho Visual (7 días antes)**\n• Graba 3 videos cortos para TikTok e IG Reels. En lugar de decir "escucha mi canción", cuenta la historia detrás de la letra o muestra cómo grabaste los instrumentos. Usa el gancho en los primeros 3 segundos.\n\n**Fase 3: Campaña de Lanzamiento (Semana del release)**\n• Pide a tus fans y amigos que agreguen la canción a sus playlists personales (esto entrena al algoritmo de Spotify "Discovery Weekly").\n• Envía tu Smart Link a curadores independientes usando plataformas integradas en nuestro Marketplace.\n\n¿Quieres que preparemos el guion para tu primer video promocional?`;
      } else if (lowerMsg.includes('balance') || lowerMsg.includes('dinero') || lowerMsg.includes('retiro') || lowerMsg.includes('regalía') || lowerMsg.includes('pago')) {
        response = `Tu balance actual es **$${balance} USD**.\n\nLos retiros se procesan automáticamente cada lunes (Money Monday) al superar el umbral de $10 USD vía PayPal. Los reportes de regalías llegan 45 días después del cierre de mes en Spotify/Apple Music.\n\nSi aún no has configurado tu PayPal, ve a Configuración > Pagos y Retiros.`;
      } else if (lowerMsg.includes('spotify') || lowerMsg.includes('conectar') || lowerMsg.includes('vincula')) {
        response = `Para conectar Spotify for Artists:\n\n1. Ve a **Configuración > Redes Sociales**\n2. Pega tu URL de perfil (open.spotify.com/artist/...)\n3. Haz clic en "Guardar"\n\nSi ves el error "Active premium subscription required", la cuenta de Spotify Developer debe ser Premium. Una vez vinculado, Zonyd AI accederá a tus métricas en tiempo real.`;
      } else if (lowerMsg.includes('lanzar') || lowerMsg.includes('lanzamiento') || lowerMsg.includes('single') || lowerMsg.includes('álbum') || lowerMsg.includes('album')) {
        response = `Plan de lanzamiento óptimo para ${artistName}:\n\n**4 semanas antes:**\n• Registra la obra en Publishing\n• Sube el master al Lab AI para análisis técnico\n\n**2 semanas antes:**\n• Crea el SmartLink de pre-save\n• Prepara la campaña de Marketplace Sync\n\n**Release day:**\n• Activa el SmartLink y publica en IG Reels + TikTok simultáneamente\n\n**Post-lanzamiento:**\n• Monitorea playlists desde Analytics\n• Genera el Media Kit desde Marketplace\n\n¿Cuándo planeas lanzar?`;
      } else if (lowerMsg.includes('isrc') || lowerMsg.includes('upc') || lowerMsg.includes('distribu')) {
        response = `Zonyd genera automáticamente ISRC y UPC para cada track/release durante el proceso de creación.\n\nTiempos de distribución:\n• Spotify & Apple Music: 24-48 horas\n• Amazon Music & Deezer: 48-72 horas\n• +150 tiendas adicionales: 3-5 días\n\nEl release debe ser aprobado primero por el equipo editorial de Zonyd.`;
      } else if (lowerMsg.includes('copyright') || lowerMsg.includes('derechos') || lowerMsg.includes('publishing') || lowerMsg.includes('obra')) {
        response = `En Zonyd mantienes el **100% de la propiedad intelectual** de tus masters.\n\nPara proteger tus composiciones:\n1. Ve a **Publishing & Rights**\n2. Haz clic en "Registrar Obra"\n3. Completa el formulario con co-autores y letras\n\nSi detectamos reclamaciones de Content ID, recibirás una alerta inmediata. También puedes vincularte con SACM, ASCAP, BMI o SGAE directamente desde Publishing.`;
      } else if (lowerMsg.includes('lab') || lowerMsg.includes('master') || lowerMsg.includes('stem') || lowerMsg.includes('audio')) {
        response = `El Lab AI de Zonyd incluye:\n\n• **AI Mastering Pro** — Análisis de LUFS, True Peak y cumplimiento por plataforma (Spotify, Apple Music, YouTube)\n• **Stem Splitter** — Separa voz, batería, bajo e instrumentos\n• **Phase Auditor** — Detecta problemas de correlación de fase estéreo\n• **Exportar Master** — Descarga el audio procesado en WAV\n\nPara usarlo, ve a The Lab (AI) y sube tu archivo de audio.`;
      } else if (lowerMsg.includes('hola') || lowerMsg.includes('ayuda') || lowerMsg.includes('qué puedes') || lowerMsg.includes('que puedes')) {
        response = `¡Hola ${artistName}! Soy Zonyd AI, tu Co-Manager musical impulsado por Gemini 2.0.\n\nPuedo ayudarte con:\n• 🚀 Estrategias de lanzamiento y marketing\n• 📊 Análisis de audiencia y métricas\n• ⚖️ Protección de derechos y publishing\n• 🎛️ Optimización técnica de audio\n• 💰 Distribución y gestión de regalías\n\n¿En qué aspecto de tu carrera quieres trabajar hoy?`;
      } else {
        response = `He procesado tu consulta. Como tu Co-Manager, los módulos más relevantes para ti ahora son:\n\n• **Analytics** — monitorea streams y audiencia en tiempo real\n• **Publishing** — protege tus derechos de autor\n• **The Lab** — optimiza el audio antes de distribuir\n• **Marketplace** — genera ingresos de sync y licencias\n\n¿Necesitas orientación específica sobre alguno de estos módulos?`;
      }

      result = { response, intent: 'fallback', suggestedActions: [] };
    }

    res.json({
      response: result.response,
      intent: result.intent || 'general',
      suggestedActions: result.suggestedActions || [],
      context: result.context || {},
    });
  } catch (error) {
    logger.error('[ZonydAI] Error crítico:', error.message);
    next(error);
  }
}

module.exports = { chatWithAssistant };
