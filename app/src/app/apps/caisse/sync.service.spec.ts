import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ConnectivityService } from '../../core/connectivity.service';
import { SalesService, Sale } from './sales.service';
import { SYNC_TRANSPORT, SyncService, SyncTransport } from './sync.service';

function clearStorage(): void {
  for (const key of ['marketpos.caisse.compteur', 'marketpos.caisse.ventes', 'marketpos.alertes']) {
    localStorage.removeItem(key);
  }
}

/** A server that accepts every sale it receives, and remembers the ids it has seen. */
function fakeServer(options: { readonly failWith?: string; readonly accept?: (sale: Sale) => boolean } = {}) {
  const received: string[] = [];
  const transport: SyncTransport = {
    send: async (sales) => {
      if (options.failWith) {
        throw new Error(options.failWith);
      }
      received.push(...sales.map((sale) => sale.id));
      return sales.filter((sale) => (options.accept ? options.accept(sale) : true)).map((sale) => sale.id);
    },
  };
  return { transport, received };
}

describe('SyncService', () => {
  let sales: SalesService;
  let connectivity: ConnectivityService;

  beforeEach(() => {
    clearStorage();
  });

  function setup(transport: SyncTransport): SyncService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: SYNC_TRANSPORT, useValue: transport }] });
    sales = TestBed.inject(SalesService);
    connectivity = TestBed.inject(ConnectivityService);
    connectivity.online.set(true);
    return TestBed.inject(SyncService);
  }

  const lines = [{ code: 'A', name: 'Sucre', price: 800, qty: 1 }];

  it('marks as synchronised only the sales the server acknowledged, and never removes any', async () => {
    const server = fakeServer({ accept: (sale) => sale.total < 2000 });
    const sync = setup(server.transport);
    const small = sales.record(lines, 1000, 'Caissier 1');
    const big = sales.record([{ ...lines[0], price: 5000 }], 6000, 'Caissier 1');

    await sync.flush();

    const journal = sales.journal();
    expect(journal).toHaveLength(2);
    expect(journal.find((sale) => sale.id === small.id)?.status).toBe('SYNCHRONISEE');
    expect(journal.find((sale) => sale.id === big.id)?.status).toBe('EN_ATTENTE_SYNC');
    expect(sales.pendingSync()).toBe(1);
  });

  it('sends nothing while offline, and keeps the queue', async () => {
    const server = fakeServer();
    const sync = setup(server.transport);
    sales.record(lines, 1000, 'Caissier 1');
    connectivity.online.set(false);

    await sync.flush();

    expect(server.received).toHaveLength(0);
    expect(sales.pendingSync()).toBe(1);
  });

  it('keeps the queue and reports the error when the server cannot be reached', async () => {
    const server = fakeServer({ failWith: 'Serveur injoignable.' });
    const sync = setup(server.transport);
    sales.record(lines, 1000, 'Caissier 1');

    await sync.flush();

    expect(sync.lastError()).toBe('Serveur injoignable.');
    expect(sales.pendingSync()).toBe(1);
  });

  it('a sale sent twice is recorded once by the server, because its id is unchanged', async () => {
    const server = fakeServer({ accept: () => false });
    const sync = setup(server.transport);
    const sale = sales.record(lines, 1000, 'Caissier 1');

    await sync.flush();
    await sync.flush();

    expect(server.received.filter((id) => id === sale.id)).toHaveLength(2);
    expect(new Set(server.received).size).toBe(1);
  });

  it('publishes the number of waiting sales to the connectivity state', async () => {
    const server = fakeServer();
    setup(server.transport);
    sales.record(lines, 1000, 'Caissier 1');
    TestBed.flushEffects();
    expect(connectivity.pendingSales()).toBe(1);
  });
});
