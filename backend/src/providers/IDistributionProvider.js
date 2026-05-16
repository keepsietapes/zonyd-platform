/**
 * IDistributionProvider — Interfaz base del Adapter Pattern
 * Todos los providers de distribución deben implementar este contrato.
 * 
 * Permite migración transparente:
 *   SimulationProvider → PartnerProvider (Revelator/LabelGrid) → DSP directo
 * 
 * Sin cambios en el resto del sistema.
 */

class IDistributionProvider {
  /**
   * Nombre identificador del provider.
   * @type {string}
   */
  get name() {
    throw new Error('IDistributionProvider.name debe ser implementado por el provider.');
  }

  /**
   * Validar que el release cumple los requisitos específicos del provider.
   * @param {Object} release - Release de Prisma con tracks y artist incluidos
   * @returns {Promise<{ valid: boolean, errors: string[] }>}
   */
  async validate(release) {
    throw new Error('IDistributionProvider.validate() debe ser implementado por el provider.');
  }

  /**
   * Entregar el paquete DDEX al provider.
   * @param {Object} releasePackage - { release, ddexXml, xmlFilePath, packageDir, checksums }
   * @returns {Promise<{ success: boolean, deliveryId: string, providerResponse: Object }>}
   */
  async deliver(releasePackage) {
    throw new Error('IDistributionProvider.deliver() debe ser implementado por el provider.');
  }

  /**
   * Consultar el estado de una entrega previamente realizada.
   * @param {string} deliveryId - ID de entrega retornado por deliver()
   * @returns {Promise<{ status: string, dspStatuses: Object[], lastUpdated: Date }>}
   */
  async getStatus(deliveryId) {
    throw new Error('IDistributionProvider.getStatus() debe ser implementado por el provider.');
  }

  /**
   * Solicitar el takedown (retiro) de un release de los DSPs.
   * @param {string} deliveryId - ID de entrega
   * @param {string} reason - Motivo del retiro
   * @returns {Promise<{ success: boolean, takedownId: string }>}
   */
  async takedown(deliveryId, reason) {
    throw new Error('IDistributionProvider.takedown() debe ser implementado por el provider.');
  }

  /**
   * Obtener el estado de salud del provider (útil para circuit breaker).
   * @returns {Promise<{ healthy: boolean, latencyMs: number }>}
   */
  async healthCheck() {
    return { healthy: true, latencyMs: 0 };
  }
}

module.exports = IDistributionProvider;
