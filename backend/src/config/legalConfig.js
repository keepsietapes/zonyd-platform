/**
 * legalConfig.js — Configuración Centralizada de Documentos Legales de Zonyd
 * 
 * Este archivo contiene las versiones, rutas y metadatos de todos los documentos
 * legales de la plataforma. Se usa para:
 * - Verificar que el usuario ha aceptado la versión vigente de cada documento
 * - Registrar la aceptación con timestamp e IP en la base de datos
 * - Mostrar el documento correcto en el frontend
 * - Gestionar actualizaciones y notificaciones de cambios
 */

const LEGAL_DOCUMENTS = {
  /**
   * Términos y Condiciones Generales de Uso
   * Obligatorio en: registro de cuenta
   */
  TERMS_AND_CONDITIONS: {
    id: 'terms_and_conditions',
    version: '1.0',
    effectiveDate: '2026-01-01', // [ACTUALIZAR con fecha real]
    url: '/legal/terms',
    title: 'Términos y Condiciones de Uso',
    shortTitle: 'Términos de Uso',
    required: true,
    requiredAt: 'registration', // registration | distribution | always
    checkboxLabel: 'He leído y acepto los Términos y Condiciones de Uso de Zonyd',
    emailSubject: 'Confirmación de aceptación — Términos y Condiciones de Zonyd',
  },

  /**
   * Aviso de Privacidad / Política de Protección de Datos
   * Obligatorio en: registro de cuenta
   */
  PRIVACY_POLICY: {
    id: 'privacy_policy',
    version: '1.0',
    effectiveDate: '2026-01-01', // [ACTUALIZAR con fecha real]
    url: '/legal/privacy',
    title: 'Aviso de Privacidad y Política de Protección de Datos',
    shortTitle: 'Política de Privacidad',
    required: true,
    requiredAt: 'registration',
    checkboxLabel: 'He leído y acepto el Aviso de Privacidad de Zonyd',
    emailSubject: 'Confirmación de aceptación — Política de Privacidad de Zonyd',
  },

  /**
   * Acuerdo de Distribución Musical
   * Obligatorio en: primer lanzamiento / cada lanzamiento
   */
  DISTRIBUTION_AGREEMENT: {
    id: 'distribution_agreement',
    version: '1.0',
    effectiveDate: '2026-01-01', // [ACTUALIZAR con fecha real]
    url: '/legal/distribution-agreement',
    title: 'Acuerdo de Distribución Musical',
    shortTitle: 'Acuerdo de Distribución',
    required: true,
    requiredAt: 'distribution',
    checkboxLabel: 'He leído y acepto el Acuerdo de Distribución Musical de Zonyd',
    emailSubject: 'Confirmación de tu Acuerdo de Distribución — Zonyd',
  },

  /**
   * Política de Copyright y Anti-Fraude
   * Obligatorio en: registro + distribución
   */
  COPYRIGHT_POLICY: {
    id: 'copyright_policy',
    version: '1.0',
    effectiveDate: '2026-01-01', // [ACTUALIZAR con fecha real]
    url: '/legal/copyright',
    title: 'Política de Copyright, Contenido y Anti-Fraude',
    shortTitle: 'Política de Copyright',
    required: true,
    requiredAt: 'registration',
    checkboxLabel: 'Confirmo que mi contenido no viola derechos de autor y acepto la Política de Copyright de Zonyd',
    emailSubject: 'Confirmación de aceptación — Política de Copyright de Zonyd',
  },

  /**
   * Política de Cookies
   * Obligatorio en: primera visita (banner de cookies)
   */
  COOKIE_POLICY: {
    id: 'cookie_policy',
    version: '1.0',
    effectiveDate: '2026-01-01', // [ACTUALIZAR con fecha real]
    url: '/legal/cookies',
    title: 'Política de Cookies',
    shortTitle: 'Cookies',
    required: false, // Solo necesario para cookies opcionales
    requiredAt: 'visit',
    checkboxLabel: 'Acepto el uso de cookies',
    emailSubject: null,
  },
};

/**
 * Obtener todos los documentos requeridos para el registro
 */
function getRegistrationDocuments() {
  return Object.values(LEGAL_DOCUMENTS).filter(
    (doc) => doc.requiredAt === 'registration' && doc.required
  );
}

/**
 * Obtener todos los documentos requeridos para distribución
 */
function getDistributionDocuments() {
  return Object.values(LEGAL_DOCUMENTS).filter(
    (doc) => (doc.requiredAt === 'distribution' || doc.requiredAt === 'registration') && doc.required
  );
}

/**
 * Verificar si un usuario ha aceptado todos los documentos requeridos
 * @param {Array} userAcceptances - Array de { documentId, version, acceptedAt } del usuario
 * @param {string} context - 'registration' | 'distribution'
 * @returns {{ allAccepted: boolean, missing: Array }}
 */
function verifyUserAcceptances(userAcceptances, context = 'registration') {
  const required = context === 'distribution'
    ? getDistributionDocuments()
    : getRegistrationDocuments();

  const missing = [];

  for (const doc of required) {
    const acceptance = userAcceptances?.find(
      (a) => a.documentId === doc.id && a.version === doc.version
    );
    if (!acceptance) {
      missing.push({
        documentId: doc.id,
        version: doc.version,
        title: doc.shortTitle,
        url: doc.url,
      });
    }
  }

  return {
    allAccepted: missing.length === 0,
    missing,
  };
}

module.exports = {
  LEGAL_DOCUMENTS,
  getRegistrationDocuments,
  getDistributionDocuments,
  verifyUserAcceptances,
};
