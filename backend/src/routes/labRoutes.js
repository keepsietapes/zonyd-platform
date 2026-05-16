const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const logger = require('../utils/logger');
const authMiddleware = require('../middleware/authMiddleware');
const { planGate } = require('../middleware/planGateMiddleware');
const { orchestrate } = require('../agents/ZonydCore');
const { analyze: spectralAnalyze } = require('../agents/SpectralEngine');
const { generateFullAnalysis, calculateViralProbability, getOptimalReleaseWindow } = require('../agents/NeuralAnalytics');
const { generateContentIdeas } = require('../agents/SocialPulse');
const { huntTrends } = require('../agents/TrendHunter');
const { generateReleaseCampaign } = require('../agents/ContentFactory');
const { optimizeReleaseMetadata } = require('../agents/ReleaseCommand');
const { predictPerformance } = require('../agents/ReleasePredictor');
const { generatePlaylistPitch } = require('../agents/PlaylistAttack');
const { generateVisualConcepts } = require('../agents/Visionary');
const { generateAdsStrategy } = require('../agents/GrowthEngine');
const { generateSyncMetadata } = require('../agents/SyncBridge');
const { generateBookingPitch } = require('../agents/LiveCircuit');
const { analyzeComment } = require('../agents/FanGrid');
const { generateMusicalBlueprint } = require('../agents/SonicForge');

/**
 * labRoutes.js — Rutas de ZONYD LAB AI
 *
 * Todas las rutas están protegidas por:
 * 1. authMiddleware — verifica JWT de Supabase
 * 2. planGate — verifica plan del artista y límites mensuales
 *
 * Endpoints:
 *   POST /api/lab/chat              → ZONYD CORE (chat con contexto completo)
 *   POST /api/lab/spectral/analyze  → SPECTRAL ENGINE (análisis de audio)
 *   GET  /api/lab/analytics/full    → NEURAL ANALYTICS (análisis predictivo completo)
 *   GET  /api/lab/analytics/viral   → NEURAL ANALYTICS (score de viralidad)
 *   GET  /api/lab/analytics/release-window → Ventana óptima de lanzamiento
 *   POST /api/lab/content/ideas     → SOCIAL PULSE (generación de ideas)
 *   GET  /api/lab/trends            → TREND HUNTER (alertas de tendencias)
 *   POST /api/lab/content/factory   → CONTENT FACTORY (campaña post-lanzamiento)
 *   POST /api/lab/release/command   → RELEASE COMMAND (optimización de metadata)
 *   GET  /api/lab/release/predictor → RELEASE PREDICTOR (predicción de semana 1)
 *   POST /api/lab/playlist/attack   → PLAYLIST ATTACK (pitches para curadores)
 *   POST /api/lab/visionary         → VISIONARY (conceptos visuales)
 *   POST /api/lab/growth            → GROWTH ENGINE (estrategia de ads)
 *   POST /api/lab/sync              → SYNC BRIDGE (metadata de sync)
 *   POST /api/lab/booking           → LIVE CIRCUIT (pitch de booking)
 *   POST /api/lab/community         → FAN GRID (análisis de comentarios)
 *   POST /api/lab/sonic             → SONIC FORGE (blueprint musical)
 *   GET  /api/lab/status            → Estado del sistema LAB AI
 */

