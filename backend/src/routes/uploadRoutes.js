const express = require('express');
const router = express.Router();
const multer = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadTrack } = require('../controllers/uploadController');

const validate = require('../middleware/validate');
const { trackSchema } = require('../schemas/musicSchemas');

router.post('/', authMiddleware, multer.single('audio'), validate(trackSchema), uploadTrack);

// Nuevo endpoint para subir portadas/imágenes del artista (SmartLinks, Perfil, etc)
router.post('/image', authMiddleware, require('multer')({ storage: require('multer').memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }).single('file'), async (req, res) => {
  try {
    const { supabase } = require('../utils/supabase');
    const { v4: uuidv4 } = require('uuid');

    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo de imagen.' });
    }

    const fileExt = req.file.originalname.split('.').pop() || 'png';
    const fileName = `covers/${req.user.id}/${uuidv4()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('releases')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('releases')
      .getPublicUrl(fileName);

    res.json({ url: publicUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generar URL firmada para subida directa (Cloudflare R2 / S3)
router.get('/presigned', authMiddleware, async (req, res) => {
  try {
    const { getPresignedUploadUrl } = require('../utils/s3');
    const { fileName, contentType } = req.query;
    
    if (!fileName || !contentType) {
      return res.status(400).json({ error: 'Faltan parámetros fileName o contentType' });
    }

    const url = await getPresignedUploadUrl(fileName, contentType);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Nuevo endpoint para listar tracks sueltos
router.get('/list', async (req, res) => {
  try {
    const tracks = await prisma.track.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
