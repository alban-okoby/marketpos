import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AlertsService } from '../../core/alerts/alerts.service';
import { CatalogueService, ProductInput, validateProduct } from '../caisse/catalogue.service';

const sugar = '6100000000003'; // seeded: stock 20

function clearStorage(): void {
  for (const key of ['marketpos.caisse.catalogue', 'marketpos.stock.mouvements', 'marketpos.alertes']) {
    localStorage.removeItem(key);
  }
}

const input: ProductInput = {
  code: 'NEW-1',
  name: 'Lait 1 L',
  price: 900,
  category: 'Laitier',
  unit: 'pièce',
  purchasePrice: 650,
  threshold: 3,
  expiry: '',
};

describe('product rules', () => {
  it('refuses articles without a code, a name or a valid price', () => {
    expect(validateProduct({ ...input, code: ' ' })).toMatch(/code/);
    expect(validateProduct({ ...input, name: '' })).toMatch(/nom/);
    expect(validateProduct({ ...input, price: -1 })).toMatch(/prix de vente/);
    expect(validateProduct(input)).toBeNull();
  });
});

describe('CatalogueService stock', () => {
  let catalogue: CatalogueService;
  let alerts: AlertsService;

  beforeEach(() => {
    clearStorage();
    TestBed.configureTestingModule({});
    catalogue = TestBed.inject(CatalogueService);
    alerts = TestBed.inject(AlertsService);
  });

  it('creates an article, and an update keeps its stock', () => {
    catalogue.save(input);
    expect(catalogue.find('NEW-1')?.stock).toBe(0);
    catalogue.save({ ...input, name: 'Lait 1 L demi-écrémé', price: 950 });
    expect(catalogue.find('NEW-1')?.name).toBe('Lait 1 L demi-écrémé');
    expect(catalogue.find('NEW-1')?.stock).toBe(0);
  });

  it('refuses a manual output larger than the stock, and keeps the stock unchanged', () => {
    expect(() => catalogue.recordOutput(sugar, 21, 'casse', '')).toThrowError(/Sortie impossible/);
    expect(catalogue.find(sugar)?.stock).toBe(20);
  });

  it('records a manual output with its reason and lowers the stock', () => {
    catalogue.recordOutput(sugar, 4, 'peremption', 'Date dépassée');
    expect(catalogue.find(sugar)?.stock).toBe(16);
    expect(catalogue.movements()[0]).toMatchObject({ code: sugar, delta: -4, reason: 'peremption', comment: 'Date dépassée' });
  });

  it('computes the differences of an inventory and records them', () => {
    const variances = catalogue.applyInventory([
      { code: sugar, counted: 18 },
      { code: '6100000000001', counted: 500 },
    ]);
    expect(variances).toHaveLength(2);
    expect(variances.find((line) => line.code === sugar)).toMatchObject({ before: 20, after: 18, delta: -2 });
    expect(catalogue.find(sugar)?.stock).toBe(18);
    expect(catalogue.movements().filter((move) => move.reason === 'inventaire')).toHaveLength(2);
  });

  it('ignores an inventory line that matches the stock', () => {
    expect(catalogue.applyInventory([{ code: sugar, counted: 20 }])).toHaveLength(0);
    expect(catalogue.movements()).toHaveLength(0);
  });

  it('raises a low-stock alert once when an article crosses its threshold', () => {
    catalogue.save({ ...input, code: 'LOW-1', threshold: 3 });
    catalogue.applyInventory([{ code: 'LOW-1', counted: 3 }]);
    catalogue.applyInventory([{ code: 'LOW-1', counted: 2 }]);
    catalogue.applyInventory([{ code: 'LOW-1', counted: 1 }]);
    const low = alerts.all().filter((alert) => alert.kind === 'stock-bas');
    expect(low).toHaveLength(1);
  });

  it('lists articles close to their best-before date', () => {
    const soon = new Date(Date.now() + 5 * 86_400_000).toISOString().slice(0, 10);
    catalogue.save({ ...input, code: 'EXP-1', expiry: soon });
    expect(catalogue.expiringWithin(30).map((product) => product.code)).toContain('EXP-1');
  });
});
