/**
 * deezerCollector.js
 * Deezer API pública — sin autenticación, 100% gratuita
 * Docs: https://developers.deezer.com/api
 */

const axios = require('axios');

const DEEZER_BASE = 'https://api.deezer.com';

// Rate limiting suave — Deezer bloquea en ~50 req/s
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Busca un artista por nombre y devuelve el mejor match
 */
async function searchArtist(name) {
  try {
    const res = await axios.get(`${DEEZER_BASE}/search/artist`, {
      params: { q: name, limit: 5 },
      timeout: 8000,
    });

    const items = res.data?.data || [];
    if (items.length === 0) return null;

    // Elegir el que tenga nombre más parecido (case insensitive)
    const exact = items.find(a =>
      a.name.toLowerCase() === name.toLowerCase()
    );
    return exact || items[0];
  } catch (err) {
    console.warn(`[Deezer] searchArtist error for "${name}":`, err.message);
    return null;
  }
}

/**
 * Obtiene métricas completas de un artista en Deezer por su ID
 */
async function getArtistMetrics(deezerArtistId) {
  try {
    const [artistRes, albumsRes, topTracksRes] = await Promise.allSettled([
      axios.get(`${DEEZER_BASE}/artist/${deezerArtistId}`, { timeout: 8000 }),
      axios.get(`${DEEZER_BASE}/artist/${deezerArtistId}/albums`, {
        params: { limit: 10 },
        timeout: 8000,
      }),
      axios.get(`${DEEZER_BASE}/artist/${deezerArtistId}/top`, {
        params: { limit: 5 },
        timeout: 8000,
      }),
    ]);

    const artist = artistRes.status === 'fulfilled' ? artistRes.value.data : {};
    const albums = albumsRes.status === 'fulfilled' ? albumsRes.value.data : {};
    const topTracks = topTracksRes.status === 'fulfilled' ? topTracksRes.value.data : {};

    return {
      deezerArtistId: String(deezerArtistId),
      fans: artist.nb_fan || 0,
      totalAlbums: albums.total || 0,
      deezerUrl: artist.link || null,
      pictureUrl: artist.picture_xl || artist.picture_big || null,
      topTracks: (topTracks.data || []).map(t => ({
        name: t.title,
        rank: t.rank,
        duration: t.duration,
        previewUrl: t.preview,
        albumTitle: t.album?.title,
        albumCover: t.album?.cover_medium,
      })),
    };
  } catch (err) {
    console.warn(`[Deezer] getArtistMetrics error for ID ${deezerArtistId}:`, err.message);
    return { fans: 0, totalAlbums: 0, topTracks: [] };
  }
}

/**
 * Pipeline completo: buscar artista + obtener métricas
 * Usa cache interna de deezerArtistId en la BD para no re-buscar
 */
async function syncArtistDeezer(stageName, cachedDeezerArtistId = null) {
  let deezerArtistId = cachedDeezerArtistId;

  if (!deezerArtistId) {
    const found = await searchArtist(stageName);
    if (!found) return null;
    deezerArtistId = found.id;
    await sleep(200); // Rate limiting
  }

  const metrics = await getArtistMetrics(deezerArtistId);
  return metrics;
}

module.exports = { searchArtist, getArtistMetrics, syncArtistDeezer };
