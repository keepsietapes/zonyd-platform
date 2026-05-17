const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Iniciando limpieza de base de datos de lanzamientos y medios...');
  try {
    // 1. Eliminar dependencias de segundo nivel
    console.log('- Eliminando registros de Analytics...');
    await prisma.analytics.deleteMany({});

    console.log('- Eliminando registros de Splits...');
    await prisma.split.deleteMany({});

    console.log('- Eliminando registros de Colaboradores...');
    await prisma.collaborator.deleteMany({});

    console.log('- Eliminando registros de Envíos a DSPs (DspDelivery)...');
    await prisma.dspDelivery.deleteMany({});

    // 2. Eliminar dependencias de primer nivel
    console.log('- Eliminando registros de Tracks (Audio)...');
    await prisma.track.deleteMany({});

    console.log('- Eliminando registros de Releases (Lanzamientos)...');
    await prisma.release.deleteMany({});

    console.log('- Eliminando registros de SmartLinks...');
    await prisma.smartLink.deleteMany({});

    console.log('✅ Base de datos limpia con éxito. Se han eliminado todos los audios, portadas y lanzamientos de prueba sin afectar las cuentas de usuario.');
  } catch (err) {
    console.error('❌ Error durante la limpieza de la base de datos:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
