const prisma = require('../utils/prisma');
const { generateManifest } = require('../services/distributionService');

async function distribute(req, res) {
  const release = await prisma.release.findUnique({
    where: { id: Number(req.params.id) }, include: { tracks: true }
  });
  if(!release) return res.status(404).send('Not found');

  const xmlPath = generateManifest(release);
  await prisma.release.update({ where: {id: release.id}, data: {status: 'delivered'} });
  
  res.json({ success: true, status: 'delivered', xmlPath });
}
module.exports = { distribute };
