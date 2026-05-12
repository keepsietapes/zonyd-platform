const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl === '/health') return; // Evitar spam de logs de salud

    logger.http(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms - IP: ${req.ip}`
    );
  });

  next();
};

module.exports = requestLogger;
