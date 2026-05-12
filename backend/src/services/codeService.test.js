import { describe, it, expect } from 'vitest';
const { generateISRC, generateUPC } = require('./codeService');

describe('CodeService', () => {
  it('should generate a valid ISRC format', () => {
    const isrc = generateISRC('MX', 'ZON');
    expect(isrc).toMatch(/^MX-ZON-\d{2}-\d{5}$/);
  });

  it('should generate a 12-digit UPC', () => {
    const upc = generateUPC();
    expect(upc).toHaveLength(12);
    expect(Number(upc)).toBeGreaterThan(0);
  });
});
