import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ConnectivityService } from '../../core/connectivity.service';
import { SessionService } from '../../core/session/session.service';
import { SalesService } from '../caisse/sales.service';
import { cashGap, formatZNumber, needsJustification, salesSince, summarize } from './closure';
import { ClosuresService } from './closures.service';

function clearStorage(): void {
  for (const key of [
    'marketpos.caisse.compteur',
    'marketpos.caisse.ventes',
    'marketpos.caisse.clotures',
    'marketpos.caisse.rectifications',
    'marketpos.alertes',
  ]) {
    localStorage.removeItem(key);
  }
}

describe('closing rules', () => {
  it('computes the gap between counted and expected cash', () => {
    expect(cashGap(9000, 9500)).toBe(-500);
    expect(needsJustification(-500)).toBe(true);
    expect(needsJustification(0)).toBe(false);
  });

  it('numbers Z closings continuously', () => {
    expect(formatZNumber(1)).toBe('Z-000001');
    expect(formatZNumber(12)).toBe('Z-000012');
  });

  it('keeps only the sales after a given moment', () => {
    const sales = [
      { date: '2026-11-22T08:00:00.000Z' },
      { date: '2026-11-22T18:00:00.000Z' },
    ] as never[];
    expect(salesSince(sales, '2026-11-22T12:00:00.000Z')).toHaveLength(1);
    expect(salesSince(sales, null)).toHaveLength(2);
  });

  it('summarises a period with its first and last ticket', () => {
    const sales = [
      { number: 'CAISSE-01-000001', total: 1000 },
      { number: 'CAISSE-01-000002', total: 2500 },
    ] as never[];
    const summary = summarize(sales);
    expect(summary.count).toBe(2);
    expect(summary.total).toBe(3500);
    expect(summary.firstTicket).toBe('CAISSE-01-000001');
    expect(summary.lastTicket).toBe('CAISSE-01-000002');
  });
});

describe('ClosuresService', () => {
  let closures: ClosuresService;
  let sales: SalesService;

  beforeEach(() => {
    clearStorage();
    TestBed.configureTestingModule({});
    sales = TestBed.inject(SalesService);
    closures = TestBed.inject(ClosuresService);
    TestBed.inject(ConnectivityService);
    TestBed.inject(SessionService);
  });

  const lines = [{ code: 'A', name: 'Sucre', price: 800, qty: 1 }];

  it('X report shows the period without closing it', () => {
    sales.record(lines, 1000, 'Caissier 1');
    expect(closures.xReport().count).toBe(1);
    expect(closures.closures()).toHaveLength(0);
    expect(closures.xReport().count).toBe(1);
  });

  it('Z closing resets the period and carries the counted cash as next float', () => {
    sales.record(lines, 1000, 'Caissier 1');
    const z = closures.closeDay({ countedCash: 800, justification: '', validatedBy: 'Gérant' });
    expect(z.number).toBe('Z-000001');
    expect(z.cashExpected).toBe(800);
    expect(z.gap).toBe(0);
    expect(closures.xReport().count).toBe(0);
    expect(closures.openingFloat()).toBe(800);
  });

  it('refuses a Z closing with a gap and no justification', () => {
    sales.record(lines, 1000, 'Caissier 1');
    expect(() => closures.closeDay({ countedCash: 500, justification: '  ', validatedBy: 'Gérant' })).toThrowError(/Justification obligatoire/);
    expect(closures.closures()).toHaveLength(0);
  });

  it('keeps the justification and raises a cash alert when there is a gap', () => {
    sales.record(lines, 1000, 'Caissier 1');
    const z = closures.closeDay({ countedCash: 500, justification: 'Monnaie rendue en trop', validatedBy: 'Gérant' });
    expect(z.gap).toBe(-300);
    expect(z.justification).toBe('Monnaie rendue en trop');
  });

  it('never changes a closing: corrections are added as rectifications with a reason', () => {
    const z = closures.closeDay({ countedCash: 0, justification: '', validatedBy: 'Gérant' });
    expect(() => closures.addRectification(z.id, 200, '  ')).toThrowError(/motif/);
    closures.addRectification(z.id, 200, 'Oubli d\'encaissement');
    expect(closures.rectificationsOf(z.id)).toHaveLength(1);
    expect(closures.closures()[0].cashCounted).toBe(0);
  });

  it('rejects a rectification for an unknown closing', () => {
    expect(() => closures.addRectification('inconnue', 100, 'test')).toThrowError(/inconnue/);
  });
});
