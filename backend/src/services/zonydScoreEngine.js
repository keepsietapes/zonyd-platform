/**
 * zonydScoreEngine.js
 * Motor de métricas propietarias de Zonyd
 * No requiere ninguna API externa — 100% datos internos
 */

const prisma = require('../utils/prisma');

/**
 * Calcula el Zonyd Artist Score y sus componentes
 * para un userId dado
 */
async function calculateZonydScore(userId) {
  const [artist, releases, wallet] = await Promise.all([
    prisma.artist.findFirst({ where: { userId } }),
    prisma.release.findMany({
      where: { artist: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.wallet.findUnique({ where: { userId } }),
  ]);

  if (!artist) {
    return {
      artistScore: 0,
      breakdown: {
        releaseMomentum: 0,
        metadataScore: 0,
        distributionReach: 0,
        profileStrength: 0,
        revenueActivity: 0,
      },
      insights: ['Completa tu perfil de artista para comenzar.'],
    };
  }

  // ── 1. Release Momentum (0-100) ────────────────────────────────
  // Cuántos lanzamientos en los últimos 90 días
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const recentReleases = releases.filter(r => new Date(r.createdAt) > ninetyDaysAgo);
  const liveReleases = releases.filter(r => r.status === 'LIVE');
  const releaseMomentum = Math.min(100, recentReleases.length * 30 + liveReleases.length * 10);

  // ── 2. Metadata Score (0-100) ──────────────────────────────────
  // Perfil completo = mayor probabilidad de descubrimiento
  const metadataFields = [
    { field: artist.stageName,         weight: 20 },
    { field: artist.bio,               weight: 15 },
    { field: artist.genres,            weight: 15 },
    { field: artist.country,           weight: 10 },
    { field: artist.avatarUrl,         weight: 10 },
    { field: artist.spotifyConnected,  weight: 15 },
    { field: artist.instagramConnected, weight: 10 },
    { field: artist.tiktokConnected,   weight: 5  },
  ];
  const metadataScore = metadataFields.reduce(
    (acc, { field, weight }) => acc + (field ? weight : 0),
    0
  );

  // ── 3. Distribution Reach (0-100) ─────────────────────────────
  // Cuántas tiendas reciben música activa
  const distributionReach = Math.min(100, liveReleases.length * 25);

  // ── 4. Profile Strength (0-100) ───────────────────────────────
  // Combinación de conexiones sociales y followers
  let profileStrength = 0;
  if (artist.spotifyConnected) profileStrength += 35;
  if (artist.spotifyFollowers > 0) profileStrength += Math.min(25, Math.floor(Math.log10(artist.spotifyFollowers + 1) * 8));
  if (artist.instagramConnected) profileStrength += 25;
  if (artist.deezerFans > 0) profileStrength += Math.min(15, Math.floor(Math.log10(artist.deezerFans + 1) * 5));
  profileStrength = Math.min(100, profileStrength);

  // ── 5. Revenue Activity (0-100) ───────────────────────────────
  const balance = wallet?.balance || 0;
  const revenueActivity = balance > 0 ? Math.min(100, Math.floor(Math.log10(balance + 1) * 25)) : 0;

  // ── Score Final (promedio ponderado) ──────────────────────────
  const artistScore = Math.round(
    releaseMomentum   * 0.25 +
    metadataScore     * 0.25 +
    distributionReach * 0.20 +
    profileStrength   * 0.20 +
    revenueActivity   * 0.10
  );

  // ── Insights automáticos (consejos contextuales) ──────────────
  const insights = generateInsights({
    artist, recentReleases, liveReleases,
    releaseMomentum, metadataScore, profileStrength,
  });

  return {
    artistScore,
    breakdown: {
      releaseMomentum,
      metadataScore,
      distributionReach,
      profileStrength,
      revenueActivity,
    },
    insights,
    // Datos crudos para el dashboard
    raw: {
      totalReleases: releases.length,
      liveReleases: liveReleases.length,
      recentReleases: recentReleases.length,
      spotifyFollowers: artist.spotifyFollowers,
      deezerFans: artist.deezerFans,
      walletBalance: balance,
    },
  };
}

/**
 * Genera hasta 3 insights accionables basados en el estado actual
 */
function generateInsights({ artist, recentReleases, liveReleases, releaseMomentum, metadataScore, profileStrength }) {
  const tips = [];

  if (!artist.spotifyConnected) {
    tips.push('🎵 Conecta Spotify for Artists en Configuración para desbloquear métricas de followers y popularidad.');
  }
  if (!artist.bio) {
    tips.push('📝 Agrega una bio a tu perfil. Aumenta tu probabilidad de ser descubierto en playlists editoriales.');
  }
  if (!artist.genres) {
    tips.push('🎸 Define tus géneros musicales para mejorar tu Discovery Rate en algoritmos de DSPs.');
  }
  if (liveReleases.length === 0) {
    tips.push('🚀 Distribuye tu primer lanzamiento para comenzar a generar métricas reales.');
  } else if (recentReleases.length === 0) {
    tips.push('📅 No has lanzado música en 90 días. La consistencia es clave para el momentum algorítmico.');
  }
  if (!artist.instagramConnected) {
    tips.push('📸 Conecta Instagram para que el AI analice tu engagement social.');
  }

  return tips.slice(0, 3);
}

module.exports = { calculateZonydScore };
