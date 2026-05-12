const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Función para sanitizar el nombre del archivo
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^\w.-]/g, '_') // Reemplaza caracteres especiales por guiones bajos
    .replace(/\.\./g, '');    // Previene Path Traversal
};

const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-wav', 'audio/mp3', 
    'audio/ogg', 'audio/m4a', 'audio/x-m4a', 'audio/mp4'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.ogg'];

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Formato ${file.mimetype} no soportado. Use WAV, FLAC o MP3.`), false);
  }
};

module.exports = multer({ 
  storage, 
  limits: { 
    fileSize: 500 * 1024 * 1024, // 500MB para masters de alta calidad
    files: 1 
  }, 
  fileFilter 
});
