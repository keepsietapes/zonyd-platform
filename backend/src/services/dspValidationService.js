const logger = require('../utils/logger');

/**
 * DSP Validation Service — Zonyd Distribution Engine
 * 
 * Valida que un release cumple con los requisitos técnicos de los DSPs principales.
 * Estándares verificados:
 *   - Spotify Content & Metadata Policy
 *   - Apple Music Technical Requirements
 *   - DDEX ERN 4.3 mandatory fields
 *   - Amazon Music Ingestion Requirements
 * 
 * v2.0 — Agrega: territories, language, contributors, labelName, releaseType
 */
const validateForDistribution = async (release) => {
  const errors = [];
  const warnings = [];

  // ─── 1. TRACKS ──────────────────────────────────────────────────
  if (!release.tracks || release.tracks.length === 0) {
    errors.push('El lanzamiento debe tener al menos una pista (track).');
  }

  // ─── 2. METADATA DE TRACKS ──────────────────────────────────────
  release.tracks?.forEach((track, index) => {
    const trackLabel = `Track ${index + 1} ("${track.title || 'Sin título'}")`;

    // ISRC obligatorio y con formato correcto ISO 3901
    if (!track.isrc) {
      errors.push(`${trackLabel}: Falta el código ISRC.`);
    } else {
      // Formato: CC-XXX-YY-NNNNN (con o sin guiones)
      const isrcClean = track.isrc.replace(/-/g, '');
      const isrcRegex = /^[A-Z]{2}[A-Z0-9]{3}\d{2}\d{5}$/;
      if (!isrcRegex.test(isrcClean)) {
        errors.push(`${trackLabel}: ISRC inválido "${track.isrc}". Formato requerido: CC-XXX-YY-NNNNN (ISO 3901).`);
      }
    }

    // Estado de audio
    if (track.status !== 'ready' && track.status !== 'pending') {
      errors.push(`${trackLabel}: El audio no ha sido procesado (estado: ${track.status}).`);
    }

    // URL de audio
    if (!track.audioUrl && !track.flacPath && !track.aacPath) {
      errors.push(`${trackLabel}: No hay URL de audio disponible.`);
    }

    // Título del track
    if (!track.title || track.title.trim().length < 1) {
      errors.push(`${trackLabel}: El título es requerido.`);
    }
    if (track.title && track.title.length > 250) {
      errors.push(`${trackLabel}: El título excede 250 caracteres (límite Apple Music).`);
    }

    // Duración (Apple Music requiere al menos 30 segundos, Spotify 30 segundos)
    if (track.duration && track.duration < 30) {
      errors.push(`${trackLabel}: La duración mínima es 30 segundos (requerido por Spotify y Apple Music).`);
    }

    // Explicit flag — Apple Music requiere declaración explícita
    if (typeof track.explicit === 'undefined' || track.explicit === null) {
      warnings.push(`${trackLabel}: El campo 'explicit' no está definido. Se asumirá NotExplicit.`);
    }
  });

  // ─── 3. UPC / BARCODE ───────────────────────────────────────────
  if (!release.upc) {
    errors.push('Falta el código UPC/EAN del lanzamiento.');
  } else {
    const upcClean = release.upc.replace(/\s/g, '');
    if (!/^\d{12,13}$/.test(upcClean)) {
      errors.push(`UPC inválido: "${release.upc}". Debe tener 12-13 dígitos numéricos.`);
    }
  }

  // ─── 4. ARTWORK / PORTADA ───────────────────────────────────────
  if (!release.coverUrl) {
    errors.push('Falta la portada (Artwork) del lanzamiento.');
  } else {
    // Verificar que la URL sea válida
    try {
      new URL(release.coverUrl);
    } catch {
      errors.push(`URL de portada inválida: "${release.coverUrl}".`);
    }
    // No podemos verificar dimensiones sin descargar — advertencia
    warnings.push('Verificar manualmente que el artwork sea 3000x3000px, JPG/PNG, RGB (requerido por Apple Music y Spotify).');
  }

  // ─── 5. VENTANA DE LANZAMIENTO ──────────────────────────────────
  if (release.releaseDate) {
    const minDays = 7; // Mínimo para procesamiento DSP
    const now = new Date();
    const releaseDate = new Date(release.releaseDate);
    const diffTime = releaseDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < minDays) {
      errors.push(
        `La fecha de lanzamiento debe ser al menos ${minDays} días en el futuro ` +
        `(ventana mínima de procesamiento DSP). Actual: ${diffDays} día(s).`
      );
    }
    if (diffDays > 365) {
      warnings.push(`La fecha de lanzamiento está a más de 1 año. Algunos DSPs no aceptan releases con más de 12 meses de anticipación.`);
    }
  } else {
    warnings.push('No se definió fecha de lanzamiento. Se usará la fecha actual.');
  }

  // ─── 6. ARTISTA PRIMARIO ────────────────────────────────────────
  if (!release.artist && !release.primaryArtistId) {
    errors.push('Falta el artista primario del lanzamiento.');
  }
  if (release.artist?.stageName && release.artist.stageName.length > 256) {
    errors.push('El nombre del artista excede 256 caracteres.');
  }

  // ─── 7. TÍTULO DEL RELEASE ──────────────────────────────────────
  if (!release.title || release.title.trim().length < 1) {
    errors.push('El título del lanzamiento es requerido.');
  }
  if (release.title && release.title.length > 250) {
    errors.push('El título del lanzamiento excede 250 caracteres (límite Apple Music).');
  }

  // ─── 8. GÉNERO ──────────────────────────────────────────────────
  if (!release.genre) {
    warnings.push('No se especificó género. Se asignará "Pop" por defecto.');
  }

  // ─── 9. LABEL NAME (requerido por DDEX y Apple Music) ───────────
  if (!release.labelName && !release.artist?.stageName) {
    warnings.push('No se definió nombre de sello discográfico. Se usará el nombre del artista como sello.');
  }

  // ─── 10. TERRITORIES (requerido por DDEX DealList) ───────────────
  if (!release.territories) {
    warnings.push('No se definieron territorios. Se asumirá distribución worldwide.');
  }

  // ─── 11. LANGUAGE (requerido por Apple Music) ───────────────────
  if (!release.language) {
    warnings.push('No se definió idioma principal. Se asumirá "es" (Español).');
  }

  // ─── 12. RELEASE TYPE (Single/EP/Album) ─────────────────────────
  const validTypes = ['SINGLE', 'EP', 'ALBUM', 'COMPILATION', 'MIXTAPE'];
  if (release.type && !validTypes.includes(release.type.toUpperCase())) {
    errors.push(`Tipo de release inválido: "${release.type}". Válidos: ${validTypes.join(', ')}.`);
  }

  // ─── 13. SPLITS — coherencia de porcentajes ─────────────────────
  if (release.tracks) {
    for (const track of release.tracks) {
      if (track.splits && track.splits.length > 0) {
        const totalPct = track.splits.reduce((sum, s) => sum + (s.percentage || 0), 0);
        if (Math.abs(totalPct - 100) > 0.01) {
          errors.push(
            `Track "${track.title}": Los splits de regalías no suman 100% (actual: ${totalPct.toFixed(2)}%).`
          );
        }
      }
    }
  }

  if (warnings.length > 0) {
    logger.warn(`[DSPValidation] Release ${release.id} — ${warnings.length} advertencias: ${warnings.join(' | ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - errors.length * 20 - warnings.length * 5),
  };
};

module.exports = { validateForDistribution };
