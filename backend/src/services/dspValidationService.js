const logger = require('../utils/logger');

/**
 * Servicio para validar si un lanzamiento cumple con los requisitos técnicos
 * de los principales DSPs (Spotify, Apple Music, Deezer, etc.)
 */
const validateForDistribution = async (release) => {
  const errors = [];

  // 1. Validación de Tracks
  if (!release.tracks || release.tracks.length === 0) {
    errors.push('El lanzamiento debe tener al menos una pista (track).');
  }

  // 2. Validación de Metadatos de Tracks
  release.tracks?.forEach((track, index) => {
    if (!track.isrc) {
      errors.push(`Track ${index + 1}: Falta el código ISRC.`);
    } else {
      const isrcRegex = /^[A-Z]{2}-[A-Z0-9]{3}-\d{2}-\d{5}$/;
      if (!isrcRegex.test(track.isrc)) {
        errors.push(`Track ${index + 1}: El ISRC "${track.isrc}" tiene un formato inválido (Estándar ISO 3901 requerido).`);
      }
    }

    if (track.status !== 'ready' && track.status !== 'pending') {
      errors.push(`Track ${index + 1}: El audio no ha sido procesado correctamente.`);
    }
  });

  // 3. Validación de UPC
  if (!release.upc) {
    errors.push('Falta el código UPC del lanzamiento.');
  } else if (release.upc.length < 12) {
    errors.push('El código UPC debe tener al menos 12 dígitos.');
  }

  // 4. Validación de Artwork (Simulación)
  if (!release.coverUrl) {
    errors.push('Falta la portada (Artwork) del lanzamiento.');
  }

  // 5. Ventana de Lanzamiento (Mínimo 7 días)
  const minDays = 7;
  const now = new Date();
  const releaseDate = new Date(release.releaseDate);
  const diffTime = releaseDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < minDays) {
    errors.push(`La fecha de lanzamiento debe ser al menos ${minDays} días en el futuro (Ventana mínima de procesamiento DSP).`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = { validateForDistribution };
