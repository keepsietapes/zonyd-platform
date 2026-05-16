/**
 * ZONYD LAB AI — Índice de Agentes
 * Punto de entrada centralizado para el ecosistema multi-agente
 *
 * FASE 1 — Foundation Layer (Implementado)
 * ├── ZonydCore      → Orquestador principal + Chat contextual
 * ├── SpectralEngine → Análisis y mastering de audio (FFmpeg + Gemini)
 * └── NeuralAnalytics → Predicciones y analytics avanzados
 *
 * FASE 2 — Content Layer (Próxima)
 * ├── SocialPulse    → Generación de contenido para redes
 * ├── ContentFactory → 1 canción → 20+ assets automáticos
 * └── TrendHunter    → Alertas de tendencias en tiempo real
 *
 * FASE 3 — Distribution Intelligence (Planeada)
 * ├── ReleaseCommand → Metadata AI + pitching a DSPs
 * ├── ReleasePredictor → Predicción de performance pre-lanzamiento
 * └── PlaylistAttack → Automatización de pitching a playlists
 *
 * FASE 4 — Advanced Agents (Futuro)
 * ├── Visionary      → Generación de portadas y assets visuales
 * ├── GrowthEngine   → Integración con Meta/TikTok/Google Ads
 * ├── SyncBridge     → Clasificación y pitching para sync licensing
 * ├── LiveCircuit    → Booking y EPK automático
 * ├── FanGrid        → Community management assistido por IA
 * └── SonicForge     → Composición y producción musical AI
 */

module.exports = {
  // Fase 1 — Activos
  ZonydCore:      require('./ZonydCore'),
  SpectralEngine: require('./SpectralEngine'),
  NeuralAnalytics: require('./NeuralAnalytics'),

  // Fase 2 — Activos
  SocialPulse:    require('./SocialPulse'),
  ContentFactory: require('./ContentFactory'),
  TrendHunter:    require('./TrendHunter'),

  // Fase 3 — Activos
  ReleaseCommand:   require('./ReleaseCommand'),
  ReleasePredictor: require('./ReleasePredictor'),
  PlaylistAttack:   require('./PlaylistAttack'),

  // Fase 4 — Activos
  Visionary:    require('./Visionary'),
  GrowthEngine: require('./GrowthEngine'),
  SyncBridge:   require('./SyncBridge'),
  LiveCircuit:  require('./LiveCircuit'),
  FanGrid:      require('./FanGrid'),
  SonicForge:   require('./SonicForge'),

  PHASE: '4.0.0',
  ACTIVE_AGENTS: [
    'ZonydCore', 'SpectralEngine', 'NeuralAnalytics', 
    'SocialPulse', 'ContentFactory', 'TrendHunter', 
    'ReleaseCommand', 'ReleasePredictor', 'PlaylistAttack',
    'Visionary', 'GrowthEngine', 'SyncBridge', 'LiveCircuit', 'FanGrid', 'SonicForge'
  ],
};
