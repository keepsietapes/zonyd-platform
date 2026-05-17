const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const usersToDelete = await prisma.user.findMany({
    where: { email: { not: 'keepsietapes@gmail.com' } },
    select: { id: true }
  });
  const userIds = usersToDelete.map(u => u.id);
  
  if (userIds.length > 0) {
    const artists = await prisma.artist.findMany({ where: { userId: { in: userIds } }, select: { id: true } });
    const artistIds = artists.map(a => a.id);
    
    // delete related artist tables
    await prisma.smartLink.deleteMany({ where: { artistId: { in: artistIds } }});
    await prisma.fan.deleteMany({ where: { artistId: { in: artistIds } }});
    await prisma.publishingWork.deleteMany({ where: { artistId: { in: artistIds } }});
    await prisma.split.deleteMany({ where: { artistId: { in: artistIds } }});
    await prisma.collaborator.deleteMany({ where: { artistId: { in: artistIds } }});
    await prisma.royalty.deleteMany({ where: { artistId: { in: artistIds } }});
    
    const releases = await prisma.release.findMany({ where: { primaryArtistId: { in: artistIds } }, select: { id: true } });
    const releaseIds = releases.map(r => r.id);
    
    if (releaseIds.length > 0) {
      await prisma.dspDelivery.deleteMany({ where: { releaseId: { in: releaseIds } }});
      const tracks = await prisma.track.findMany({ where: { releaseId: { in: releaseIds } }, select: { id: true } });
      const trackIds = tracks.map(t => t.id);
      await prisma.analytics.deleteMany({ where: { trackId: { in: trackIds } }});
      await prisma.split.deleteMany({ where: { trackId: { in: trackIds } }});
      await prisma.collaborator.deleteMany({ where: { trackId: { in: trackIds } }});
      await prisma.track.deleteMany({ where: { releaseId: { in: releaseIds } }});
      await prisma.release.deleteMany({ where: { id: { in: releaseIds } }});
    }

    await prisma.artist.deleteMany({ where: { userId: { in: userIds } }});
    await prisma.auditLog.deleteMany({ where: { userId: { in: userIds } }});
    await prisma.supportTicket.deleteMany({ where: { userId: { in: userIds } }});
    await prisma.wallet.deleteMany({ where: { userId: { in: userIds } }});
    await prisma.organizationMember.deleteMany({ where: { userId: { in: userIds } }});
    
    await prisma.aiConversation.deleteMany({ where: { userId: { in: userIds } }});
    await prisma.notification.deleteMany({ where: { userId: { in: userIds } }});

    await prisma.user.deleteMany({ where: { id: { in: userIds } }});
  }

  // update keepsietapes@gmail.com
  await prisma.user.update({
    where: { email: 'keepsietapes@gmail.com' },
    data: { role: 'ADMIN' }
  });

  const mainUser = await prisma.user.findUnique({ where: { email: 'keepsietapes@gmail.com' }, include: { artistProfiles: true }});
  if (mainUser && mainUser.artistProfiles.length > 0) {
    await prisma.artist.update({
      where: { id: mainUser.artistProfiles[0].id },
      data: { plan: 'LABEL' }
    });
  }
  console.log("Cleanup complete!");
}
run();
