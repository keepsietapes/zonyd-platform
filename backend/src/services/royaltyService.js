const LedgerService = require('./ledgerService');
const prisma = require('../utils/prisma');

class RoyaltyService {
  /**
   * Distribuye un monto de regalías entre los artistas según sus splits.
   * @param {string} trackId - ID del track que generó la regalía.
   * @param {number} totalAmount - Monto total recibido de la tienda (ej: Spotify).
   * @param {string} source - Origen de la regalía.
   */
  static async distributeTrackRoyalties(trackId, totalAmount, source) {
    // 1. Obtener los splits del track
    const splits = await prisma.split.findMany({
      where: { trackId },
      include: { artist: true }
    });

    if (!splits || splits.length === 0) {
      throw new Error(`No se encontraron splits configurados para el track ${trackId}`);
    }

    // 2. Validar que la suma de los splits sea 100 (o 1.0)
    const totalSplit = splits.reduce((acc, s) => acc + s.percentage, 0);
    if (Math.abs(totalSplit - 100) > 0.01) {
      throw new Error(`Los splits del track ${trackId} no suman 100%. Suma actual: ${totalSplit}%`);
    }

    // 3. Distribuir a cada artista
    const results = [];
    for (const split of splits) {
      const share = (totalAmount * split.percentage) / 100;
      
      const transaction = await LedgerService.recordTransaction(
        split.artist.userId,
        share,
        'ROYALTY_IN',
        `Regalías de ${source} para el track ${trackId}`,
        { trackId, source, splitPercentage: split.percentage }
      );
      
      results.push({ artistId: split.artistId, amount: share });
    }

    return results;
  }
}

module.exports = RoyaltyService;
