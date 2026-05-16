require('dotenv').config();
const Sentry = require("@sentry/node");

// 1. Inicializar Sentry antes que cualquier otro módulo
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  integrations: [
    // Se agregan integraciones de tracing si es necesario
  ],
  tracesSampleRate: 1.0,
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const pino = require('pino-http')({
  logger: require('./utils/logger'),
  useLevel: 'info'
});
const rateLimit = require('express-rate-limit');

const app = express();

// The request handler is no longer needed as a separate middleware in Sentry 8+ for basic Express usage
// if you are using setupExpressErrorHandler.


// Confiar en el proxy de Cloudflare para obtener la IP real
app.set('trust proxy', true);

// Configuración estricta de seguridad en cabeceras
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(pino);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://zonyd.com',
  'https://www.zonyd.com',
  'https://app.zonyd.com',
  'https://api.zonyd.com',
  'https://zonyd.pages.dev',
  'https://tiny-bread-e6ab.keepsietapes.workers.dev'
];



app.use(cors({
  origin: (origin, callback) => {
    if (!origin || 
        allowedOrigins.includes(origin) || 
        origin.endsWith('.zonyd.pages.dev') ||
        origin.endsWith('.keepsietapes.workers.dev')) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por política CORS de Zonyd'));
    }
  },
  credentials: true
}));

// Prevención de DoS: Reducir el tamaño masivo de 50mb a 2mb para JSON regular.
// Las subidas de audio/archivos se manejan vía Multer, no vía body parser.
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// Límite de peticiones global (Prevención de DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // Límite incrementado un poco para navegación general
  message: { error: "Demasiadas peticiones detectadas. Por favor, reintenta en 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Límite ESTRICTO específico para Inteligencia Artificial y pagos
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // Solo 30 peticiones cada 15 min para evitar robo de cómputo (LLMs)
  message: { error: "Límite de seguridad de IA excedido para evitar abuso. Pausa unos minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/ai', aiLimiter);
app.use('/api/lab', aiLimiter);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Music Distribution API' });
});

app.get('/health', async (req, res) => {
  try {
    const prisma = require('./utils/prisma');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected', timestamp: new Date() });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/billing', require('./routes/planRoutes'));
app.use('/api/artist', require('./routes/artistRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/releases', require('./routes/releaseRoutes'));
app.use('/api/distribute', require('./routes/distributionRoutes'));
app.use('/api/royalties', require('./routes/royaltyRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/spotify', require('./routes/spotifyRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/legal', require('./routes/legalRoutes'));
app.use('/api/lab',   require('./routes/labRoutes'));    // ZONYD LAB AI — Phase 1
app.use('/api/smartlinks', require('./routes/smartlinksRoutes'));
app.use('/api/publishing', require('./routes/publishingRoutes'));
app.use('/api/audience',   require('./routes/audienceRoutes'));
app.use('/api/marketing',  require('./routes/marketingRoutes'));


// Inicializar Workers de procesamiento (Zonyd Engine)
require('./jobs/audioWorker');
require('./jobs/distributionWorker');


// In Sentry 8+, use setupExpressErrorHandler instead of the old errorHandler middleware
Sentry.setupExpressErrorHandler(app);


app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

// Colas de Trabajo (BullMQ)
const { Queue } = require('bullmq');
let distributionQueue = null;


if (process.env.REDIS_URL) {
  try {
    distributionQueue = new Queue('distribution', {
      connection: { url: process.env.REDIS_URL }
    });
    console.log('✅ BullMQ conectado a Redis');
  } catch (err) {
    console.warn('⚠️ Advertencia: No se pudo conectar a Redis. Las colas de distribución están desactivadas.');
  }
} else {
  console.log('ℹ️ Redis no configurado. Continuando sin colas de distribución.');
}

// Graceful Shutdown
const prisma = require('./utils/prisma');

const shutdown = async () => {
  console.log('Shutting down server...');
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    // Cerramos la conexión a Redis (BullMQ utiliza Redis)
    // const redis = new Redis(connection);
    // await redis.quit();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
