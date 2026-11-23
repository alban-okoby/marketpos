import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import {
  MAX_IDLE_MINUTES,
  MAX_LOCKOUT_SECONDS,
  MAX_PIN_ATTEMPTS,
  SecuritySettingsService,
} from '../../../core/settings/security.service';

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

      <section aria-labelledby="pin-title">
        <h3 id="pin-title" class="group-title">Code PIN</h3>
        <div class="form">
          <label class="field">
            <span>Essais avant blocage</span>
            <input type="number" min="1" [attr.max]="maxAttempts" step="1" [value]="security.settings().maxPinAttempts" (change)="setAttempts($event)" />
          </label>
          <label class="field">
            <span>Durée du blocage (secondes)</span>
            <input type="number" min="10" [attr.max]="maxLockout" step="5" [value]="security.settings().lockoutSeconds" (change)="setLockout($event)" />
          </label>
        </div>
        <p class="hint">
          Après le nombre d'essais indiqué, le code PIN ne peut plus être saisi pendant la durée choisie. Ce blocage s'applique au verrouillage et au code du gérant pour les clôtures.
        </p>
      </section>
    </article>
  `,
  styleUrl: './fiscal-settings.component.scss',
})
export class SecuritySettingsComponent {
  readonly security = inject(SecuritySettingsService);
  readonly max = MAX_IDLE_MINUTES;
  readonly maxAttempts = MAX_PIN_ATTEMPTS;
  readonly maxLockout = MAX_LOCKOUT_SECONDS;

  setAttempts(event: Event): void {
    this.security.update({ maxPinAttempts: Math.round(Number((event.target as HTMLInputElement).value) || 1) });
  }

  setLockout(event: Event): void {
    this.security.update({ lockoutSeconds: Math.round(Number((event.target as HTMLInputElement).value) || 10) });
  }

  setIdle(event: Event): void {
    this.security.update({ idleMinutes: Math.round(Number((event.target as HTMLInputElement).value) || 0) });
  }
}
