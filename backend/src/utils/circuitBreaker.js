const CircuitBreaker = require('opossum');
const logger = require('../utils/logger');

// Configuración genérica para servicios externos
const options = {
  timeout: 5000, // 5 segundos
  errorThresholdPercentage: 50, // 50% de errores abren el circuito
  resetTimeout: 30000 // Reintentar en 30 segundos
};

const createBreaker = (action, name) => {
  const breaker = new CircuitBreaker(action, options);

  breaker.on('open', () => logger.warn(`🛑 CIRCUITO ABIERTO: ${name}`));
  breaker.on('halfOpen', () => logger.info(`⚠️ CIRCUITO SEMI-ABIERTO: ${name}`));
  breaker.on('close', () => logger.info(`✅ CIRCUITO CERRADO (RECUPERADO): ${name}`));
  breaker.on('fallback', () => logger.error(`📉 FALLBACK EJECUTADO: ${name}`));

  return breaker;
};

module.exports = { createBreaker };
