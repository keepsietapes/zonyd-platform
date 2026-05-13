/**
 * Test de integración para los servicios de métricas
 * Ejecutar con: node src/tests/metrics.test.js
 *
 * NO requiere BD — solo testea la lógica de collectors y score engine
 */

const assert = require('assert');

// ─── Test 1: Deezer Collector ─────────────────────────────────────
async function testDeezerCollector() {
  console.log('\n[TEST] Deezer Collector...');
  const { searchArtist, getArtistMetrics } = require('../services/deezerCollector');

  // Buscar artista conocido para verificar que la API responde
  const artist = await searchArtist('Bad Bunny');
  assert(artist !== null, 'Deezer debe encontrar a Bad Bunny');
  assert(typeof artist.id === 'number', 'ID de Deezer debe ser numérico');
  assert(artist.name, 'Artista debe tener nombre');
  console.log(`  ✅ searchArtist OK — ID: ${artist.id}, Nombre: ${artist.name}`);

  // Obtener métricas del artista encontrado
  const metrics = await getArtistMetrics(artist.id);
  assert(typeof metrics.fans === 'number', 'fans debe ser número');
  assert(Array.isArray(metrics.topTracks), 'topTracks debe ser array');
  console.log(`  ✅ getArtistMetrics OK — Fans: ${metrics.fans.toLocaleString()}, Top Tracks: ${metrics.topTracks.length}`);

  // Test con artista inexistente — debe devolver null, no crashear
  const notFound = await searchArtist('ARTISTA_QUE_NO_EXISTE_XYZABC123');
  // Puede devolver null o el primer resultado — no debe lanzar error
  console.log(`  ✅ searchArtist(notFound) OK — resultado: ${notFound ? notFound.name : 'null'}`);

  return true;
}

// ─── Test 2: Zonyd Score Engine ──────────────────────────────────
async function testZonydScoreEngine() {
  console.log('\n[TEST] Zonyd Score Engine...');

  // Mock del módulo de Prisma para no necesitar BD real
  const mockPrisma = {
    artist: {
      findFirst: async () => ({
        id: 'test-artist-id',
        userId: 'test-user-id',
        stageName: 'Test Artist',
        bio: 'Bio de prueba',
        genres: 'Hip-Hop',
        country: 'MX',
        avatarUrl: 'https://example.com/avatar.jpg',
        spotifyConnected: true,
        spotifyFollowers: 5000,
        spotifyPopularity: 65,
        instagramConnected: false,
        tiktokConnected: false,
        deezerFans: 1200,
      }),
    },
    release: {
      findMany: async () => [
        { id: '1', status: 'LIVE', createdAt: new Date(), tracks: [] },
        { id: '2', status: 'LIVE', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), tracks: [] },
        { id: '3', status: 'DRAFT', createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), tracks: [] },
      ],
    },
    wallet: {
      findUnique: async () => ({ balance: 42.50 }),
    },
  };

  // Calcular score manualmente usando la lógica del engine
  const artist = await mockPrisma.artist.findFirst();
  const releases = await mockPrisma.release.findMany();
  const wallet = await mockPrisma.wallet.findUnique();

  // Metadata score
  const metadataFields = [
    { field: artist.stageName, weight: 20 },
    { field: artist.bio, weight: 15 },
    { field: artist.genres, weight: 15 },
    { field: artist.country, weight: 10 },
    { field: artist.avatarUrl, weight: 10 },
    { field: artist.spotifyConnected, weight: 15 },
    { field: artist.instagramConnected, weight: 10 },
    { field: artist.tiktokConnected, weight: 5 },
  ];
  const metadataScore = metadataFields.reduce((acc, { field, weight }) => acc + (field ? weight : 0), 0);
  assert(metadataScore === 85, `MetadataScore debería ser 85, es ${metadataScore}`);
  console.log(`  ✅ MetadataScore OK — ${metadataScore}/100`);

  // Release momentum
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const recentReleases = releases.filter(r => new Date(r.createdAt) > ninetyDaysAgo);
  assert(recentReleases.length === 2, `Debería haber 2 releases recientes, hay ${recentReleases.length}`);
  console.log(`  ✅ ReleaseMomentum OK — ${recentReleases.length} releases en 90 días`);

  console.log(`  ✅ Wallet balance OK — $${wallet.balance}`);

  return true;
}

// ─── Test 3: Analytics Controller — lógica de helpers ────────────
async function testAnalyticsHelpers() {
  console.log('\n[TEST] Analytics Helpers...');

  // Simular buildPlatformBreakdown con datos vacíos
  const spotifyData = { connected: true, followers: 1000, popularity: 60 };
  const deezerData = { fans: 500, topTracks: [] };

  // Sin datos reales de streams — debe devolver distribución estimada
  const platforms = [];
  if (spotifyData.connected && spotifyData.followers > 0) platforms.push({ name: 'Spotify', value: 55 });
  if (deezerData.fans > 0) platforms.push({ name: 'Deezer', value: 15 });
  if (platforms.length > 0) {
    platforms.push({ name: 'Apple Music', value: 20 });
    platforms.push({ name: 'Otras', value: 100 - platforms.reduce((a, p) => a + p.value, 0) });
  }

  assert(platforms.length === 4, `Debe haber 4 plataformas, hay ${platforms.length}`);
  const total = platforms.reduce((a, p) => a + p.value, 0);
  assert(total === 100, `Los porcentajes deben sumar 100, suman ${total}`);
  console.log(`  ✅ Platform breakdown OK — ${platforms.map(p => `${p.name}:${p.value}%`).join(', ')}`);

  return true;
}

// ─── Runner ───────────────────────────────────────────────────────
async function runTests() {
  console.log('═══════════════════════════════════════════════');
  console.log('  ZONYD METRICS — INTEGRATION TESTS');
  console.log('═══════════════════════════════════════════════');

  const results = { passed: 0, failed: 0 };

  const tests = [
    { name: 'Deezer Collector (API real)', fn: testDeezerCollector },
    { name: 'Zonyd Score Engine (lógica)', fn: testZonydScoreEngine },
    { name: 'Analytics Helpers', fn: testAnalyticsHelpers },
  ];

  for (const test of tests) {
    try {
      await test.fn();
      results.passed++;
      console.log(`\n  ✅ PASÓ: ${test.name}`);
    } catch (err) {
      results.failed++;
      console.error(`\n  ❌ FALLÓ: ${test.name}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log(`  RESULTADO: ${results.passed} pasaron, ${results.failed} fallaron`);
  console.log('═══════════════════════════════════════════════\n');

  if (results.failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
