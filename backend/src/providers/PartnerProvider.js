const IDistributionProvider = require('./IDistributionProvider');
const logger = require('../utils/logger');
const fs = require('fs');
const FormData = require('form-data');

/**
 * PartnerProvider — FASE 2: Integración con White-Label Partner
 * 
 * Implementa la interfaz hacia distribuidores mayoristas con APIs REST:
 * - Revelator (revelator.com) — Spotify Preferred Provider, DDEX ERN 4.3
 * - LabelGrid (labelgrid.com) — Documentación pública, menor barrera de entrada
 * - SonoSuite (sonosuite.com) — White-label completo
 * 
 * Configurar en .env:
 *   DISTRIBUTION_PARTNER=revelator | labelgrid | sonosuite
 *   PARTNER_API_KEY=<api_key_del_partner>
 *   PARTNER_API_URL=<base_url_api>
 *   PARTNER_LABEL_ID=<id_de_tu_sello_en_el_partner>
 * 
 * NOTA: Este provider requiere credenciales reales del partner.
 * Hasta que se obtengan, SimulationProvider se usa como fallback automático.
 */
class PartnerProvider extends IDistributionProvider {
  constructor() {
    super();
    this.partnerName = process.env.DISTRIBUTION_PARTNER || 'revelator';
    this.apiKey = process.env.PARTNER_API_KEY;
    this.apiUrl = process.env.PARTNER_API_URL;
    this.labelId = process.env.PARTNER_LABEL_ID;
    this.configured = !!(this.apiKey && this.apiUrl && this.labelId);

    if (!this.configured) {
      logger.warn('[PartnerProvider] Partner no configurado. Variables faltantes: PARTNER_API_KEY, PARTNER_API_URL, PARTNER_LABEL_ID');
    }
  }

  get name() {
    return `partner:${this.partnerName}`;
  }

  async validate(release) {
    const errors = [];

    if (!this.configured) {
      errors.push('PartnerProvider no configurado. Verificar variables de entorno PARTNER_*.');
      return { valid: false, errors };
    }

    if (!release.upc) errors.push('UPC requerido por el partner distribuidor.');
    if (!release.tracks || release.tracks.length === 0) errors.push('Al menos un track requerido.');
    if (!release.coverUrl) errors.push('Artwork requerido.');

    release.tracks?.forEach((track, i) => {
      if (!track.isrc) errors.push(`Track ${i + 1}: ISRC requerido por el partner.`);
      if (!track.flacPath && !track.audioUrl) errors.push(`Track ${i + 1}: Audio procesado requerido.`);
    });

    // Verificar que el UPC tiene formato correcto (12-13 dígitos)
    if (release.upc && !/^\d{12,13}$/.test(release.upc)) {
      errors.push(`UPC inválido: ${release.upc}. Debe tener 12-13 dígitos.`);
    }

    return { valid: errors.length === 0, errors };
  }

  async deliver(releasePackage) {
    if (!this.configured) {
      logger.error('[PartnerProvider] Intento de entrega sin configuración. Usando SimulationProvider como fallback.');
      const SimulationProvider = require('./SimulationProvider');
      const sim = new SimulationProvider();
      const result = await sim.deliver(releasePackage);
      return { ...result, deliveryId: result.deliveryId.replace('SIM-', 'FALLBACK-SIM-') };
    }

    const { release, xmlFilePath, checksums, messageId } = releasePackage;
    logger.info(`[PartnerProvider:${this.partnerName}] Iniciando entrega real para release ${release.id}`);

    try {
      // ── ADAPTADOR POR PARTNER ──────────────────────────────────────
      switch (this.partnerName.toLowerCase()) {
        case 'revelator':
          return await this._deliverViaRevelator(releasePackage);
        case 'labelgrid':
          return await this._deliverViaLabelGrid(releasePackage);
        case 'sonosuite':
          return await this._deliverViaSonoSuite(releasePackage);
        default:
          return await this._deliverViaGenericREST(releasePackage);
      }
    } catch (err) {
      logger.error(`[PartnerProvider] Error crítico en entrega: ${err.message}`);
      throw err;
    }
  }

  /**
   * Revelator API Integration
   * Docs: https://revelator.com/api-documentation/
   * Método: POST /releases con multipart form (audio + cover + DDEX XML)
   */
  async _deliverViaRevelator(releasePackage) {
    const { release, xmlFilePath } = releasePackage;
    const axios = require('axios');

    // 1. Crear release en Revelator
    const releasePayload = {
      label_id: this.labelId,
      upc: release.upc,
      title: release.title,
      artists: [release.artist?.stageName || 'Unknown Artist'],
      genre: release.genre || 'Pop',
      release_date: release.releaseDate
        ? new Date(release.releaseDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      territories: 'worldwide',
      tracks: release.tracks.map(track => ({
        isrc: track.isrc,
        title: track.title,
        explicit: track.explicit || false,
        audio_url: track.flacPath || track.audioUrl,
      })),
      cover_url: release.coverUrl,
    };

    const { data: releaseData } = await axios.post(
      `${this.apiUrl}/v2/releases`,
      releasePayload,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Label-ID': this.labelId,
        },
        timeout: 30000,
      }
    );

