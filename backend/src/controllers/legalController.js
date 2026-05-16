const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const { LEGAL_DOCUMENTS, verifyUserAcceptances } = require('../config/legalConfig');

/**
 * GET /api/legal/documents
 * Devuelve todos los documentos legales con sus metadatos (sin el contenido completo).
 */
async function getLegalDocuments(req, res, next) {
  try {
    res.json({
      documents: Object.values(LEGAL_DOCUMENTS),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/legal/accept
 * Registra la aceptación de uno o varios documentos legales por parte del usuario.
 * 
 * Body: { acceptances: [{ documentId: string, version: string }] }
 */
async function recordAcceptance(req, res, next) {
  const { acceptances } = req.body;
  const userId = req.user.id;

  if (!acceptances || !Array.isArray(acceptances) || acceptances.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de aceptaciones.' });
  }

  try {
    const recorded = [];

    for (const acceptance of acceptances) {
      const { documentId, version } = acceptance;

      // Validar que el documento existe en nuestra configuración
      const docConfig = Object.values(LEGAL_DOCUMENTS).find(
        (d) => d.id === documentId && d.version === version
      );

      if (!docConfig) {
        logger.warn(`[LegalController] Intento de aceptación de documento desconocido: ${documentId} v${version}`);
        continue; // Ignorar documentos no reconocidos
      }

      // Registrar en AuditLog con datos completos de trazabilidad
      const auditRecord = await prisma.auditLog.create({
        data: {
          userId,
          action: 'LEGAL_DOCUMENT_ACCEPTED',
          details: JSON.stringify({
            documentId,
            version,
            title: docConfig.title,
            effectiveDate: docConfig.effectiveDate,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
            acceptedAt: new Date().toISOString(),
          }),
        },
      });

      recorded.push({
        documentId,
        version,
        auditLogId: auditRecord.id,
        acceptedAt: auditRecord.createdAt,
      });

      logger.info(`[LegalController] Usuario ${userId} aceptó ${documentId} v${version}`);
    }

    res.json({
      success: true,
      recorded,
      message: `${recorded.length} documento(s) registrado(s) correctamente.`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/legal/user-status
 * Devuelve el estado de aceptación de los documentos legales del usuario autenticado.
 */
async function getUserLegalStatus(req, res, next) {
  const userId = req.user.id;

  try {
    // Buscar todas las aceptaciones del usuario en el AuditLog
    const acceptanceLogs = await prisma.auditLog.findMany({
      where: {
        userId,
        action: 'LEGAL_DOCUMENT_ACCEPTED',
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parsear los detalles de cada log
    const userAcceptances = acceptanceLogs.map((log) => {
      try {
        const details = JSON.parse(log.details || '{}');
        return {
          documentId: details.documentId,
          version: details.version,
          acceptedAt: log.createdAt,
          auditLogId: log.id,
        };
      } catch {
        return null;
      }
    }).filter(Boolean);

    // Verificar si tiene todos los documentos de registro y distribución
    const registrationStatus = verifyUserAcceptances(userAcceptances, 'registration');
    const distributionStatus = verifyUserAcceptances(userAcceptances, 'distribution');

    res.json({
      userId,
      acceptances: userAcceptances,
      registrationComplete: registrationStatus.allAccepted,
      distributionReady: distributionStatus.allAccepted,
      missingForRegistration: registrationStatus.missing,
      missingForDistribution: distributionStatus.missing,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware: verificar que el usuario ha aceptado los documentos de distribución
 * Usar en rutas de distribución antes de permitir el envío.
 */
async function requireLegalAcceptance(req, res, next) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'No autenticado.' });

  try {
    const acceptanceLogs = await prisma.auditLog.findMany({
      where: { userId, action: 'LEGAL_DOCUMENT_ACCEPTED' },
    });

    const userAcceptances = acceptanceLogs.map((log) => {
      try {
        return JSON.parse(log.details || '{}');
      } catch {
        return null;
      }
    }).filter(Boolean);

    const { allAccepted, missing } = verifyUserAcceptances(userAcceptances, 'distribution');

    if (!allAccepted) {
      return res.status(403).json({
        error: 'LEGAL_ACCEPTANCE_REQUIRED',
        message: 'Debe aceptar todos los documentos legales requeridos antes de distribuir.',
        missing,
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLegalDocuments,
  recordAcceptance,
  getUserLegalStatus,
  requireLegalAcceptance,
};
