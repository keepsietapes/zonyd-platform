const express = require('express');
const router = express.Router();
const multer = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadTrack } = require('../controllers/uploadController');

const validate = require('../middleware/validate');
const { trackSchema } = require('../schemas/musicSchemas');

router.post('/', authMiddleware, multer.single('audio'), validate(trackSchema), uploadTrack);

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