    // 2. Subir DDEX XML si existe
    if (xmlFilePath && fs.existsSync(xmlFilePath)) {
      const form = new FormData();
      form.append('ddex_manifest', fs.createReadStream(xmlFilePath), {
        filename: `${release.upc}_ern43.xml`,
        contentType: 'application/xml',
      });

      await axios.post(
        `${this.apiUrl}/v2/releases/${releaseData.id}/ddex`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 60000,
        }
      );
    }

    logger.info(`[PartnerProvider:revelator] Release creado — Revelator ID: ${releaseData.id}`);

    return {
      success: true,
      deliveryId: `REV-${releaseData.id}`,
      providerResponse: releaseData,
    };
  }

  /**
   * LabelGrid API Integration
   * Docs: https://labelgrid.com/api
   * Acceso más sencillo, ideal para bootstrap
   */
  async _deliverViaLabelGrid(releasePackage) {
    const { release, xmlFilePath } = releasePackage;
    const axios = require('axios');

    const form = new FormData();
    form.append('api_key', this.apiKey);
    form.append('label_id', this.labelId);
    form.append('title', release.title);
    form.append('upc', release.upc || '');
    form.append('release_date',
      release.releaseDate
        ? new Date(release.releaseDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    );
    form.append('genre', release.genre || 'Pop');
    form.append('artist', release.artist?.stageName || 'Unknown');
    form.append('territories', 'WORLDWIDE');

    // Adjuntar DDEX XML
    if (xmlFilePath && fs.existsSync(xmlFilePath)) {
      form.append('ddex_file', fs.createReadStream(xmlFilePath), {
        filename: `${release.upc}_ern43.xml`,
        contentType: 'application/xml',
      });
    }

    const { data } = await axios.post(`${this.apiUrl}/releases/submit`, form, {
      headers: {
        ...form.getHeaders(),
        'X-API-Version': '2',
      },
      timeout: 60000,
    });

    logger.info(`[PartnerProvider:labelgrid] Entrega exitosa — ID: ${data.submission_id}`);

    return {
      success: true,
      deliveryId: `LG-${data.submission_id}`,
      providerResponse: data,
    };
  }

  /**
   * SonoSuite API Integration
   */
  async _deliverViaSonoSuite(releasePackage) {
    const { release, xmlFilePath } = releasePackage;
    const axios = require('axios');

    const payload = {
      label_id: this.labelId,
      ddex_version: 'ERN_43',
      release: {
        upc: release.upc,
        title: release.title,
        artist: release.artist?.stageName,
        genre: release.genre,
        release_date: release.releaseDate,
        territories: ['WORLDWIDE'],
        tracks: release.tracks?.map(t => ({
          isrc: t.isrc,
          title: t.title,
          audio_url: t.flacPath || t.audioUrl,
          explicit: t.explicit,
        })),
        cover_art_url: release.coverUrl,
      },
    };

    const { data } = await axios.post(`${this.apiUrl}/api/v1/releases`, payload, {
      headers: {
        Authorization: `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    return {
      success: true,
      deliveryId: `SS-${data.id}`,
      providerResponse: data,
    };
  }

  /**
   * Generic REST fallback para partners con API propia
   */
  async _deliverViaGenericREST(releasePackage) {
    const { release } = releasePackage;
    const axios = require('axios');

    const { data } = await axios.post(`${this.apiUrl}/releases`, {
      upc: release.upc,
      title: release.title,
      label_id: this.labelId,
    }, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      deliveryId: `PARTNER-${data.id || Date.now()}`,
      providerResponse: data,
    };
  }

  async getStatus(deliveryId) {
    if (!this.configured) {
      return { status: 'UNCONFIGURED', dspStatuses: [], lastUpdated: new Date() };
    }

    try {
      const axios = require('axios');
      const { data } = await axios.get(`${this.apiUrl}/releases/${deliveryId}/status`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        timeout: 10000,
      });

      return {
        status: data.status || 'UNKNOWN',
        dspStatuses: data.dsp_statuses || [],
        lastUpdated: new Date(data.updated_at || Date.now()),
      };
    } catch (err) {
      logger.error(`[PartnerProvider] Error en getStatus: ${err.message}`);
      return { status: 'ERROR', dspStatuses: [], lastUpdated: new Date() };
    }
  }

  async takedown(deliveryId, reason = 'Artist request') {
    if (!this.configured) {
      return { success: false, error: 'Partner no configurado' };
    }

    try {
      const axios = require('axios');
      const { data } = await axios.post(
        `${this.apiUrl}/releases/${deliveryId}/takedown`,
        { reason },
        { headers: { Authorization: `Bearer ${this.apiKey}` }, timeout: 15000 }
      );

      return {
        success: true,
        takedownId: data.takedown_id || `TAKEDOWN-${deliveryId}`,
      };
    } catch (err) {
      logger.error(`[PartnerProvider] Error en takedown: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async healthCheck() {
    if (!this.configured) return { healthy: false, latencyMs: 0 };
    const start = Date.now();
    try {
      const axios = require('axios');
      await axios.get(`${this.apiUrl}/health`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        timeout: 5000,
      });
      return { healthy: true, latencyMs: Date.now() - start };
    } catch {
      return { healthy: false, latencyMs: Date.now() - start };
    }
  }
}

module.exports = PartnerProvider;
