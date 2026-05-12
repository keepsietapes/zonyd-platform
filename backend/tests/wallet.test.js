import { describe, it, expect, vi } from 'vitest';
import { getBalance } from '../src/controllers/walletController';

// Mock de Prisma
vi.mock('../src/utils/prisma', () => ({
  wallet: {
    findUnique: vi.fn().mockResolvedValue(null) // Simular que no hay wallet
  }
}));

describe('Wallet Controller', () => {
  it('Debería retornar balance 0 si no existe wallet', async () => {
    const req = { user: { id: 'test-user-id' } };
    let responseData = null;
    const res = {
      json: (data) => { responseData = data; }
    };

    await getBalance(req, res);

    expect(responseData).toEqual({ balance: 0 });
  });
});
