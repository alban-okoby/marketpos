import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { FiscalSettingsService } from '../../../core/settings/fiscal.service';
import { formatFcfa } from '../../caisse/catalogue';

/** Settings page "Fiscalité": VAT rate and cash-gap threshold. */
@Component({
  selector: 'app-fiscal-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="page">
      <header>
        <h2>Fiscalité</h2>
        <p class="subtitle">Taux et seuils utilisés pour les ventes et les clôtures.</p>
      </header>

      <section aria-labelledby="vat-title">
        <h3 id="vat-title" class="group-title">TVA</h3>
        <div class="form">
          <label class="field">
            <span>Taux de TVA appliqué aux nouvelles ventes (%)</span>
            <input type="number" min="0" max="100" step="0.5" [value]="fiscal.settings().vatRate" (change)="setVat($event)" />
          </label>
        </div>
        <p class="hint">
          Les prix sont TTC. Le taux est figé sur chaque vente au moment où elle est faite : une modification ne change
          jamais un ticket déjà imprimé. 0 signifie qu'aucune TVA n'est affichée.
        </p>
      </section>

      <section aria-labelledby="gap-title">
        <h3 id="gap-title" class="group-title">Écart de caisse</h3>
        <div class="form">
          <label class="field">
            <span>Écart toléré sans justification (FCFA)</span>
            <input type="number" min="0" step="100" [value]="fiscal.settings().cashGapThreshold" (change)="setThreshold($event)" />
          </label>
        </div>
        <p class="hint">
          Au-delà de ce montant, la clôture Z exige une justification. Actuellement : {{ fmt(fiscal.settings().cashGapThreshold) }}.
        </p>
      </section>
    </article>
  `,
  styleUrl: './fiscal-settings.component.scss',
})
export class FiscalSettingsComponent {
  readonly fiscal = inject(FiscalSettingsService);

  fmt(amount: number): string {
    return formatFcfa(amount);
  }

  setVat(event: Event): void {
    this.fiscal.update({ vatRate: Number((event.target as HTMLInputElement).value) || 0 });
  }

  setThreshold(event: Event): void {
    this.fiscal.update({ cashGapThreshold: Number((event.target as HTMLInputElement).value) || 0 });
  }
}
