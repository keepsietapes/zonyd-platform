const axios = require('axios');
const querystring = require('querystring');
const { supabase } = require('../utils/supabase');
const prisma = require('../utils/prisma');

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

/**
 * Inicia el flujo de autenticación de Spotify
 */
exports.login = (req, res) => {
  const scope = 'user-read-private user-read-email user-library-read playlist-read-private';
  
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }));
};

/**
 * Callback de Spotify - Intercambia código por token
 */
exports.callback = async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        grant_type: 'authorization_code'
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'))
      }
    });

    const { access_token, refresh_token, expires_in } = response.data;

    // Obtener información del perfil del usuario en Spotify
    const userProfileResponse = await axios({
      method: 'get',
      url: 'https://api.spotify.com/v1/me',
      headers: { 'Authorization': 'Bearer ' + access_token }
    });

    const spotifyData = userProfileResponse.data;
    const spotifyUrl = spotifyData.external_urls.spotify;
    const spotifyName = spotifyData.display_name;

    // Actualizar el perfil del artista en nuestra DB
    // Nota: Usamos el ID de usuario de la sesión actual (que viene en el middleware si estuviéramos en una ruta protegida)
    // Pero como es un callback de OAuth, normalmente se usa un 'state' para recuperar al usuario.
    // Por simplicidad en esta fase, asumimos que el usuario master es el que está conectando.
    await prisma.artist.updateMany({
      where: { user: { email: 'rztk82sucio@gmail.com' } },
      data: { 
        spotifyUrl: spotifyUrl,
        stageName: spotifyName // Opcional: sincronizar nombre
      }
    });

    console.log(`✅ Spotify vinculado para ${spotifyName}: ${spotifyUrl}`);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard/settings?spotify=success&artist=${encodeURIComponent(spotifyName)}`);
    
  } catch (error) {
    console.error('Error Spotify Callback:', error.response?.data || error.message);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard/settings?spotify=error`);
  }
};

/**
 * Obtiene analíticas básicas del perfil
 */
exports.getStats = async (req, res) => {
    // Implementar lógica de fetch de analíticas usando el access_token guardado
    res.json({ message: "Módulo de analíticas Spotify preparado" });
};
