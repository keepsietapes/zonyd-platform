const prisma = require('../utils/prisma');
const { sendWelcomeEmail, sendValidationSuccessEmail } = require('../services/emailService');

async function createOrUpdateArtist(req, res) {
  const { id, stageName, spotifyUrl, appleMusicUrl } = req.body;
  try {
    // 1. Garantizar que el usuario exista
    await prisma.user.upsert({
      where: { id: req.user.id },
      update: {},
      create: {
        id: req.user.id,
        email: req.user.email,
        role: 'LABEL'
      }
    });

    let artist;
    if (id) {
      // Actualizar existente
      artist = await prisma.artist.update({
        where: { id },
        data: { stageName, spotifyUrl, appleMusicUrl }
      });
    } else {
      // Crear nuevo perfil
      artist = await prisma.artist.create({
        data: {
          userId: req.user.id,
          stageName,
          spotifyUrl,
          appleMusicUrl
        }
      });
    }
    
    res.json(artist);
  } catch (error) {
    console.error('ERROR EN ARTIST CONTROLLER:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getArtistProfile(req, res) {
  try {
    const artists = await prisma.artist.findMany({
      where: { userId: req.user.id }
    });
    res.json(artists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function verifyArtistEmail(req, res) {
  const { email } = req.query;
  try {
    // 1. Buscamos al artista a través de su relación con User
    const artist = await prisma.artist.findFirst({
      where: { 
        user: { email: email } 
      }
    });
    
    console.log(`✅ Verificando cuenta para: ${email}`);
    
    // 2. 📧 Enviar correo de bienvenida breve con servicios y planes (n8n)
    // Solo enviamos si el email existe
    if (email) {
      await sendValidationSuccessEmail(email, artist?.stageName || 'Artista');
    }
    
    res.json({ status: 'success', message: 'Cuenta validada y correo de bienvenida enviado' });
  } catch (error) {
    console.error('ERROR EN VERIFICACIÓN:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { createOrUpdateArtist, getArtistProfile, verifyArtistEmail };
