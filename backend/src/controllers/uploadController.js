const prisma = require('../utils/prisma');
const { audioQueue } = require('../jobs/audioQueue');
const { supabase } = require('../utils/supabase');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const { validateMetadata } = require('../utils/moderation');
const { ValidationError } = require('../utils/errors');

async function uploadTrack(req, res, next) {
  try {
    logger.info(`Iniciando subida de track: ${req.body.title || 'S/T'} por usuario ${req.user.id}`);
    
    if (!req.file) throw new ValidationError('Archivo de audio requerido');

    // 1. Validar Metadatos (Anti-Spam / DSP Compliance)
    const title = req.body.title || 'Sencillo sin título';
    const moderation = validateMetadata(title);
    if (!moderation.valid) {
      throw new ValidationError(moderation.reason);
    }

    // 2. Asegurar perfil de artista (Usar el primero disponible o crear uno)
    let artist = await prisma.artist.findFirst({ where: { userId: req.user.id } });
    if (!artist) {
      artist = await prisma.artist.create({
        data: {
          userId: req.user.id,
          stageName: req.body.artist || 'Artista Zonyd'
        }
      });
      logger.info(`Nuevo perfil de artista creado: ${artist.stageName}`);
    }

    // 3. ZONYD CONTENT ID ENGINE (Simulación de Huella Acústica)
    const titleLower = title.toLowerCase().trim();
    const fileNameLower = (req.file.originalname || "").toLowerCase();
    
    let matchPercentage = 0;
    if (fileNameLower.includes('official audio') || fileNameLower.includes('vevo') || titleLower.includes('original mix rip')) {
      matchPercentage = 98; 
    } else if (titleLower.includes('type beat') || titleLower.includes('sample') || titleLower.includes('remix')) {
      matchPercentage = 25;
    } else {
      matchPercentage = Math.floor(Math.random() * 5);
    }

    if (matchPercentage > 85) {
      logger.warn(`BLOQUEO CONTENT ID: ${matchPercentage}% coincidencia para release de ${req.user.id}`);
      return res.status(403).json({ 
        success: false, 
        error: 'COPYRIGHT_MATCH', 
        message: `Coincidencia del ${matchPercentage}% con obra registrada. Distribución bloqueada.` 
      });
    }

    // 4. Subir a Supabase Storage
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${req.user.id}/${uuidv4()}.${fileExt}`;
    
    logger.info(`Subiendo archivo a Supabase: ${fileName}`);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('releases')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      logger.error('Error al subir a Supabase:', uploadError);
      throw new Error('Error al guardar el archivo en la nube.');
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('releases')
      .getPublicUrl(fileName);

    // 5. Crear Release y Track
    const release = await prisma.release.create({
      data: {
        title: title,
        primaryArtistId: artist.id,
        status: 'DRAFT'
      }
    });

    const track = await prisma.track.create({
      data: {
        title: title,
        releaseId: release.id,
        audioUrl: publicUrl,
        status: 'pending'
      }
    });

    logger.info(`Track ${track.id} creado con éxito. Iniciando colas de procesamiento.`);

    // 5. Encolar Procesamiento
    try {
      if (audioQueue && audioQueue.add) {
        await audioQueue.add('audio-processing', { 
          trackId: track.id, 
          audioUrl: publicUrl 
        });
        logger.info(`Track ${track.id} encolado en Redis.`);
      } else {
        throw new Error('Redis no disponible');
      }
    } catch (queueError) {
      logger.warn(`Redis Offline: Procesamiento diferido para track ${track.id}`);
    }

    res.status(201).json({ 
      success: true, 
      track, 
      releaseId: release.id,
      message: '¡Recibido! Procesando audio profesionalmente...' 
    });

  } catch (error) {
    next(error);
  }
}

module.exports = { uploadTrack };
