const mm = require('music-metadata');

async function extractMetadata(filePath) {
  const metadata = await mm.parseFile(filePath);
  return {
    duration: metadata.format.duration,
    bitrate: metadata.format.bitrate,
    sampleRate: metadata.format.sampleRate,
    codec: metadata.format.codec,
  };
}
module.exports = { extractMetadata };
