const prisma = require('../utils/prisma');

async function simulateStreams(req, res) {
  const { trackId } = req.body;
  const streams = Math.floor(Math.random() * 50000) + 1000;
  const revenue = streams * 0.0035; // $0.0035 x stream

  const royalty = await prisma.royalty.create({
    data: { trackId: Number(trackId), streams, revenue }
  });
  res.json(royalty);
}

async function getAnalytics(req, res) {
  const data = await prisma.royalty.groupBy({
    by: ['trackId'],
    _sum: { streams: true, revenue: true }
  });
  res.json(data);
}
module.exports = { simulateStreams, getAnalytics };
