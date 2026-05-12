const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetId = '00000000-0000-0000-0000-000000000000';

  console.log('Limpiando base de datos para asegurar integridad...');
  
  // Borrar en orden inverso de dependencias
  await prisma.split.deleteMany({});
  await prisma.track.deleteMany({});
  await prisma.release.deleteMany({});
  await prisma.artist.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Creando usuario maestro de prueba...');
  const user = await prisma.user.create({
    data: {
      id: targetId,
      email: 'admin@zonyd.com',
      role: 'ADMIN'
    }
  });

  await prisma.wallet.create({
    data: {
      userId: targetId,
      balance: 1250.75
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
