const { v4: uuidv4 } = require('uuid');

/**
 * Genera una clave de idempotencia única.
 * @param {string} prefix - Prefijo para identificar la operación (ej: 'payout').
 * @param {string} resourceId - ID del recurso relacionado (ej: releaseId).
 * @returns {string}
 */
const generateIdempotencyKey = (prefix, resourceId) => {
  // Combinamos prefijo + resourceId + la fecha actual (día) para asegurar unicidad por operación/día
  const date = new Date().toISOString().split('T')[0];
  return `${prefix}_${resourceId}_${date}`;
};

module.exports = {
  generateIdempotencyKey,
  uuidv4,
};
