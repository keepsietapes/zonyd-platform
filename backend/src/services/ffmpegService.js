const ffmpeg = require('fluent-ffmpeg');

function processAudio(inputPath, fileId) {
  const flacPath = `generated/flac/${fileId}.flac`;
  const aacPath = `generated/aac/${fileId}.aac`;
  const mp3Path = `generated/mp3/${fileId}.mp3`;

  return new Promise((resolve, reject) => {
    // 1. FLAC con Normalización LUFS
    ffmpeg(inputPath)
      .audioFilters('loudnorm=I=-14:LRA=11:TP=-1')
      .audioCodec('flac')
      .save(flacPath)
      .on('end', () => {
        // 2. AAC
        ffmpeg(flacPath).audioCodec('aac').audioBitrate('256k').save(aacPath)
        .on('end', () => {
          // 3. MP3
          ffmpeg(flacPath).audioCodec('libmp3lame').audioBitrate('320k').save(mp3Path)
          .on('end', () => resolve({ flacPath, aacPath, mp3Path }))
          .on('error', reject);
        }).on('error', reject);
      }).on('error', reject);
  });
}
module.exports = { processAudio };
