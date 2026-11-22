import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AlertKind, AlertsService } from '../../core/alerts/alerts.service';

const KIND_LABELS: Record<AlertKind, string> = {
  'stock-negatif': 'Stock',
  synchronisation: 'Synchronisation',
  'ecart-caisse': 'Caisse',
};

/** Open alerts. An alert stays until someone acknowledges it. */
@Component({
  selector: 'app-alerts-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="alerts">
      <h3>Alertes ouvertes ({{ alerts.open().length }})</h3>
      <ul>
        @for (alert of alerts.open(); track alert.id) {
          <li>
            <div class="text">
              <span class="kind">{{ kindLabel(alert.kind) }}</span>
              <span>{{ alert.message }}</span>
              <small>{{ dateLabel(alert.date) }}</small>
            </div>
            <button type="button" (click)="alerts.acknowledge(alert.id)">Acquitter</button>
          </li>
        } @empty {
          <li class="empty">Aucune alerte.</li>
        }
      </ul>
    </section>
  `,
  styleUrl: './alerts-app.component.scss',
})
export class AlertsAppComponent {
  readonly alerts = inject(AlertsService);

  kindLabel(kind: AlertKind): string {
    return KIND_LABELS[kind];
  }

  dateLabel(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR');
  }
}
