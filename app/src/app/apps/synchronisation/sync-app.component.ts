import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ConnectivityService } from '../../core/connectivity.service';
import { formatFcfa } from '../caisse/catalogue';
import { SalesService } from '../caisse/sales.service';
import { SyncService } from '../caisse/sync.service';

/** Sync queue: what is waiting on this device, and whether the server has received it (OF-04). */
@Component({
  selector: 'app-sync-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="sync">
      <header class="head">
        <span class="state" [class.offline]="!connectivity.online()">
          {{ connectivity.online() ? 'En ligne' : 'Hors ligne' }}
        </span>
        <button type="button" class="primary" (click)="sync.flush()" [disabled]="running() || !connectivity.online() || waiting().length === 0">
          {{ running() ? 'Synchronisation…' : 'Synchroniser maintenant' }}
        </button>
      </header>

      <dl class="facts">
        <dt>En attente</dt><dd>{{ waiting().length }} vente(s)</dd>
        <dt>Montant en attente</dt><dd>{{ fmt(waitingTotal()) }}</dd>
        <dt>Dernière synchronisation</dt><dd>{{ lastSync() ?? '—' }}</dd>
      </dl>

      @if (sync.lastError(); as message) {
        <p class="error" role="status">{{ message }}</p>
      }

      <h3>Ventes en attente</h3>
      <ul class="queue">
        @for (sale of waiting(); track sale.id) {
          <li>
            <span>{{ sale.number }}</span>
            <span>{{ dateLabel(sale.date) }}</span>
            <strong>{{ fmt(sale.total) }}</strong>
          </li>
        } @empty {
          <li class="empty">Aucune vente en attente. Tout est envoyé.</li>
        }
      </ul>
    </section>
  `,
  styleUrl: './sync-app.component.scss',
})
export class SyncAppComponent {
  readonly sync = inject(SyncService);
  readonly connectivity = inject(ConnectivityService);
  private readonly sales = inject(SalesService);

  readonly waiting = this.sales.pending;
  readonly waitingTotal = computed(() => this.waiting().reduce((sum, sale) => sum + sale.total, 0));
  readonly running = this.sync.running.asReadonly();
  readonly lastSync = computed(() => (this.sync.lastSyncAt() ? this.dateLabel(this.sync.lastSyncAt()!) : null));

  fmt(amount: number): string {
    return formatFcfa(amount);
  }

  dateLabel(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR');
  }
}
