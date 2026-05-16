const logger = require('../utils/logger');
const prisma = require('../utils/prisma');
const { generateDDEXPackage, validateDDEXStructure } = require('./ddexService');
const { validateForDistribution } = require('./dspValidationService');
const SimulationProvider = require('../providers/SimulationProvider');
const PartnerProvider = require('../providers/PartnerProvider');
const { validateMetadata } = require('../utils/moderation');

/**
 * DistributionOrchestrator — El corazón del Distribution Layer de Zonyd
 * 
 * Reemplaza el distributionService.js anterior (que solo tenía un setTimeout).
 * Este es el pipeline real de distribución:
 * 
 *   1. Cargar release completo desde BD
 *   2. Validar metadata DSP
 *   3. Validar contenido (moderación anti-spam)
 *   4. Generar paquete DDEX ERN 4.3
 *   5. Seleccionar provider activo (Simulation o Partner)
 *   6. Entregar al provider
 *   7. Registrar audit logs
 *   8. Actualizar estado del release
 *   9. Notificar por email
 * 
 * El provider activo se controla via variable de entorno:
 *   DISTRIBUTION_MODE=simulation | partner
 */
class DistributionOrchestrator {
  constructor() {
    const mode = process.env.DISTRIBUTION_MODE || 'simulation';
    const partnerProvider = new PartnerProvider();

    if (mode === 'partner' && partnerProvider.configured) {
      this.provider = partnerProvider;
      logger.info(`[Orchestrator] Modo: PARTNER — ${partnerProvider.partnerName}`);
    } else {
      this.provider = new SimulationProvider();
      if (mode === 'partner') {
        logger.warn('[Orchestrator] Partner no configurado. Usando SimulationProvider como fallback.');
      } else {
        logger.info('[Orchestrator] Modo: SIMULATION (Fase 1)');
      }
    }
  }

  /**
   * Orquestar la distribución completa de un release.
   * @param {string} releaseId - UUID del release en Prisma
   * @param {Object} jobOptions - Opciones del job de BullMQ { attemptsMade, jobId }
   * @returns {Promise<Object>} Resultado de la distribución
   */
  async orchestrate(releaseId, jobOptions = {}) {
    const startTime = Date.now();
    logger.info(`[Orchestrator] ▶ Iniciando distribución — Release: ${releaseId} | Attempt: ${(jobOptions.attemptsMade || 0) + 1}`);

    // ── PASO 1: Cargar release completo ──────────────────────────────
    let release;
    try {
      release = await prisma.release.findUnique({
        where: { id: releaseId },
        include: {
          tracks: {
            include: {
              collaborators: { include: { artist: true } },
              splits: { include: { artist: true } },
            },
          },
          artist: true,
          deliveries: true,
        },
      });

      if (!release) {
        throw new Error(`Release ${releaseId} no encontrado en la base de datos.`);
      }
    } catch (err) {
      logger.error(`[Orchestrator] Error cargando release: ${err.message}`);
      throw err;
    }

    // ── PASO 2: Verificar estado — solo procesar releases aprobados ──
    if (release.status !== 'APPROVED' && release.status !== 'PENDING_APPROVAL') {
      logger.warn(`[Orchestrator] Release ${releaseId} en estado inválido: ${release.status}. Saltando.`);
      return { skipped: true, reason: `Estado inválido: ${release.status}` };
    }

    // ── PASO 3: Actualizar estado a PROCESSING ───────────────────────
    await prisma.release.update({
      where: { id: releaseId },
      data: { status: 'PROCESSING' },
    });

    await this._auditLog(release.artist?.userId, 'DISTRIBUTION_STARTED', {
      releaseId,
      releaseTitle: release.title,
      provider: this.provider.name,
    });

    try {
      // ── PASO 4: Validación DSP técnica ─────────────────────────────
      logger.info(`[Orchestrator] Paso 4: Validación DSP para "${release.title}"`);
      const dspValidation = await validateForDistribution(release);
      if (!dspValidation.isValid) {
        await this._fail(release, `Validación DSP fallida: ${dspValidation.errors.join(' | ')}`, true);
        return { success: false, reason: 'dsp_validation_failed', errors: dspValidation.errors };
      }

      // ── PASO 5: Validación de moderación de contenido ──────────────
      logger.info(`[Orchestrator] Paso 5: Moderación de contenido`);
      const titleCheck = validateMetadata(release.title, 'title');
      if (!titleCheck.valid) {
        await this._fail(release, `Moderación fallida: ${titleCheck.reason}`, true);
        return { success: false, reason: 'moderation_failed', errors: [titleCheck.reason] };
      }

      for (const track of release.tracks) {
        const trackCheck = validateMetadata(track.title, 'title');
        if (!trackCheck.valid) {
          await this._fail(release, `Track "${track.title}" falló moderación: ${trackCheck.reason}`, true);
          return { success: false, reason: 'moderation_failed', errors: [trackCheck.reason] };
        }
      }

      // ── PASO 6: Validación del provider seleccionado ───────────────
      logger.info(`[Orchestrator] Paso 6: Validación de provider (${this.provider.name})`);
      const providerValidation = await this.provider.validate(release);
      if (!providerValidation.valid) {
        await this._fail(release, `Provider validation failed: ${providerValidation.errors.join(' | ')}`, false);
        return { success: false, reason: 'provider_validation_failed', errors: providerValidation.errors };
      }

      // ── PASO 7: Generar paquete DDEX ERN 4.3 ──────────────────────
      logger.info(`[Orchestrator] Paso 7: Generando paquete DDEX ERN 4.3`);
      const ddexPackage = await generateDDEXPackage(release, {
        territories: release.territories || 'worldwide',
        labelName: release.labelName || release.artist?.stageName || 'Zonyd Independent',
        language: release.language || 'es',
        releaseType: release.type || 'Single',
      });

      // Validar estructura del XML generado
      const xmlValidation = validateDDEXStructure(ddexPackage.xml);
      if (!xmlValidation.valid) {
        logger.warn(`[Orchestrator] DDEX XML con advertencias: ${xmlValidation.errors.join(', ')}`);
      }

      // ── PASO 8: Entregar al provider ───────────────────────────────
      logger.info(`[Orchestrator] Paso 8: Entregando a provider "${this.provider.name}"`);
      const deliveryResult = await this.provider.deliver({
        release,
        xml: ddexPackage.xml,
        xmlFilePath: ddexPackage.xmlFilePath,
        packageDir: ddexPackage.packageDir,
        checksums: ddexPackage.checksums,
        messageId: ddexPackage.messageId,
      });

      if (!deliveryResult.success) {
        await this._fail(release, `Provider entrega fallida: ${JSON.stringify(deliveryResult)}`, false);
        return { success: false, reason: 'provider_delivery_failed', deliveryResult };
      }

      // ── PASO 9: Actualizar release a DISTRIBUTED ───────────────────
      const preSaveUrl = `https://zonyd.com/pre/${releaseId.substring(0, 8)}`;
      await prisma.release.update({
        where: { id: releaseId },
        data: {
          status: 'DISTRIBUTED',
          distributedAt: new Date(),
          preSaveUrl,
        },
      });

      // ── PASO 10: Audit log de éxito ────────────────────────────────
      const elapsedMs = Date.now() - startTime;
      await this._auditLog(release.artist?.userId, 'DISTRIBUTION_COMPLETED', {
        releaseId,
        releaseTitle: release.title,
        provider: this.provider.name,
        deliveryId: deliveryResult.deliveryId,
        elapsedMs,
        ddexMessageId: ddexPackage.messageId,
      });

      logger.info(`[Orchestrator] ✅ Distribución completada para ${releaseId} en ${elapsedMs}ms (Delivery: ${deliveryResult.deliveryId})`);

      return {
        success: true,
        releaseId,
        deliveryId: deliveryResult.deliveryId,
        ddexMessageId: ddexPackage.messageId,
        provider: this.provider.name,
        elapsedMs,
        preSaveUrl,
      };

    } catch (err) {
      logger.error(`[Orchestrator] ❌ Error en distribución de ${releaseId}: ${err.message}`);
      await this._fail(release, err.message, false);
      throw err; // Re-lanzar para que BullMQ gestione el retry
    }
  }

