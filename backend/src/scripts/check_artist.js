const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkArtist() {
  try {
    const artists = await prisma.artist.findMany({
      include: { user: true }
    });
    console.log('--- Perfiles de Artista ---');
    artists.forEach(a => {
        console.log(`Email: ${a.user.email} | Plan: ${a.plan} | ID: ${a.userId}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkArtist();
