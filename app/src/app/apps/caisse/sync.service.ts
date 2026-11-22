import { DestroyRef, Injectable, InjectionToken, effect, inject, signal, untracked } from '@angular/core';

import { ConnectivityService } from '../../core/connectivity.service';
import { AlertsService } from '../../core/alerts/alerts.service';
import { Sale, SalesService } from './sales.service';

/** Sends sales to the server and returns the ids the server has accepted. */
export interface SyncTransport {
  send(sales: readonly Sale[]): Promise<readonly string[]>;
}

/** Used until a server is configured: nothing is sent, so sales stay in the queue. */
export const NO_SERVER_TRANSPORT: SyncTransport = {
  send: () => Promise.reject(new Error('Aucun serveur de synchronisation configuré.')),
};

export const SYNC_TRANSPORT = new InjectionToken<SyncTransport>('SYNC_TRANSPORT', {
  providedIn: 'root',
  factory: () => NO_SERVER_TRANSPORT,
});

const RETRY_INTERVAL_MS = 30_000;

/**
 * Sends the offline queue when the network is back (OF-02). Each sale carries a unique id, so a sale that is sent
 * twice is recorded once by the server (OF-03). A sale is only marked as synchronised when the server acknowledges it,
 * and no sale is ever deleted (OF-06).
 */
@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly sales = inject(SalesService);
  private readonly connectivity = inject(ConnectivityService);
  private readonly alerts = inject(AlertsService);
  private readonly transport = inject(SYNC_TRANSPORT);

  readonly running = signal(false);
  readonly lastError = signal<string | null>(null);
  readonly lastSyncAt = signal<string | null>(null);

  constructor() {
    // The tray shows how many sales are waiting (OF-04).
    effect(() => {
      const waiting = this.sales.pendingSync();
      untracked(() => this.connectivity.pendingSales.set(waiting));
    });

    // Back online: send the queue straight away.
    effect(() => {
      if (this.connectivity.online()) {
        untracked(() => void this.flush());
      }
    });

    const timer = setInterval(() => void this.flush(), RETRY_INTERVAL_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  /** Sends every waiting sale once. Does nothing when offline, when a send is running, or when the queue is empty. */
  async flush(): Promise<void> {
    if (this.running() || !this.connectivity.online()) {
      return;
    }
    const queue = this.sales.pending();
    if (queue.length === 0) {
      return;
    }
    this.running.set(true);
    try {
      const accepted = await this.transport.send(queue);
      this.sales.markSynced(accepted);
      this.lastError.set(null);
      this.lastSyncAt.set(new Date().toISOString());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Synchronisation impossible.';
      if (message !== this.lastError()) {
        this.alerts.raise('synchronisation', message);
      }
      this.lastError.set(message);
    } finally {
      this.running.set(false);
    }
  }
}
