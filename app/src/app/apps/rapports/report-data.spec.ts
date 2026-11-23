import { describe, expect, it } from 'vitest';

import type { Product } from '../caisse/catalogue';
import type { Sale } from '../caisse/sales.service';
import { csvTable, periodKey, rankProducts, salesByCashier, salesByPeriod, stockSummary } from './report-data';

const sale = (date: string, total: number, cashier = 'Caissier 1', lines: Sale['lines'] = []): Sale =>
  ({ id: date + total, number: 'CAISSE-01-000001', date, cashier, lines, total, received: total, change: 0, status: 'EN_ATTENTE_SYNC' }) as Sale;

const product = (code: string, stock: number, extra: Partial<Product> = {}): Product =>
  ({ code, name: `Article ${code}`, price: 1000, category: 'Divers', stock, ...extra }) as Product;

describe('sales reports', () => {
  it('groups sales by day, week and month', () => {
    const sales = [sale('2026-11-02T10:00:00', 1000), sale('2026-11-02T15:00:00', 500), sale('2026-11-09T09:00:00', 2000)];
    expect(salesByPeriod(sales, 'jour').map((row) => [row.label, row.total])).toEqual([
      ['09/11/2026', 2000],
      ['02/11/2026', 1500],
    ]);
    expect(salesByPeriod(sales, 'mois')).toEqual([{ key: '2026-11', label: '11/2026', count: 3, total: 3500 }]);
    expect(periodKey('2026-11-02T10:00:00', 'semaine')).toBe('2026-S45');
  });

  it('totals sales per cashier, largest first', () => {
    const sales = [sale('2026-11-02T10:00:00', 1000, 'A'), sale('2026-11-02T11:00:00', 3000, 'B')];
    expect(salesByCashier(sales).map((row) => row.name)).toEqual(['B', 'A']);
  });

  it('ranks every article, including those never sold', () => {
    const products = [product('1', 5), product('2', 5)];
    const sales = [sale('2026-11-02T10:00:00', 2000, 'A', [{ code: '2', name: 'x', price: 1000, qty: 2 }])];
    const ranking = rankProducts(products, sales);
    expect(ranking[0]).toMatchObject({ code: '2', qty: 2, amount: 2000 });
    expect(ranking[1]).toMatchObject({ code: '1', qty: 0 });
  });
});

describe('stock reports', () => {
  it('values the stock at purchase price and finds ruptures and critical articles', () => {
    const summary = stockSummary([
      product('a', 10, { purchasePrice: 500, threshold: 3 }),
      product('b', 0),
      product('c', 2, { threshold: 3 }),
    ]);
    expect(summary.value).toBe(10 * 500 + 2 * 1000);
    expect(summary.ruptures.map((item) => item.code)).toEqual(['b']);
    expect(summary.critical.map((item) => item.code)).toEqual(['c']);
  });
});

describe('CSV export', () => {
  it('uses semicolons, quotes cells, and starts with a byte-order mark', () => {
    const csv = csvTable(['Article', 'Quantité'], [['Sucre "1 kg"', 3]]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('"Article";"Quantité"');
    expect(csv).toContain('"Sucre ""1 kg""";"3"');
  });
});
