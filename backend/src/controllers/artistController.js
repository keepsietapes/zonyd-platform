const prisma = require('../utils/prisma');
const { sendWelcomeEmail, sendValidationSuccessEmail } = require('../services/emailService');

async function createOrUpdateArtist(req, res) {
  const { id, stageName, spotifyUrl, appleMusicUrl, bio, genres, country, instagramUrl, tiktokUrl } = req.body;
  try {
    // Garantizar que el usuario exista en la BD pública, buscando por email para evitar conflictos si el UUID cambió
    const dbUser = await prisma.user.upsert({
      where: { email: req.user.email },
      update: {},
      create: {
        id: req.user.id,
        email: req.user.email,
        role: 'ARTIST'
      }
    });

    let artist;
    if (id) {
      // Actualizar perfil existente por ID
      artist = await prisma.artist.update({
        where: { id },
        data: {
          ...(stageName !== undefined && { stageName }),
          ...(bio !== undefined && { bio }),
          ...(genres !== undefined && { genres }),
          ...(country !== undefined && { country }),
          ...(spotifyUrl !== undefined && { spotifyUrl }),
          ...(appleMusicUrl !== undefined && { appleMusicUrl }),
          ...(instagramUrl !== undefined && { instagramUrl }),
          ...(tiktokUrl !== undefined && { tiktokUrl }),
        }
      });
    } else {
      // Buscar si ya existe un perfil para este usuario
      const existing = await prisma.artist.findFirst({
        where: { userId: dbUser.id }
      });

      if (existing) {
        artist = await prisma.artist.update({
          where: { id: existing.id },
          data: {
            ...(stageName !== undefined && { stageName }),
            ...(bio !== undefined && { bio }),
            ...(genres !== undefined && { genres }),
            ...(country !== undefined && { country }),
            ...(spotifyUrl !== undefined && { spotifyUrl }),
            ...(appleMusicUrl !== undefined && { appleMusicUrl }),
            ...(instagramUrl !== undefined && { instagramUrl }),
            ...(tiktokUrl !== undefined && { tiktokUrl }),
          }
        });
      } else {
        // Crear nuevo perfil
        artist = await prisma.artist.create({
          data: {
            userId: dbUser.id,
            stageName: stageName || 'Artista',
            bio,
            genres,
            country,
            spotifyUrl,
            appleMusicUrl,
            instagramUrl,
            tiktokUrl,
          }
        });
      }
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
      where: { email: req.user.email },
      include: {
        artistProfiles: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const artist = user.artistProfiles[0] || null;

    // Devolver estado real de conexiones OAuth
    // spotifyConnected es true solo si existe un token OAuth almacenado en la BD
    // Por ahora se infiere de la presencia de spotifyUrl hasta implementar OAuth completo
    const spotifyConnected = !!(artist?.spotifyUrl && artist.spotifyUrl.startsWith('https://open.spotify.com'));
    const instagramConnected = !!(artist?.instagramUrl);
    const tiktokConnected = !!(artist?.tiktokUrl);

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.firstName || artist?.stageName || '',
      plan: artist?.plan || 'FREE',
      artistProfiles: user.artistProfiles,
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
