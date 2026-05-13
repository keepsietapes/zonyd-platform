const prisma = require('../utils/prisma');
const { sendWelcomeEmail, sendValidationSuccessEmail } = require('../services/emailService');

async function createOrUpdateArtist(req, res) {
  const { id, stageName, spotifyUrl, appleMusicUrl } = req.body;
  try {
    // 1. Garantizar que el usuario exista (upsert por email para evitar conflictos)
    await prisma.user.upsert({
      where: { email: req.user.email },
      update: { id: req.user.id },
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
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        artists: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const artist = user.artists[0] || null;

    // Devolver estado real de conexiones OAuth
    // spotifyConnected es true solo si existe un token OAuth almacenado en la BD
    // Por ahora se infiere de la presencia de spotifyUrl hasta implementar OAuth completo
    const spotifyConnected = !!(artist?.spotifyUrl && artist.spotifyUrl.startsWith('https://open.spotify.com'));
    const instagramConnected = !!(artist?.instagramUrl);
    const tiktokConnected = !!(artist?.tiktokUrl);

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName || artist?.stageName || '',
      plan: user.plan || 'FREE',
      artists: user.artists,
      // Estado real de conexiones para el AI Command Center
      spotifyConnected,
      instagramConnected,
      tiktokConnected,
      // Métricas de influencia (0 hasta tener datos reales de las APIs)
      metrics: {
        viralidad: 0,
        metadatos: artist ? Math.min(100, Math.round((
          (artist.stageName ? 20 : 0) +
          (artist.spotifyUrl ? 20 : 0) +
          (artist.genres ? 20 : 0) +
          (artist.bio ? 20 : 0) +
          (spotifyConnected ? 20 : 0)
        ))) : 0,
        discovery: 0,
      }
    });
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
