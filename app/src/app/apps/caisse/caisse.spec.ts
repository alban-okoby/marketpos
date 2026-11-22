import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { buildTestCatalogue, categoriesOf, formatFcfa, matchesSearch, parseCatalogue, SEED_PRODUCTS, TEST_CATALOGUE_SIZE } from './catalogue';
import { CartService } from './cart.service';
import { CatalogueService } from './catalogue.service';
import { cashPaymentStatus, changeDue, formatTicketNumber, SalesService } from './sales.service';

describe('test catalogue', () => {
  const products = buildTestCatalogue();

  it('has 200 articles with unique codes, named articles first', () => {
    expect(products.length).toBe(TEST_CATALOGUE_SIZE);
    expect(new Set(products.map((p) => p.code)).size).toBe(TEST_CATALOGUE_SIZE);
    expect(products[0].name).toBe(SEED_PRODUCTS[0][1]);
    expect(products[SEED_PRODUCTS.length].name).toBe('Article test 016');
  });

  it('lists categories in first-appearance order', () => {
    expect(categoriesOf(products)[0]).toBe('Boissons');
  });

  it('searches by name and by code, ignoring case and accents', () => {
    const sugar = products.find((p) => p.name === 'Sucre 1 kg')!;
    expect(matchesSearch(sugar, 'SUCRE')).toBe(true);
    expect(matchesSearch(sugar, '6100000000003')).toBe(true);
    expect(matchesSearch(sugar, 'huile')).toBe(false);
    expect(matchesSearch(sugar, '')).toBe(true);
  });
});

describe('money and tickets', () => {
  it('formats FCFA with spaces and no decimals', () => {
    expect(formatFcfa(12500)).toBe('12 500 F');
    expect(formatFcfa(0)).toBe('0 F');
  });

  it('computes change and never goes negative', () => {
    expect(changeDue(1700, 2000)).toBe(300);
    expect(changeDue(1700, 1000)).toBe(0);
  });

  it('only allows validation when the amount covers the total', () => {
    expect(cashPaymentStatus(1700, 1000)).toEqual({ change: 0, canValidate: false, insufficient: true });
    expect(cashPaymentStatus(1700, 0)).toEqual({ change: 0, canValidate: false, insufficient: false });
    expect(cashPaymentStatus(1700, 2000).canValidate).toBe(true);
  });

  it('numbers tickets with six digits', () => {
    expect(formatTicketNumber(42)).toBe('CAISSE-01-000042');
  });

  it('rejects an invalid catalogue in storage', () => {
    expect(parseCatalogue([{ code: 1 }])).toBeNull();
    expect(parseCatalogue('nope')).toBeNull();
  });
});

describe('CartService', () => {
  let cart: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    cart = TestBed.inject(CartService);
    cart.clear();
  });

  it('adds one unit per click and sums the total', () => {
    cart.add({ code: 'A', name: 'Sucre', price: 800 });
    cart.add({ code: 'A', name: 'Sucre', price: 800 });
    cart.add({ code: 'B', name: 'Riz', price: 4500 });
    expect(cart.lines().length).toBe(2);
    expect(cart.total()).toBe(800 * 2 + 4500);
    expect(cart.itemCount()).toBe(3);
  });

  it('removes a line when its quantity reaches zero', () => {
    cart.add({ code: 'A', name: 'Sucre', price: 800 });
    cart.changeQty('A', -1);
    expect(cart.lines()).toEqual([]);
  });
});

describe('SalesService', () => {
  let sales: SalesService;

  beforeEach(() => {
    localStorage.removeItem('marketpos.caisse.compteur');
    localStorage.removeItem('marketpos.caisse.ventes');
    TestBed.configureTestingModule({});
    sales = TestBed.inject(SalesService);
  });

  it('gives continuous ticket numbers and records the sale as pending sync', () => {
    const lines = [{ code: 'A', name: 'Sucre', price: 800, qty: 2 }];
    const first = sales.record(lines, 2000, 'Caissier 1');
    const second = sales.record(lines, 1600, 'Caissier 1');
    expect(first.number).toBe('CAISSE-01-000001');
    expect(second.number).toBe('CAISSE-01-000002');
    expect(first.change).toBe(400);
    expect(first.status).toBe('EN_ATTENTE_SYNC');
    expect(sales.pendingSync()).toBe(2);
  });

  it('refuses a sale when the amount received is too low', () => {
    const lines = [{ code: 'A', name: 'Sucre', price: 800, qty: 2 }];
    expect(() => sales.record(lines, 1000, 'Caissier 1')).toThrowError(/insuffisant/);
    expect(sales.journal().length).toBe(0);
  });
});

describe('CatalogueService', () => {
  let catalogue: CatalogueService;

  beforeEach(() => {
    localStorage.removeItem('marketpos.caisse.catalogue');
    TestBed.configureTestingModule({});
    catalogue = TestBed.inject(CatalogueService);
  });

  it('decrements the stock of sold articles, without blocking at zero', () => {
    const sugar = catalogue.find('6100000000003')!;
    catalogue.decrementStock([{ code: sugar.code, qty: sugar.stock + 3 }]);
    expect(catalogue.find(sugar.code)!.stock).toBe(-3);
  });
});