  /**
   * Marcar release como fallido con razón auditada.
   */
  async _fail(release, reason, isRejection = false) {
    const status = isRejection ? 'REJECTED' : 'FAILED';
    try {
      await prisma.release.update({
        where: { id: release.id },
        data: { status },
      });
      await this._auditLog(release.artist?.userId, `DISTRIBUTION_${status}`, {
        releaseId: release.id,
        reason,
      });
      logger.error(`[Orchestrator] Release ${release.id} marcado como ${status}: ${reason}`);
    } catch (updateErr) {
      logger.error(`[Orchestrator] Error actualizando estado de fallo: ${updateErr.message}`);
    }
  }

  /**
   * Registrar acción en AuditLog.
   */
  async _auditLog(userId, action, details) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          action,
          details: JSON.stringify(details),
        },
      });
    } catch (err) {
      logger.warn(`[Orchestrator] No se pudo registrar AuditLog: ${err.message}`);
    }
  }

  /**
   * Solicitar takedown de un release distribuido.
   */
  async requestTakedown(releaseId, reason) {
    const release = await prisma.release.findUnique({
      where: { id: releaseId },
      include: { deliveries: true, artist: true },
    });

    if (!release) throw new Error('Release no encontrado');

    const deliveries = release.deliveries;
    const results = [];

    for (const delivery of deliveries) {
      if (delivery.partnerDeliveryId) {
        const result = await this.provider.takedown(delivery.partnerDeliveryId, reason);
        results.push({ dsp: delivery.dspName, ...result });
      }
    }

    await prisma.release.update({ where: { id: releaseId }, data: { status: 'FAILED' } });
    await this._auditLog(release.artist?.userId, 'TAKEDOWN_REQUESTED', { releaseId, reason, results });

    return results;
  }

  /**
   * Verificar salud del provider activo.
   */
  async checkProviderHealth() {
    return await this.provider.healthCheck();
  }
}

// Singleton para uso en workers
const orchestratorInstance = new DistributionOrchestrator();

module.exports = { DistributionOrchestrator, orchestrator: orchestratorInstance };
