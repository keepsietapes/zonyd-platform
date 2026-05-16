const logger = require('../utils/logger');
const prisma = require('../utils/prisma');
const { calculateZonydScore } = require('../services/zonydScoreEngine');
const { generateAIContent } = require('../utils/aiClient');

/**
 * ZONYD CORE — Agente Orquestador Principal
 * AGENTE 1 del ecosistema ZONYD LAB AI
 *
 * Toma el chat existente (/api/ai/chat) y lo enriquece con:
 * - Contexto completo del artista (releases, métricas, score, plan)
 * - Enrutamiento a agentes especializados según la intención del mensaje
 * - Memoria contextual de sesión
 * - Respuestas diferenciadas por plan
 *
 * NO modifica nada del código existente. Es una capa adicional que
 * puede ser llamada desde aiRoutes.js o labRoutes.js.
 */

// Intenciones detectables y el agente que las maneja
const INTENT_ROUTING = {
  AUDIO_ANALYSIS:    ['masterizar', 'mezcla', 'mastering', 'lufs', 'frecuencia', 'audio', 'stem', 'ruido', 'sonido'],
  CONTENT_CREATION:  ['tiktok', 'reel', 'caption', 'hashtag', 'contenido', 'publicar', 'post', 'historia', 'story'],
  ANALYTICS:         ['streams', 'estadística', 'métrica', 'crecimiento', 'tendencia', 'predicción', 'análisis'],
  DISTRIBUTION:      ['lanzar', 'distribuir', 'spotify', 'apple music', 'release', 'lanzamiento', 'fecha'],
  VISUAL:            ['portada', 'cover', 'imagen', 'diseño', 'visual', 'foto', 'arte'],
  MARKETING:         ['campaña', 'ads', 'anuncio', 'publicidad', 'facebook', 'instagram ads', 'tiktok ads'],
  PLAYLIST:          ['playlist', 'curador', 'pitching', 'submithub', 'groover'],
  GENERAL:           [], // fallback
};

/**
 * Detecta la intención principal del mensaje del artista.
 */
function detectIntent(message) {
  const lower = message.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_ROUTING)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return intent;
    }
  }
  return 'GENERAL';
}

/**
 * Construye el contexto completo del artista para el system prompt.
 */
