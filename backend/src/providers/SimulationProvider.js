const IDistributionProvider = require('./IDistributionProvider');
const logger = require('../utils/logger');
const prisma = require('../utils/prisma');
const { supabase } = require('../utils/supabase');
const fs = require('fs');

/**
 * SimulationProvider — FASE 1 del Distribution Layer
 * 
 * Este provider simula la entrega a DSPs de forma profesional:
 * - Registra DspDelivery records reales en base de datos
 * - Sube el paquete DDEX a Supabase Storage
 * - Simula tiempos de procesamiento realistas por DSP
 * - Genera delivery IDs trazables
 * - Retorna estados reales (no solo setTimeout)
 * 
 * Cuando el partner real (Revelator/LabelGrid) esté listo,
 * se reemplaza este provider por PartnerProvider sin tocar nada más.
 */
class SimulationProvider extends IDistributionProvider {
  get name() {
    return 'simulation';
  }

  // DSPs simulados con sus tiempos de procesamiento realistas (en ms para demo)
  static DSP_TARGETS = [
    { name: 'Spotify',       processingMs: 3000, territories: 'Worldwide' },
    { name: 'Apple Music',   processingMs: 4500, territories: 'Worldwide' },
    { name: 'Amazon Music',  processingMs: 5000, territories: 'Worldwide' },
    { name: 'YouTube Music', processingMs: 3500, territories: 'Worldwide' },
    { name: 'Deezer',        processingMs: 2500, territories: 'Worldwide' },
    { name: 'TikTok',        processingMs: 2000, territories: 'Worldwide' },
  ];

  async validate(release) {
    const errors = [];

    if (!release.title || release.title.trim().length < 1) {
      errors.push('El título del release es requerido.');
    }
    if (!release.tracks || release.tracks.length === 0) {
      errors.push('El release debe tener al menos un track.');
    }
    if (!release.coverUrl) {
      errors.push('El artwork (portada) es requerido.');
    }
    release.tracks?.forEach((track, i) => {
      if (!track.isrc) errors.push(`Track ${i + 1}: falta ISRC.`);
      if (!track.audioUrl && !track.flacPath) errors.push(`Track ${i + 1}: falta URL de audio.`);
    });

    return { valid: errors.length === 0, errors };
  }

