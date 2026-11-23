import { describe, expect, it } from 'vitest';

import { vatIncluded } from '../../apps/caisse/sales.service';
import { needsJustification } from '../../apps/cloture/closure';
import { isIdle } from '../session/idle-lock.service';
import { DEFAULT_FISCAL, parseFiscal } from './fiscal.service';
import { DEFAULT_SHOP, parseShop } from './shop.service';
import { DEFAULT_SECURITY, MAX_IDLE_MINUTES, parseSecurity } from './security.service';

describe('shop settings', () => {
  it('falls back to defaults for missing or invalid values', () => {
    expect(parseShop(null)).toEqual(DEFAULT_SHOP);
    expect(parseShop({ paperWidth: 42, name: 12 }).paperWidth).toBe(80);
    expect(parseShop({ paperWidth: 42, name: 12 }).name).toBe(DEFAULT_SHOP.name);
  });

  it('keeps a 58 mm paper width and trims long text', () => {
    expect(parseShop({ paperWidth: 58 }).paperWidth).toBe(58);
    expect(parseShop({ name: ' Épicerie  ' }).name).toBe('Épicerie');
    expect(parseShop({ phone: 'x'.repeat(100) }).phone).toHaveLength(40);
  });
});

describe('fiscal settings', () => {
  it('keeps VAT within 0 and 100 percent', () => {
    expect(parseFiscal({ vatRate: 18 }).vatRate).toBe(18);
    expect(parseFiscal({ vatRate: 250 }).vatRate).toBe(100);
    expect(parseFiscal({ vatRate: -5 }).vatRate).toBe(0);
    expect(parseFiscal(null)).toEqual(DEFAULT_FISCAL);
  });

  it('computes VAT included in a tax-included total', () => {
    expect(vatIncluded(1180, 18)).toBe(180);
    expect(vatIncluded(1180, 0)).toBe(0);
  });

  it('uses the configured threshold for the cash gap', () => {
    expect(needsJustification(-300, 0)).toBe(true);
    expect(needsJustification(-300, 500)).toBe(false);
    expect(needsJustification(-600, 500)).toBe(true);
  });

  it('never accepts a negative threshold', () => {
    expect(parseFiscal({ cashGapThreshold: -10 }).cashGapThreshold).toBe(0);
  });
});

describe('security settings', () => {
  it('locks after five minutes by default, and keeps the value within limits', () => {
    expect(parseSecurity(null)).toEqual(DEFAULT_SECURITY);
    expect(parseSecurity({ idleMinutes: 500 }).idleMinutes).toBe(MAX_IDLE_MINUTES);
    expect(parseSecurity({ idleMinutes: 0 }).idleMinutes).toBe(0);
  });

  it('detects inactivity, and never with zero minutes', () => {
    const start = 1_000_000;
    expect(isIdle(start, start + 4 * 60_000, 5)).toBe(false);
    expect(isIdle(start, start + 5 * 60_000, 5)).toBe(true);
    expect(isIdle(start, start + 99 * 60_000, 0)).toBe(false);
  });
});
