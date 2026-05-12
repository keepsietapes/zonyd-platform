const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

/**
 * Servicio para gestionar el Libro Mayor (Ledger) Inmutable.
 * Todas las transacciones financieras deben pasar por aquí.
 */
class LedgerService {
  /**
   * Registra una transacción financiera.
   * @param {string} userId - ID del usuario.
   * @param {number} amount - Cantidad (positiva para crédito, negativa para débito).
   * @param {string} type - Tipo de transacción (ROYALTY_IN, WITHDRAWAL, FEE).
   * @param {string} description - Descripción para el usuario.
   * @param {object} metadata - Datos adicionales (ej: trackId, source).
   */
  static async recordTransaction(userId, amount, type, description, metadata = {}) {
    return await prisma.$transaction(async (tx) => {
      // 1. Obtener o crear Wallet
      let wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        wallet = await tx.wallet.create({ data: { userId, balance: 0 } });
      }

      // 2. Validar si es un débito (retiro) y si hay fondos suficientes
      if (amount < 0 && Math.abs(amount) > wallet.balance) {
        throw new Error('Fondos insuficientes para realizar esta operación.');
      }

      // 3. Crear el registro en AuditLog (Inmutable)
      await tx.auditLog.create({
        data: {
          userId,
          action: `FINANCIAL_${type}`,
          details: JSON.stringify({
            amount,
            previousBalance: wallet.balance,
            newBalance: wallet.balance + amount,
            description,
            ...metadata
          })
        }
      });

      // 4. Actualizar el balance de la Wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } }
      });

      logger.info(`Transacción registrada: ${type} para usuario ${userId}. Monto: ${amount}`);
      return updatedWallet;
    });
  }
}

module.exports = LedgerService;