async function buildArtistContext(userId, artistPlan) {
  try {
    const [artist, releases, wallet] = await Promise.all([
      prisma.artist.findFirst({
        where: { userId },
        select: {
          stageName: true, bio: true, genres: true, country: true,
          spotifyConnected: true, instagramConnected: true, tiktokConnected: true,
          spotifyFollowers: true, deezerFans: true,
        },
      }),
      prisma.release.findMany({
        where: { artist: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { title: true, status: true, genre: true, releaseDate: true, type: true },
      }),
      prisma.wallet.findUnique({
        where: { userId },
        select: { balance: true },
      }),
    ]);

    const score = await calculateZonydScore(userId);

    return {
      artist,
      releases,
      walletBalance: wallet?.balance || 0,
      artistScore: score.artistScore,
      scoreInsights: score.insights,
      plan: artistPlan,
    };
  } catch (err) {
    logger.warn(`[ZonydCore] Error construyendo contexto: ${err.message}`);
    return { plan: artistPlan };
  }
}

/**
 * Genera el system prompt dinámico basado en el contexto del artista.
 */
function buildSystemPrompt(context, intent) {
  const { artist, releases, walletBalance, artistScore, scoreInsights, plan } = context;

  const artistName = artist?.stageName || 'Artista';
  const generos = artist?.genres ? `Géneros: ${artist.genres}` : 'Sin géneros definidos';
  const pais = artist?.country || 'No especificado';
  const releasesResumen = releases?.length > 0
    ? releases.slice(0, 5).map(r => `"${r.title}" (${r.status})`).join(', ')
    : 'Sin lanzamientos aún';
  const conexiones = [
    artist?.spotifyConnected ? 'Spotify' : null,
    artist?.instagramConnected ? 'Instagram' : null,
    artist?.tiktokConnected ? 'TikTok' : null,
  ].filter(Boolean).join(', ') || 'Sin conexiones';

  const planCapabilities = {
    FREE:  'acceso básico al chat. Respuestas breves y orientativas.',
    INDIE: 'acceso a estrategias de nivel intermedio, análisis de tendencias y optimización técnica.',
    PRO:   'estrategia avanzada de data-driven A&R, generación de campañas completas, análisis predictivo de semana 1.',
    LABEL: 'análisis holístico de carrera, estrategias de pauta publicitaria (Growth Engine), Sync licensing y booking.',
  };

  const agentContext = {
    AUDIO_ANALYSIS:   'El artista necesita apoyo crítico en audio. Analiza frecuencias, LUFS, fase estéreo y decisiones técnicas de mezcla/mastering basándote en la estética sonora de su género.',
    CONTENT_CREATION: 'El artista busca crear contenido orgánico o pautado. NO des consejos genéricos (ej. "publica 3 veces por semana"). Diseña narrativas, hooks audiovisuales y conceptos de storytelling profundamente atados a su identidad artística y letras recientes.',
    ANALYTICS:        'El artista consulta sus métricas. Interpreta la data más allá de los números: ¿qué significa esto para su comunidad subyacente? Detecta oportunidades de retención de audiencia.',
    DISTRIBUTION:     'El artista planifica un lanzamiento. Desarrolla un plan de acción de 4 semanas pre-save a post-release, incluyendo pitching a curadores específicos de su subgénero.',
    VISUAL:           'El artista requiere dirección de arte. Sugiere paletas de color, texturas visuales, referencias de directores creativos y una estética que refuerce la psique de su música.',
    MARKETING:        'El artista busca crecimiento pagado. Define perfiles de audiencia, segmentación por intereses culturales (no solo demográficos) y embudos de conversión para streaming.',
    PLAYLIST:         'El artista quiere entrar a playlists editoriales. Redacta un pitch que destaque el "por qué" cultural de su música, no solo el "qué".',
    GENERAL:          'El artista busca orientación general. Actúa como su A&R personal y estratega de carrera a largo plazo.',
  }[intent] || '';

  return `Eres "Elias", el cerebro detrás de ZONYD LAB AI. Eres un Music Manager, A&R de Boutique y Analista de Datos de élite. Tu objetivo es llevar la carrera de este artista al siguiente nivel. 
NO ERES UN ASISTENTE GENÉRICO. No hablas como un bot de servicio al cliente. Hablas con la autoridad, visión y crudeza profesional de un ejecutivo discográfico de primer nivel que entiende tanto el arte profundo como el negocio duro.

>>> IDENTIDAD Y MEMORIA DEL ARTISTA <<<
- Nombre Artístico: ${artistName}
- Géneros / Estilo: ${generos}
- Origen / Base Cultural: ${pais}
- Estado de Carrera (Zonyd Score): ${artistScore}/100 (Un score bajo significa desarrollo temprano; alto significa escalabilidad).
- Historial de Lanzamientos: ${releasesResumen}
- Redes Conectadas: ${conexiones} (Usa esto para saber dónde enfocar la estrategia).
- Capacidad Financiera (Regalías): $${walletBalance} MXN
- Plan Actual: ${plan} (${planCapabilities[plan]})

>>> REGLAS INQUEBRANTABLES DE TU RESPUESTA <<<
1. AUTENTICIDAD EXTREMA: Jamás des consejos genéricos (e.g., "Usa TikTok", "Sé constante"). Si hablas de contenido, dale una idea específica de guion basada en la melancolía, energía o temática de su último lanzamiento. Si es ${generos}, menciona referentes culturales, estéticos y sonoros de ese nicho específico.
2. MEMORIA CONTEXTUAL: Usa el historial de la conversación y los datos del artista. Si el artista ya lanzó una canción triste, sugiere cómo contrastarla en su próximo lanzamiento. Si su score es bajo, enfócate en construcción de nicho, no en estrategias de estadio.
3. TONO MENTOR / DIDÁCTICO: Actúa como un profesor de élite y un mentor paciente pero directo. HABLA CLARO Y SIN JERGA CONFUSA. Si usas un término de la industria (ej. 'LUFS' o 'Retención'), EXPLÍCALO brevemente como si le hablaras a un niño inteligente.
4. MODERACIÓN Y ÉTICA (CRÍTICO): 
   - Si el artista solicita ayuda con contenido ilegal, explícito, discurso de odio, fraude de streams (bots), o tácticas inmorales, NO respondas solo con "no puedo hacer eso". En su lugar, redirige la conversación ofreciendo una ALTERNATIVA ÉTICA y creativa que logre el mismo impacto emocional o de marketing sin romper las reglas.
   - Mantén el respeto y los valores. Si el artista usa groserías o lenguaje altisonante de forma coloquial, no lo regañes ni seas excesivamente diplomático, simplemente responde con altura, respeto y profesionalismo, manteniendo tu rol de mentor.
5. EJEMPLIFICA SIEMPRE: Nunca des un consejo teórico sin dar un ejemplo práctico ("Por ejemplo, en lugar de subir un video diciendo X, podrías grabarte haciendo Y..."). Muestra, acompaña y evalúa.
6. ACCIÓN INMEDIATA: Toda respuesta debe terminar con un paso a seguir claro, un "Blueprint" de acción fácil de entender que el artista pueda ejecutar hoy mismo.
7. LÍMITE: Máximo 300-400 palabras. Calidad, claridad y didáctica sobre jerga corporativa.

${scoreInsights?.length ? `>>> INSIGHTS INTERNOS DE LA DATA DEL ARTISTA <<<\n${scoreInsights.join('\n')}\nUtiliza esta data para justificar tus recomendaciones.` : ''}

CONTEXTO ESPECÍFICO DE ESTA INTERACCIÓN:
${agentContext}

Actúa ahora como el estratega definitivo para ${artistName}.`;
}

/**
 * Función principal del orquestador.
 * Reemplaza/extiende la llamada directa a Gemini en aiRoutes.js
 *
 * @param {string} userId - ID del usuario autenticado
 * @param {string} artistPlan - Plan actual del artista
 * @param {string} message - Mensaje del artista
 * @param {Array} history - Historial de la conversación (opcional)
 * @returns {Promise<{response: string, intent: string, suggestedActions: string[]}>}
 */
async function orchestrate(userId, artistPlan, message, history = []) {
  logger.info(`[ZonydCore] Orquestando para userId=${userId} plan=${artistPlan} intent=...`);

  const intent = detectIntent(message);
  logger.info(`[ZonydCore] Intención detectada: ${intent}`);

  // Construir contexto del artista
  const context = await buildArtistContext(userId, artistPlan);
  const systemPrompt = buildSystemPrompt(context, intent);

  // Si el plan es FREE, limitar la profundidad de la respuesta
  const modelName = artistPlan === 'FREE'
    ? 'gemini-1.5-flash'   // Modelo gratuito para todos
    : 'gemini-1.5-flash';  // Mismo modelo, pero con contexto más rico

  try {
    const response = await generateAIContent(systemPrompt, message, history.slice(-6));

    // Generar acciones sugeridas según la intención
    const suggestedActions = getSuggestedActions(intent, artistPlan);

    logger.info(`[ZonydCore] Respuesta generada para ${userId} (${response.length} chars)`);

    return {
      response,
      intent,
      suggestedActions,
      context: {
        artistScore: context.artistScore || 50,
        plan: artistPlan,
      },
    };
  } catch (err) {
    logger.error(`[ZonydCore] Fallo en motor IA: ${err.message}`);

    // BASE DE CONOCIMIENTO LOCAL (Zonyd Manual Fallback)
    const localAnswers = {
      AUDIO_ANALYSIS: `Como tu co-manager, te recomiendo revisar los LUFS de tu track. Spotify normaliza a -14 LUFS; si tu master está por encima de eso, podrías perder pegada. Usa "The Lab" para ajustar esto automáticamente.`,
      ANALYTICS: `Tus métricas actuales sugieren un crecimiento orgánico constante. Te recomiendo enfocarte en retener a tus oyentes de México y Colombia, que son tus mercados más activos según mi último reporte.`,
      GENERAL: `Estoy optimizando mis algoritmos en este momento, pero puedo decirte que tu Zonyd Score es sólido. ¿En qué aspecto de tu carrera quieres que profundicemos hoy: distribución, marketing o producción?`
    };

    return {
      response: localAnswers[intent] || localAnswers.GENERAL,
      intent: 'LOCAL_KNOWLEDGE',
      suggestedActions: getSuggestedActions(intent, artistPlan),
      context: { artistScore: 50, plan: artistPlan }
    };
  }
}

/**
 * Acciones sugeridas según la intención y el plan del artista.
 */
function getSuggestedActions(intent, plan) {
  const actions = {
    AUDIO_ANALYSIS:   ['Ir a The Lab → AI Mastering', 'Generar Reporte Técnico'],
    CONTENT_CREATION: plan !== 'FREE' ? ['Generar 10 ideas de TikTok', 'Crear calendario de contenido'] : ['Upgrade a plan Indie para content AI'],
    ANALYTICS:        ['Ver Analytics Dashboard', 'Ver Zonyd Score'],
    DISTRIBUTION:     ['Ir a Releases → Nuevo Release', 'Ver estrategia de lanzamiento'],
    VISUAL:           plan === 'PRO' || plan === 'LABEL' ? ['Abrir VISIONARY AI', 'Generar portada'] : ['Upgrade a plan Pro para Visual AI'],
    PLAYLIST:         ['Ver guía de pitching', 'Iniciar Playlist Attack'],
    GENERAL:          ['Ver mi Zonyd Score', 'Ver mis releases activos'],
  };

  return actions[intent] || actions.GENERAL;
}

module.exports = { orchestrate, detectIntent, buildArtistContext };
