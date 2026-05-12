const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteToMaster(email) {
  try {
    const user = await prisma.user.update({
      where: { email: email },
      data: {
        role: 'ADMIN',
      }
    });

    const artist = await prisma.artist.upsert({
      where: { userId: user.id },
      update: { plan: 'LABEL' },
      create: {
        userId: user.id,
        stageName: user.firstName || 'Master Admin',
        plan: 'LABEL'
      }
    });

    console.log(`🚀 ÉXITO: El usuario ${email} ahora es ADMIN con plan LABEL.`);
    console.log(`ID de Artista: ${artist.id}`);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Para usar: node promote.js tu@correo.com
const targetEmail = process.argv[2];
if (!targetEmail) {
  console.log('Uso: node promote.js tu@correo.com');
} else {
  promoteToMaster(targetEmail);
}
