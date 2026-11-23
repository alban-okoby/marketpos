import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { MAX_IDLE_MINUTES, SecuritySettingsService } from '../../../core/settings/security.service';

/** Settings page "Sécurité": automatic lock after a period without activity (US-04). */
@Component({
  selector: 'app-security-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="page">
      <header>
        <h2>Sécurité</h2>
        <p class="subtitle">Verrouillage de la session sur cet appareil.</p>
      </header>

      <section aria-labelledby="idle-title">
        <h3 id="idle-title" class="group-title">Verrouillage automatique</h3>
        <div class="form">
          <label class="field">
            <span>Délai d'inactivité avant verrouillage (minutes)</span>
            <input
              type="number"
              min="0"
              [attr.max]="max"
              step="1"
              [value]="security.settings().idleMinutes"
              (change)="setIdle($event)"
            />
          </label>
        </div>
        <p class="hint">
          La session se verrouille après ce délai sans clic, sans frappe ni défilement. Entrez 0 pour désactiver le verrouillage.
        </p>
      </section>
    </article>
  `,
  styleUrl: './fiscal-settings.component.scss',
})
export class SecuritySettingsComponent {
  readonly security = inject(SecuritySettingsService);
  readonly max = MAX_IDLE_MINUTES;

  setIdle(event: Event): void {
    this.security.update({ idleMinutes: Math.round(Number((event.target as HTMLInputElement).value) || 0) });
  }
}