// Configuración de Multer para upload temporal de audio
const audioUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const tmpDir = path.join(os.tmpdir(), 'zonyd-lab');
      fs.mkdirSync(tmpDir, { recursive: true });
      cb(null, tmpDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `spectral-${req.user.id}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB máx
  fileFilter: (req, file, cb) => {
    const allowed = ['.wav', '.mp3', '.flac', '.aiff', '.m4a', '.ogg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Formato de audio no soportado: ${ext}. Usa WAV, MP3, FLAC o AIFF.`));
    }
  },
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/lab/status — Estado del sistema (sin restricción de plan)
// ──────────────────────────────────────────────────────────────────────────────
router.get('/status', authMiddleware, async (req, res) => {
  const artistPlan = req.user?.artistProfile?.plan || 'FREE';

  const PLAN_FEATURES = {
    FREE:  ['zonyd-core (básico)'],
    INDIE: ['zonyd-core', 'spectral-engine (3/mes)', 'neural-analytics (básico)', 'social-pulse (10/mes)', 'release-command (5/mes)', 'trend-hunter (semanal)'],
    PRO:   ['todos los anteriores', 'neural-analytics (completo)', 'social-pulse (50/mes)', 'content-factory', 'release-predictor', 'playlist-attack (5/mes)', 'visionary (10/mes)', 'sonic-forge'],
    LABEL: ['todos los agentes', 'growth-engine', 'sync-bridge', 'live-circuit', 'fan-grid', 'sin límites'],
  };

  res.json({
    system: 'ZONYD LAB AI',
    version: '4.0.0-phase4',
    status: 'OPERATIONAL',
    activeAgents: [
      'ZONYD_CORE', 'SPECTRAL_ENGINE', 'NEURAL_ANALYTICS', 
      'SOCIAL_PULSE', 'CONTENT_FACTORY', 'TREND_HUNTER', 
      'RELEASE_COMMAND', 'RELEASE_PREDICTOR', 'PLAYLIST_ATTACK',
      'VISIONARY', 'GROWTH_ENGINE', 'SYNC_BRIDGE', 'LIVE_CIRCUIT', 'FAN_GRID', 'SONIC_FORGE'
    ],
    currentPlan: artistPlan,
    availableFeatures: PLAN_FEATURES[artistPlan] || PLAN_FEATURES.FREE,
    phase: 'Phase 4 — Full AI Autonomous Label',
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/lab/chat — ZONYD CORE (chat con contexto artístico completo)
// Disponible para TODOS los planes, con límites por plan
// ──────────────────────────────────────────────────────────────────────────────
router.post('/chat', authMiddleware, planGate('FREE', 'zonyd-core'), async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: 'Mensaje demasiado largo. Máximo 1000 caracteres.' });
    }

    const artistPlan = req.artistPlan || 'FREE';
    const result = await orchestrate(req.user.id, artistPlan, message, history);

    res.json({
      response: result.response,
      intent: result.intent,
      suggestedActions: result.suggestedActions,
      context: result.context,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error(`[LabRoutes:chat] ${err.message}`);
    res.status(500).json({ error: 'Error en el motor de IA. Intenta de nuevo.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/lab/spectral/analyze — SPECTRAL ENGINE
// Requiere: Plan INDIE+, límite 3/mes en INDIE
// ──────────────────────────────────────────────────────────────────────────────
router.post(
  '/spectral/analyze',
  authMiddleware,
  planGate('INDIE', 'spectral-engine'),
  audioUpload.single('audio'),
  async (req, res) => {
    const audioPath = req.file?.path;

    try {
      if (!audioPath) {
        return res.status(400).json({ error: 'Se requiere un archivo de audio.' });
      }

      const genre = req.body.genre || 'desconocido';
      const artistPlan = req.artistPlan || 'INDIE';

      const report = await spectralAnalyze(audioPath, genre, artistPlan);

      logger.info(`[LabRoutes:spectral] Análisis completado para userId=${req.user.id}`);
      res.json(report);
    } catch (err) {
      logger.error(`[LabRoutes:spectral] ${err.message}`);
      res.status(500).json({
        error: 'Error analizando el audio.',
        detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    } finally {
      // Limpiar archivo temporal
      if (audioPath && fs.existsSync(audioPath)) {
        fs.unlink(audioPath, () => {});
      }
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/lab/analytics/full — NEURAL ANALYTICS completo
// Requiere: Plan INDIE+ (básico en INDIE, completo en PRO+)
// ──────────────────────────────────────────────────────────────────────────────
router.get(
  '/analytics/full',
  authMiddleware,
  planGate('INDIE', 'neural-analytics'),
  async (req, res) => {
    try {
      const artistPlan = req.artistPlan || 'INDIE';
      const analysis = await generateFullAnalysis(req.user.id, artistPlan);

      res.json(analysis);
    } catch (err) {
      logger.error(`[LabRoutes:analytics] ${err.message}`);
      res.status(500).json({ error: 'Error generando análisis predictivo.' });
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/lab/analytics/viral — Score de viralidad
// Requiere: Plan INDIE+
// ──────────────────────────────────────────────────────────────────────────────
router.get(
  '/analytics/viral',
  authMiddleware,
  planGate('INDIE'),
  async (req, res) => {
    try {
      const releaseData = req.query.releaseId
        ? await prisma.release.findUnique({ where: { id: req.query.releaseId } })
        : null;

      const viralScore = await calculateViralProbability(req.user.id, releaseData);
      res.json(viralScore);
    } catch (err) {
      logger.error(`[LabRoutes:viral] ${err.message}`);
      res.status(500).json({ error: 'Error calculando probabilidad de viralidad.' });
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/lab/analytics/release-window — Ventana óptima de lanzamiento
// Requiere: Plan INDIE+
// ──────────────────────────────────────────────────────────────────────────────
router.get(
  '/analytics/release-window',
  authMiddleware,
  planGate('INDIE'),
  async (req, res) => {
    try {
      const genre = req.query.genre || '';
      const window = getOptimalReleaseWindow(genre);
      res.json({ genre, ...window });
    } catch (err) {
      logger.error(`[LabRoutes:release-window] ${err.message}`);
      res.status(500).json({ error: 'Error calculando ventana de lanzamiento.' });
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/lab/content/ideas — SOCIAL PULSE
// Requiere: Plan INDIE+
// ──────────────────────────────────────────────────────────────────────────────
router.post('/content/ideas', authMiddleware, planGate('INDIE', 'social-pulse'), async (req, res) => {
  try {
    const { platform = 'tiktok', count = 5, genre = 'pop', mood = 'energético', trackName = '' } = req.body;
    const result = await generateContentIdeas(platform, count, genre, mood, trackName);
    
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (err) {
    logger.error(`[LabRoutes:content] ${err.message}`);
    res.status(500).json({ error: 'Error generando ideas de contenido.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/lab/trends — TREND HUNTER
// Requiere: Plan INDIE+
// ──────────────────────────────────────────────────────────────────────────────
router.get('/trends', authMiddleware, planGate('INDIE', 'trend-hunter'), async (req, res) => {
  try {
    const genre = req.query.genre || 'pop';
    const country = req.query.country || 'MX';
    const result = await huntTrends(genre, country);
    
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (err) {
    logger.error(`[LabRoutes:trends] ${err.message}`);
    res.status(500).json({ error: 'Error cazando tendencias.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/lab/content/factory — CONTENT FACTORY
// Requiere: Plan PRO+
// ──────────────────────────────────────────────────────────────────────────────
router.post('/content/factory', authMiddleware, planGate('PRO', 'content-factory'), async (req, res) => {
  try {
    const { releaseName, artistName, genre = 'pop', trackMood = 'neutral' } = req.body;
    
    if (!releaseName || !artistName) {
      return res.status(400).json({ error: 'releaseName y artistName son requeridos.' });
    }
    
    const result = await generateReleaseCampaign(releaseName, artistName, genre, trackMood);
    
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (err) {
    logger.error(`[LabRoutes:factory] ${err.message}`);
    res.status(500).json({ error: 'Error generando campaña post-lanzamiento.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/lab/release/command — RELEASE COMMAND
// Requiere: Plan INDIE+
// ──────────────────────────────────────────────────────────────────────────────
router.post('/release/command', authMiddleware, planGate('INDIE', 'release-command'), async (req, res) => {
  try {
    const { releaseData } = req.body;
    
    if (!releaseData || !releaseData.title || !releaseData.artistName) {
      return res.status(400).json({ error: 'releaseData con title y artistName son requeridos.' });
    }
    
    const result = await optimizeReleaseMetadata(releaseData);
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (err) {
    logger.error(`[LabRoutes:release-command] ${err.message}`);
    res.status(500).json({ error: 'Error optimizando metadata.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/lab/release/predictor — RELEASE PREDICTOR
// Requiere: Plan PRO+
// ──────────────────────────────────────────────────────────────────────────────
router.get('/release/predictor', authMiddleware, planGate('PRO', 'release-predictor'), async (req, res) => {
  try {
    const { artistScore = 50, viralProbability = 50, genre = 'pop', releaseDay = 'Viernes' } = req.query;
    const result = await predictPerformance(artistScore, viralProbability, genre, releaseDay);
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (err) {
    logger.error(`[LabRoutes:release-predictor] ${err.message}`);
    res.status(500).json({ error: 'Error prediciendo performance.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/lab/playlist/attack — PLAYLIST ATTACK
// Requiere: Plan PRO+
// ──────────────────────────────────────────────────────────────────────────────
router.post('/playlist/attack', authMiddleware, planGate('PRO', 'playlist-attack'), async (req, res) => {
  try {
    const { artistName, trackName, genre = 'pop', trackVibe = 'enérgico' } = req.body;
    
    if (!artistName || !trackName) {
      return res.status(400).json({ error: 'artistName y trackName son requeridos.' });
    }
    
    const result = await generatePlaylistPitch(artistName, trackName, genre, trackVibe);
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (err) {
    logger.error(`[LabRoutes:playlist-attack] ${err.message}`);
    res.status(500).json({ error: 'Error generando pitches.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/lab/visionary — VISIONARY
// Requiere: Plan PRO+
// ──────────────────────────────────────────────────────────────────────────────
router.post('/visionary', authMiddleware, planGate('PRO', 'visionary'), async (req, res) => {
  try {
    const { artistName, genre = 'pop', trackMood = 'neutral' } = req.body;
    const result = await generateVisualConcepts(artistName, genre, trackMood);
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (err) {
    logger.error(`[LabRoutes:visionary] ${err.message}`);
    res.status(500).json({ error: 'Error generando conceptos.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/lab/growth — GROWTH ENGINE
// Requiere: Plan LABEL
// ──────────────────────────────────────────────────────────────────────────────
router.post('/growth', authMiddleware, planGate('LABEL', 'growth-engine'), async (req, res) => {
  try {
    const { genre = 'pop', budget = 50 } = req.body;
    const result = await generateAdsStrategy(genre, budget);
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (err) {
    logger.error(`[LabRoutes:growth] ${err.message}`);
    res.status(500).json({ error: 'Error generando estrategia de ads.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/lab/sync — SYNC BRIDGE
// Requiere: Plan LABEL
// ──────────────────────────────────────────────────────────────────────────────
router.post('/sync', authMiddleware, planGate('LABEL', 'sync-bridge'), async (req, res) => {
  try {
    const { trackName, genre = 'pop' } = req.body;
    const result = await generateSyncMetadata(trackName, genre);
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (err) {
    logger.error(`[LabRoutes:sync] ${err.message}`);
    res.status(500).json({ error: 'Error generando metadata de sync.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/lab/booking — LIVE CIRCUIT
// Requiere: Plan LABEL
// ──────────────────────────────────────────────────────────────────────────────
router.post('/booking', authMiddleware, planGate('LABEL', 'live-circuit'), async (req, res) => {
  try {
    const { artistName, genre = 'pop', region = 'CDMX' } = req.body;
    const result = await generateBookingPitch(artistName, genre, region);
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (err) {
    logger.error(`[LabRoutes:booking] ${err.message}`);
    res.status(500).json({ error: 'Error generando pitch de booking.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/lab/community — FAN GRID
// Requiere: Plan LABEL
// ──────────────────────────────────────────────────────────────────────────────
router.post('/community', authMiddleware, planGate('LABEL', 'fan-grid'), async (req, res) => {
  try {
    const { commentText } = req.body;
    const result = await analyzeComment(commentText);
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (err) {
    logger.error(`[LabRoutes:community] ${err.message}`);
    res.status(500).json({ error: 'Error analizando comentario.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/lab/sonic — SONIC FORGE
// Requiere: Plan PRO+
// ──────────────────────────────────────────────────────────────────────────────
router.post('/sonic', authMiddleware, planGate('PRO', 'sonic-forge'), async (req, res) => {
  try {
    const { genre = 'pop', mood = 'energético' } = req.body;
    const result = await generateMusicalBlueprint(genre, mood);
    if (!result.success) return res.status(500).json(result);
    res.json(result);
  } catch (err) {
    logger.error(`[LabRoutes:sonic] ${err.message}`);
    res.status(500).json({ error: 'Error generando blueprint musical.' });
  }
});

// Manejo de error de multer
router.use((err, req, res, next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Archivo demasiado grande. Máximo 100MB.' });
  }
  if (err?.message?.includes('Formato de audio no soportado')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
