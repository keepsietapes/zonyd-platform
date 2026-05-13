const axios = require('axios');
const prisma = require('../utils/prisma');

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

// Scopes que solicitamos — lo mínimo necesario para métricas de artista
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-follow-read',
  'user-read-recently-played',
].join(' ');

// ─────────────────────────────────────────────────────────────────
// 1. Iniciar flujo OAuth — redirigir al login de Spotify
// ─────────────────────────────────────────────────────────────────
exports.login = (req, res) => {
  // El userId viene del JWT si el usuario ya está logueado
  const state = req.user?.id || 'anon';

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: SCOPES,
    state,
    show_dialog: 'false',
  });

  res.redirect(`${SPOTIFY_AUTH_URL}?${params}`);
};

// ─────────────────────────────────────────────────────────────────
// 2. Callback OAuth — recibir code, intercambiar por tokens, guardar
// ─────────────────────────────────────────────────────────────────
exports.callback = async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error('Spotify OAuth error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard/settings?spotify=denied`);
  }

  try {
    // Intercambiar code por tokens
    const tokenRes = await axios.post(
      SPOTIFY_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;
    const tokenExpiry = new Date(Date.now() + expires_in * 1000);

    // Obtener perfil del usuario autenticado en Spotify
    const profileRes = await axios.get(`${SPOTIFY_API_URL}/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const spotifyProfile = profileRes.data;

    // Si el artista tiene un Spotify for Artists ID, buscarlo también
    let artistData = {};
    try {
      // Buscar el perfil de artista por el ID de usuario
      const searchRes = await axios.get(`${SPOTIFY_API_URL}/search`, {
        params: { q: spotifyProfile.display_name, type: 'artist', limit: 1 },
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const foundArtist = searchRes.data.artists?.items?.[0];
      if (foundArtist) {
        artistData = {
          spotifyUserId: foundArtist.id,
          spotifyFollowers: foundArtist.followers?.total || 0,
          spotifyPopularity: foundArtist.popularity || 0,
          spotifyUrl: foundArtist.external_urls?.spotify || spotifyProfile.external_urls?.spotify,
        };
      }
    } catch (searchErr) {
      // No bloquear el flow si el search falla
      artistData = {
        spotifyUserId: spotifyProfile.id,
        spotifyFollowers: spotifyProfile.followers?.total || 0,
        spotifyUrl: spotifyProfile.external_urls?.spotify,
      };
    }

    // Guardar en la BD si tenemos un userId
    if (state && state !== 'anon') {
      const updated = await prisma.artist.updateMany({
        where: { userId: state },
        data: {
          spotifyConnected: true,
          spotifyAccessToken: access_token,
          spotifyRefreshToken: refresh_token,
          spotifyTokenExpiry: tokenExpiry,
          ...artistData,
        },
      });

      if (updated.count === 0) {
        console.warn(`No artist found for userId ${state} — token not saved`);
      }
    }

    res.redirect(`${process.env.FRONTEND_URL}/dashboard/settings?spotify=connected`);
  } catch (err) {
    console.error('Spotify callback error:', err.response?.data || err.message);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/settings?spotify=error`);
  }
};

// ─────────────────────────────────────────────────────────────────
// 3. Obtener estadísticas del artista conectado (ruta protegida)
// ─────────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const artist = await prisma.artist.findFirst({
      where: { userId: req.user.id },
    });

    if (!artist) {
      return res.status(404).json({ error: 'Perfil de artista no encontrado' });
    }

    if (!artist.spotifyConnected || !artist.spotifyAccessToken) {
      return res.json({
        connected: false,
        followers: 0,
        popularity: 0,
        topTracks: [],
        message: 'Spotify no conectado. Ve a Configuración para vincularlo.',
      });
    }

    // Refrescar token si expiró
    let accessToken = artist.spotifyAccessToken;
    if (artist.spotifyTokenExpiry && new Date() > new Date(artist.spotifyTokenExpiry)) {
      accessToken = await refreshSpotifyToken(artist, req.user.id);
    }

    // Fetch paralelo para minimizar latencia
    const [topTracksRes, recentlyPlayedRes] = await Promise.allSettled([
      axios.get(`${SPOTIFY_API_URL}/me/top/tracks?limit=5&time_range=short_term`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      axios.get(`${SPOTIFY_API_URL}/me/player/recently-played?limit=10`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const topTracks = topTracksRes.status === 'fulfilled'
      ? topTracksRes.value.data.items.map(t => ({
          name: t.name,
          popularity: t.popularity,
          previewUrl: t.preview_url,
          albumCover: t.album?.images?.[0]?.url,
        }))
      : [];

    // Actualizar followers en la BD (cache)
    await prisma.artist.updateMany({
      where: { userId: req.user.id },
      data: {
        spotifyFollowers: artist.spotifyFollowers, // se actualiza en sincronización periódica
      },
    });

    res.json({
      connected: true,
      followers: artist.spotifyFollowers,
      popularity: artist.spotifyPopularity,
      topTracks,
      spotifyUrl: artist.spotifyUrl,
    });
  } catch (err) {
    console.error('Spotify getStats error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error obteniendo estadísticas de Spotify' });
  }
};

// ─────────────────────────────────────────────────────────────────
// 4. Sincronización periódica del perfil (llamada por cron/worker)
// ─────────────────────────────────────────────────────────────────
exports.syncProfile = async (artistId) => {
  try {
    const artist = await prisma.artist.findUnique({ where: { id: artistId } });
    if (!artist?.spotifyConnected || !artist.spotifyAccessToken) return;

    let accessToken = artist.spotifyAccessToken;
    if (artist.spotifyTokenExpiry && new Date() > new Date(artist.spotifyTokenExpiry)) {
      accessToken = await refreshSpotifyToken(artist, artist.userId);
    }

    if (!artist.spotifyUserId) return;

    const artistRes = await axios.get(`${SPOTIFY_API_URL}/artists/${artist.spotifyUserId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    await prisma.artist.update({
      where: { id: artistId },
      data: {
        spotifyFollowers: artistRes.data.followers?.total || 0,
        spotifyPopularity: artistRes.data.popularity || 0,
      },
    });
  } catch (err) {
    console.error(`Spotify sync error for artist ${artistId}:`, err.message);
  }
};

// ─────────────────────────────────────────────────────────────────
// Utilidad: Refrescar access token de Spotify
// ─────────────────────────────────────────────────────────────────
async function refreshSpotifyToken(artist, userId) {
  const res = await axios.post(
    SPOTIFY_TOKEN_URL,
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: artist.spotifyRefreshToken,
    }),
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const { access_token, expires_in } = res.data;
  const tokenExpiry = new Date(Date.now() + expires_in * 1000);

  await prisma.artist.updateMany({
    where: { userId },
    data: { spotifyAccessToken: access_token, spotifyTokenExpiry: tokenExpiry },
  });

  return access_token;
}
