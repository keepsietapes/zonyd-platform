const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'keepsietapes@gmail.com';
  console.log(`Buscando al usuario ${email}...`);

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log('Usuario no encontrado');
    return;
  }

  // Update user role to ADMIN or LABEL
  await prisma.user.update({
    where: { email },
    data: { role: 'LABEL' }
  });

  console.log('Rol de usuario actualizado a LABEL');

  // Update artist plan to LABEL
  const updated = await prisma.artist.updateMany({
    where: { userId: user.id },
    data: { plan: 'LABEL' }
  });

  console.log(`Perfiles actualizados a LABEL: ${updated.count}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
