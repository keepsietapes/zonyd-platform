const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

/**
 * planGateMiddleware — Control de acceso por plan para ZONYD LAB AI
 *
 * Cada agente tiene un nivel mínimo de plan requerido.
 * Los niveles son: FREE < INDIE < PRO < LABEL
 *
 * Uso:
 *   router.post('/spectral-analyze', planGate('INDIE'), handler)
 *   router.post('/release-predict', planGate('PRO'), handler)
 *   router.post('/growth-engine', planGate('LABEL'), handler)
 */

const PLAN_HIERARCHY = {
  FREE: 0,
  INDIE: 1,
  PRO: 2,
  LABEL: 3,
};

/**
 * Límites mensuales por agente y plan.
 * null = ilimitado
 */
const AGENT_LIMITS = {
  'spectral-engine': { INDIE: 3,  PRO: null, LABEL: null },
  'neural-analytics': { INDIE: 10, PRO: null, LABEL: null },
  'social-pulse':    { INDIE: 10, PRO: 50,   LABEL: null },
  'release-command': { INDIE: 5,  PRO: null, LABEL: null },
  'trend-hunter':    { INDIE: 4,  PRO: 30,   LABEL: null }, // semanal=4, diario≈30
  'content-factory': { INDIE: null, PRO: 1,  LABEL: null }, // por release
  'release-predictor':{ PRO: null, LABEL: null },
  'playlist-attack': { PRO: 5,    LABEL: null },
  'visionary':       { PRO: 10,   LABEL: null },
  'zonyd-core':      { FREE: 20,  INDIE: null, PRO: null, LABEL: null }, // mensajes/día para FREE
};

/**
 * Crea el middleware de plan gate para un agente específico.
 * @param {string} minPlan - Plan mínimo requerido: 'INDIE' | 'PRO' | 'LABEL'
 * @param {string} agentId - ID del agente para tracking de límites
 */
function planGate(minPlan, agentId = null) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email; // Extraído del token JWT de Supabase
      if (!userId) {
        return res.status(401).json({ error: 'No autenticado.' });
      }

      // 1. LÓGICA DE CUENTA MAESTRA (OVERRIDE TOTAL)
      if (userEmail === 'keepsietapes@gmail.com') {
        logger.info(`[PlanGate] Acceso MAESTRO concedido a ${userEmail} para agente ${agentId || 'agente'}. Ignorando límites.`);
        req.artistPlan = 'LABEL'; // Otorgar máxima jerarquía internamente
        return next();
      }

      // Obtener plan actual del artista
      const artist = await prisma.artist.findFirst({
        where: { userId },
        select: { plan: true },
      });

      const artistPlan = artist?.plan || 'FREE';
      const requiredLevel = PLAN_HIERARCHY[minPlan] ?? 0;
      const currentLevel = PLAN_HIERARCHY[artistPlan] ?? 0;

      // Verificar si el plan cumple el mínimo requerido
      if (currentLevel < requiredLevel) {
        logger.warn(`[PlanGate] Usuario ${userId} (${artistPlan}) intentó acceder a ${agentId || 'agente'} (requiere ${minPlan})`);
        return res.status(403).json({
          error: 'PLAN_UPGRADE_REQUIRED',
          currentPlan: artistPlan,
          requiredPlan: minPlan,
          message: `Esta función requiere el plan ${minPlan} o superior.`,
          upgradeUrl: '/dashboard/settings#billing',
        });
      }

      // Verificar límites mensuales si el agente tiene tracking
      if (agentId && AGENT_LIMITS[agentId]) {
        const planLimits = AGENT_LIMITS[agentId];
        const limit = planLimits[artistPlan];

        if (limit !== null && limit !== undefined) {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

          const usageCount = await prisma.auditLog.count({
            where: {
              userId,
              action: `LAB_AI_${agentId.toUpperCase().replace(/-/g, '_')}`,
              createdAt: { gte: startOfMonth },
            },
          });

          if (usageCount >= limit) {
            return res.status(429).json({
              error: 'MONTHLY_LIMIT_REACHED',
              agent: agentId,
              limit,
              used: usageCount,
              resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
              message: `Has alcanzado el límite mensual de ${limit} usos para esta función.`,
              upgradeUrl: '/dashboard/settings#billing',
            });
          }

          // Registrar el uso en AuditLog
          await prisma.auditLog.create({
            data: {
              userId,
              action: `LAB_AI_${agentId.toUpperCase().replace(/-/g, '_')}`,
              details: JSON.stringify({ plan: artistPlan, usageCount: usageCount + 1 }),
            },
          }).catch(err => logger.warn(`[PlanGate] Error registrando uso: ${err.message}`));
        }
      }

      // Inyectar el plan en el request para que los handlers lo usen
      req.artistPlan = artistPlan;
      next();
    } catch (err) {
      logger.error(`[PlanGate] Error crítico: ${err.message}`);
      return res.status(500).json({ error: 'Error verificando plan de acceso.' });
    }
  };
}

module.exports = { planGate, PLAN_HIERARCHY, AGENT_LIMITS };
