const logger = require('./logger');

/**
 * Motor de moderación y anti-fraude de Zonyd.
 * Valida metadatos para cumplir con estándares de DSPs y prevenir spam.
 */
const validateMetadata = (text, type = 'title') => {
  if (!text) return { valid: true };

  const lowerText = text.toLowerCase();
  
  // 1. Detección de Emojis y Caracteres Especiales Prohibidos (Prompt 5.1)
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(text)) {
    return { 
      valid: false, 
      reason: 'Los títulos no pueden contener emojis según las políticas de Spotify y Apple Music.' 
    };
  }

  // 2. Detección de Palabras Clave de Spam (Clickbait)
  const forbiddenKeywords = [
    'official audio', 'video oficial', 'hq', 'high quality', 
    'original mix', 'best song', 'free download', 'out now'
  ];
  
  for (const word of forbiddenKeywords) {
    if (lowerText.includes(word)) {
      return { 
        valid: false, 
        reason: `El título contiene texto redundante o promocional prohibido: "${word}".` 
      };
    }
  }

  // 3. Validación de Gritos (Todo en Mayúsculas)
  if (text === text.toUpperCase() && text.length > 4) {
    return { 
      valid: false, 
      reason: 'El título no puede estar completamente en mayúsculas (estilo grito).' 
    };
  }

  return { valid: true };
};

module.exports = { validateMetadata };
