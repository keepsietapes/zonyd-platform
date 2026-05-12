const prisma = require('../utils/prisma');

/**
 * Middleware para registrar acciones sensibles en la tabla AuditLog.
 * @param {string} action - El nombre de la acción (ej: 'WITHDRAWAL_REQUEST').
 */
const auditLog = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function (body) {
      res.send = originalSend;
      
      // Solo registramos si la operación fue exitosa (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id || null;
        const details = {
          method: req.method,
          url: req.originalUrl,
          ip: req.ip,
          body: req.body,
          params: req.params,
          query: req.query,
          status: res.statusCode
        };

        // Lo hacemos de forma asíncrona sin bloquear la respuesta
        prisma.auditLog.create({
          data: {
            userId,
            action,
            details: JSON.stringify(details)
          }
        }).catch(err => console.error('Error saving audit log:', err));
      }
      
      return res.send(body);
    };
    
    next();
  };
};

module.exports = auditLog;
