import { describe, it, expect } from 'vitest';
import pricing, { formatPrice, yearlySavingsPercent } from '../../src/lib/pricing';

describe('pricing', () => {
  it('formats integer prices without decimals', () => {
    expect(formatPrice(99)).toMatch(/R\$\s?99$/);
  });
  it('formats fractional prices with two decimals', () => {
    expect(formatPrice(99.9)).toMatch(/R\$\s?99,90$/);
  });
  it('computes yearly savings as a rounded percentage', () => {
    expect(yearlySavingsPercent(100, 1000)).toBe(17);
  });
  it('alpine data starts on monthly billing', () => {
    expect(pricing()).toEqual({ yearly: false });
  });
});
