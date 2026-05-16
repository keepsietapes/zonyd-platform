const { GoogleGenerativeAI } = require('@google/generative-ai');
const { OpenAI } = require('openai');
const logger = require('./logger');

// Inicializar Gemini
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Inicializar LMStudio / OpenAI Compatible
const useLocalModel = process.env.USE_LOCAL_AI === 'true';
const localAI = new OpenAI({
  baseURL: process.env.LM_STUDIO_URL || 'http://localhost:1234/v1',
  apiKey: 'lm-studio', // La API key de LM Studio suele ser ignorada, pero requerida por el SDK
});

/**
 * Cliente de IA unificado.
 * Prioriza LM Studio si USE_LOCAL_AI=true en .env, de lo contrario usa Gemini.
 *
 * @param {string} prompt - El system prompt o instrucción
 * @param {string} message - El mensaje del usuario
 * @param {Array} history - Historial de chat (opcional)
 * @returns {Promise<string>} La respuesta generada
 */
async function generateAIContent(systemPrompt, message, history = []) {
  // Intentar usar Gemini (Cloud) PRIMERO para ahorrar recursos de la PC local
  if (genAI) {
    try {
      return await generateGeminiContent(systemPrompt, message, history);
    } catch (err) {
      logger.warn(`[aiClient] Error en Gemini: ${err.message}. Intentando fallback a LM Studio (Local)...`);
      if (useLocalModel) {
        return await generateLocalContent(systemPrompt, message, history);
      }
      throw new Error('Gemini falló y la IA Local no está configurada.');
    }
  } else if (useLocalModel) {
    // Si Gemini no está configurado, intentar directo con Local
    return await generateLocalContent(systemPrompt, message, history);
  } else {
    throw new Error('No hay ningún motor de IA configurado (Ni Gemini ni Local).');
  }
}

async function generateLocalContent(systemPrompt, message, history) {
  logger.info('[aiClient] Utilizando LM Studio (modelo local como respaldo)');
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(msg => ({ role: msg.role === 'ai' ? 'assistant' : 'user', content: msg.text })),
    { role: 'user', content: message }
  ];

  const response = await localAI.chat.completions.create({
    model: process.env.LOCAL_MODEL_NAME || 'local-model',
    messages,
    temperature: 0.7,
  });

  const outputText = response.choices[0].message.content;
  
  try {
    const prisma = require('./prisma');
    await prisma.auditLog.create({
      data: {
        userId: 'SYSTEM',
        action: 'AI_FEEDBACK_LOOP',
        details: JSON.stringify({
          model: 'LM_STUDIO_FALLBACK',
          inputLength: messages.length,
          outputSnippet: outputText.substring(0, 100),
          timestamp: new Date().toISOString()
        })
      }
    });
  } catch (logErr) {
    logger.warn(`[aiClient] Error en telemetría propietaria: ${logErr.message}`);
  }

  return outputText;
}

async function generateGeminiContent(systemPrompt, message, history) {
  logger.info('[aiClient] Utilizando Gemini API pública');
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  });

  const geminiHistory = history.map(msg => ({
    role: msg.role === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.text }],
  }));

  const chat = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessage(message);
  const outputText = result.response.text();

  // TELEMETRÍA PROPIETARIA (Fase 1: Recolección Silenciosa)
  try {
    const prisma = require('./prisma');
    await prisma.auditLog.create({
      data: {
        userId: 'SYSTEM',
        action: 'AI_FEEDBACK_LOOP',
        details: JSON.stringify({
          model: 'GEMINI_1_5',
          inputLength: message.length,
          outputSnippet: outputText.substring(0, 100),
          timestamp: new Date().toISOString()
        })
      }
    });
  } catch (logErr) {
    logger.warn(`[aiClient] Error en telemetría Gemini: ${logErr.message}`);
  }

  return outputText;
}

/**
 * Genera contenido de un solo tiro sin historial de chat.
 */
async function generateSingleContent(prompt) {
  // Intentar Gemini primero
  if (genAI) {
    try {
      return await generateSingleGeminiContent(prompt);
    } catch (err) {
      logger.warn(`[aiClient] Error en Gemini (Single): ${err.message}. Intentando fallback a LM Studio...`);
      if (useLocalModel) {
        return await generateSingleLocalContent(prompt);
      }
      throw new Error('Gemini falló y no hay IA local configurada.');
    }
  } else if (useLocalModel) {
    return await generateSingleLocalContent(prompt);
  } else {
    throw new Error('No hay motores IA configurados.');
  }
}

async function generateSingleLocalContent(prompt) {
  logger.info('[aiClient] Utilizando LM Studio (single content, fallback)');
  const response = await localAI.chat.completions.create({
    model: process.env.LOCAL_MODEL_NAME || 'local-model',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });
  return response.choices[0].message.content;
}

async function generateSingleGeminiContent(prompt) {
  logger.info('[aiClient] Utilizando Gemini API (single content)');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = {
  generateAIContent,
  generateSingleContent,
  useLocalModel,
};
