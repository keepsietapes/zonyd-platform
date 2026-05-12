const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMasterManual(email, id) {
  try {
    console.log(`🛠️ Creando registro manual para ${email}...`);
    
    const user = await prisma.user.upsert({
      where: { email: email },
      update: { role: 'ADMIN' },
      create: {
        id: id,
        email: email,
        role: 'ADMIN',
      }
    });

    await prisma.artist.upsert({
      where: { userId: user.id },
      update: { plan: 'LABEL' },
      create: {
        userId: user.id,
        stageName: 'Master Admin',
        plan: 'LABEL'
      }
    });

    console.log(`✅ Registro completado con éxito.`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

const targetEmail = process.argv[2];
const targetId = process.argv[3];

if (!targetEmail || !targetId) {
  console.log('Uso: node create_master.js email id');
} else {
  createMasterManual(targetEmail, targetId);
}
