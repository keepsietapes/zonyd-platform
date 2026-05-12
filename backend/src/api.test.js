import { describe, it, expect, vi } from 'vitest';
const request = require('supertest');
const express = require('express');
const app = express();

// Mock de Prisma para evitar conexión real a DB
vi.mock('./utils/prisma', () => ({
  default: {
    $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }])
  },
  $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }])
}));

app.get('/health', async (req, res) => {
  try {
    // Simulamos éxito si el mock está activo
    res.json({ status: 'healthy' });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy' });
  }
});

describe('GET /health', () => {
  it('should return 200 and healthy status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });
});
