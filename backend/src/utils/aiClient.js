const { GoogleGenerativeAI } = require('@google/generative-ai');
const { OpenAI } = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const logger = require('./logger');

// Inicializar Gemini (Principal Gratuito/Balanceado)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Inicializar Claude (Premium A&R)
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

// Inicializar LMStudio (Fallback Local Zero-Cost)
const useLocalModel = process.env.USE_LOCAL_AI === 'true';
const localAI = new OpenAI({
  baseURL: process.env.LM_STUDIO_URL || 'http://localhost:1234/v1',
  apiKey: 'lm-studio',
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
  // 1. Intentar usar CLAUDE (Premium) si está configurado
  if (anthropic) {
    try {
      return await generateClaudeContent(systemPrompt, message, history);
    } catch (err) {
      logger.warn(`[aiClient] Error en Claude: ${err.message}. Intentando fallback a Gemini...`);
    }
  }

  // 2. Intentar usar Gemini (Cloud Balanceado)
  if (genAI) {
    try {
      return await generateGeminiContent(systemPrompt, message, history);
    } catch (err) {
      logger.warn(`[aiClient] Error en Gemini: ${err.message}. Intentando fallback a LM Studio (Local)...`);
      if (useLocalModel) {
        return await generateLocalContent(systemPrompt, message, history);
      }
      throw new Error('Claude y Gemini fallaron, y la IA Local no está configurada.');
    }
  } else if (useLocalModel) {
    // 3. Si no hay nube, intentar directo con Local
    return await generateLocalContent(systemPrompt, message, history);
  } else {
    throw new Error('No hay ningún motor de IA configurado.');
  }
}

async function generateClaudeContent(systemPrompt, message, history) {
  logger.info('[aiClient] Utilizando Anthropic Claude 3.5 Sonnet API');
  
  // Mapear historial al formato de Anthropic
  const messages = [
    ...history.map(msg => ({ role: msg.role === 'ai' ? 'assistant' : 'user', content: msg.text })),
    { role: 'user', content: message }
  ];

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages,
  });

  const outputText = response.content[0].text;

  try {
    const prisma = require('./prisma');
    await prisma.auditLog.create({
      data: {
        userId: 'SYSTEM',
        action: 'AI_FEEDBACK_LOOP',
        details: JSON.stringify({
          model: 'CLAUDE_3_5_SONNET',
          inputLength: message.length,
          outputSnippet: outputText.substring(0, 100),
          timestamp: new Date().toISOString()
        })
      }
    });
  } catch (logErr) {
    logger.warn(`[aiClient] Error en telemetría Claude: ${logErr.message}`);
  }

  return outputText;
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

/**
 * Extrae y parsea JSON de la respuesta de un LLM (maneja bloques markdown)
 */
function extractJson(text) {
  try {
    // Si ya es un objeto JSON, retornarlo
    if (typeof text !== 'string') return text;
    
    let cleanText = text.trim();
    // Eliminar bloques markdown (```json y ```)
    if (cleanText.startsWith('```')) {
      const firstNewLine = cleanText.indexOf('\n');
      const lastTick = cleanText.lastIndexOf('```');
      if (firstNewLine !== -1 && lastTick !== -1 && lastTick > firstNewLine) {
        cleanText = cleanText.substring(firstNewLine + 1, lastTick).trim();
      }
    }
    
    // Buscar la primera '{' o '[' y la última '}' o ']'
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');
    let startIdx = -1;
    let endIdx = -1;
    let isArray = false;

    if (firstBrace !== -1 && firstBracket !== -1) {
      startIdx = Math.min(firstBrace, firstBracket);
      isArray = startIdx === firstBracket;
    } else if (firstBrace !== -1) {
      startIdx = firstBrace;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      isArray = true;
    }

    if (startIdx !== -1) {
      endIdx = isArray ? cleanText.lastIndexOf(']') : cleanText.lastIndexOf('}');
      if (endIdx !== -1 && endIdx > startIdx) {
        cleanText = cleanText.substring(startIdx, endIdx + 1);
      }
    }

    return JSON.parse(cleanText);
  } catch (err) {
    logger.error(`[aiClient] JSON Extract Error: ${err.message}. Original text: ${text.substring(0, 100)}...`);
    throw new Error('No se pudo parsear el JSON de la respuesta de la IA.');
  }
}

module.exports = {
  generateAIContent,
  generateSingleContent,
  useLocalModel,
  extractJson
};