  async deliver(releasePackage) {
    const { release, xmlFilePath, packageDir, checksums, messageId } = releasePackage;

    logger.info(`[SimulationProvider] Iniciando entrega simulada para release ${release.id}`);

    const deliveryId = `SIM-${release.id.substring(0, 8).toUpperCase()}-${Date.now()}`;

    // 1. Subir XML DDEX a Supabase Storage bucket 'manifests'
    let ddexStorageUrl = null;
    try {
      if (fs.existsSync(xmlFilePath)) {
        const xmlBuffer = fs.readFileSync(xmlFilePath);
        const storagePath = `ddex/${release.id}/${release.upc || release.id}_ern43.xml`;

        const { error: uploadError } = await supabase.storage
          .from('manifests')
          .upload(storagePath, xmlBuffer, {
            contentType: 'application/xml',
            upsert: true,
          });

        if (uploadError) {
          logger.warn(`[SimulationProvider] Error al subir DDEX a Supabase: ${uploadError.message}`);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('manifests')
            .getPublicUrl(storagePath);
          ddexStorageUrl = publicUrl;
          logger.info(`[SimulationProvider] DDEX subido a Supabase: ${ddexStorageUrl}`);
        }
      }
    } catch (storageErr) {
      logger.warn(`[SimulationProvider] Supabase Storage no disponible, continuando sin URL: ${storageErr.message}`);
    }

    // 2. Registrar entrega para cada DSP objetivo
    const dspResults = [];
    for (const dsp of SimulationProvider.DSP_TARGETS) {
      try {
        // Simular latencia de procesamiento por DSP
        await new Promise(resolve => setTimeout(resolve, Math.min(dsp.processingMs, 500)));

        // Registrar DspDelivery en base de datos
        const delivery = await prisma.dspDelivery.create({
          data: {
            releaseId: release.id,
            dspName: dsp.name,
            status: 'DELIVERED',
            partnerDeliveryId: `${deliveryId}-${dsp.name.replace(/\s/g, '_').toUpperCase()}`,
            ddexPackageUrl: ddexStorageUrl,
            metadata: {
              messageId,
              checksumMd5: checksums?.xml,
              territories: dsp.territories,
              simulatedAt: new Date().toISOString(),
              provider: this.name,
            },
          },
        });

        dspResults.push({
          dsp: dsp.name,
          deliveryRecordId: delivery.id,
          status: 'DELIVERED',
          partnerDeliveryId: delivery.partnerDeliveryId,
        });

        logger.info(`[SimulationProvider] ✓ ${dsp.name} — entrega registrada (ID: ${delivery.id})`);
      } catch (dspErr) {
        logger.error(`[SimulationProvider] Error registrando ${dsp.name}: ${dspErr.message}`);
        dspResults.push({ dsp: dsp.name, status: 'FAILED', error: dspErr.message });
      }
    }

    // 3. Limpiar archivos temporales locales
    try {
      if (packageDir && fs.existsSync(packageDir)) {
        fs.rmSync(packageDir, { recursive: true, force: true });
        logger.info(`[SimulationProvider] Archivos temporales eliminados: ${packageDir}`);
      }
    } catch (cleanErr) {
      logger.warn(`[SimulationProvider] No se pudieron limpiar temporales: ${cleanErr.message}`);
    }

    const allDelivered = dspResults.every(r => r.status === 'DELIVERED');

    return {
      success: allDelivered,
      deliveryId,
      ddexStorageUrl,
      providerResponse: {
        provider: this.name,
        messageId,
        dspResults,
        deliveredAt: new Date().toISOString(),
      },
    };
  }

  async getStatus(deliveryId) {
    // En simulación, buscar los DspDelivery records del release
    try {
      // deliveryId format: SIM-XXXXXXXX-timestamp
      // Extraemos el releaseId parcial del deliveryId
      const partialId = deliveryId.replace('SIM-', '').split('-')[0].toLowerCase();

      const deliveries = await prisma.dspDelivery.findMany({
        where: {
          partnerDeliveryId: { contains: deliveryId.split('-').slice(0, 2).join('-') },
        },
      });

      const dspStatuses = deliveries.map(d => ({
        dsp: d.dspName,
        status: d.status,
        deliveredAt: d.deliveredAt,
        partnerDeliveryId: d.partnerDeliveryId,
      }));

      return {
        status: deliveries.length > 0 ? 'DELIVERED' : 'UNKNOWN',
        dspStatuses,
        lastUpdated: new Date(),
      };
    } catch (err) {
      logger.error(`[SimulationProvider] Error en getStatus: ${err.message}`);
      return { status: 'ERROR', dspStatuses: [], lastUpdated: new Date() };
    }
  }

  async takedown(deliveryId, reason = 'Artist request') {
    logger.info(`[SimulationProvider] Takedown simulado para ${deliveryId}: ${reason}`);

    try {
      await prisma.dspDelivery.updateMany({
        where: {
          partnerDeliveryId: { contains: deliveryId.split('-').slice(0, 2).join('-') },
        },
        data: { status: 'TAKEDOWN' },
      });
    } catch (err) {
      logger.error(`[SimulationProvider] Error en takedown: ${err.message}`);
    }

    return {
      success: true,
      takedownId: `TAKEDOWN-${deliveryId}-${Date.now()}`,
    };
  }

  async healthCheck() {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { healthy: true, latencyMs: Date.now() - start };
    } catch {
      return { healthy: false, latencyMs: Date.now() - start };
    }
  }
}

module.exports = SimulationProvider;
