import { describe, it, expect, vi, beforeEach } from 'vitest';
const RoyaltyService = require('../src/services/royaltyService');
const LedgerService = require('../src/services/ledgerService');
const prisma = require('../src/utils/prisma');

// Mockear Prisma de forma global
vi.mock('../src/utils/prisma', () => ({
  split: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn((cb) => cb({
    wallet: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    auditLog: { create: vi.fn() }
  })),
}));

// Mockear LedgerService
vi.mock('../src/services/ledgerService', () => ({
  recordTransaction: vi.fn(),
}));

describe('RoyaltyService - Distribución de Splits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería calcular y distribuir correctamente un pago de 100 USD con split 60/40', async () => {
    const trackId = 'track-123';
    const totalAmount = 100;
    const source = 'Spotify';
    
    const mockSplits = [
      { artistId: 'artist-1', percentage: 60, artist: { userId: 'user-1' } },
      { artistId: 'artist-2', percentage: 40, artist: { userId: 'user-2' } }
    ];

    // Accedemos al mock directamente
    const { split } = require('../src/utils/prisma');
    split.findMany.mockResolvedValue(mockSplits);
    
    LedgerService.recordTransaction.mockResolvedValue({ balance: 60 });

    const results = await RoyaltyService.distributeTrackRoyalties(trackId, totalAmount, source);

    expect(results).toHaveLength(2);
    expect(results[0].amount).toBe(60);
    expect(results[1].amount).toBe(40);
  });
});
