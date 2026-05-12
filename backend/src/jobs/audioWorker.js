const { Worker } = require('bullmq');
const { connection } = require('./audioQueue');
const { processAudio } = require('../services/ffmpegService');
const prisma = require('../utils/prisma');
const fs = require('fs');
const { supabase } = require('../utils/supabase');

const worker = new Worker('audio-processing', async job => {
  console.log(`Procesando job ${job.id} para track ${job.data.trackId}...`);
  
  try {
    // Procesar audio directamente desde la URL de Supabase
    const paths = await processAudio(job.data.audioUrl, job.data.trackId);
    
    // Subir versiones procesadas a Supabase
    const uploadToSupabase = async (localPath, destinationPath) => {
      const fileBuffer = fs.readFileSync(localPath);
      const { error } = await supabase.storage.from('releases').upload(destinationPath, fileBuffer, {
        upsert: true,
        contentType: 'audio/mpeg'
      });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('releases').getPublicUrl(destinationPath);
      return publicUrl;
    };

    const flacUrl = await uploadToSupabase(paths.flacPath, `${job.id}/processed/${job.data.trackId}.flac`);
    const aacUrl = await uploadToSupabase(paths.aacPath, `${job.id}/processed/${job.data.trackId}.aac`);
    const mp3Url = await uploadToSupabase(paths.mp3Path, `${job.id}/processed/${job.data.trackId}.mp3`);

    // Limpiar archivos locales generados por ffmpeg
    if (fs.existsSync(paths.flacPath)) fs.unlinkSync(paths.flacPath);
    if (fs.existsSync(paths.aacPath)) fs.unlinkSync(paths.aacPath);
    if (fs.existsSync(paths.mp3Path)) fs.unlinkSync(paths.mp3Path);

    await prisma.track.update({
      where: { id: job.data.trackId },
      data: {
        flacPath: flacUrl,
        aacPath: aacUrl,
        mp3Path: mp3Url,
        status: 'ready'
      }
    });

    console.log(`Job ${job.id} completado con éxito. Track ${job.data.trackId} listo.`);
  } catch (error) {
    console.error(`Error en job ${job.id}:`, error);
    throw error;
  }
}, { connection });

worker.on('failed', (job, err) => {
  console.error(`El job ${job.id} ha fallado con el error: ${err.message}`);
});

module.exports = worker;
