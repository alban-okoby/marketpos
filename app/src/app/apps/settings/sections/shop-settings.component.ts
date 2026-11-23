import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PaperWidth, ShopService, ShopSettings } from '../../../core/settings/shop.service';

interface TextField {
  readonly key: keyof ShopSettings;
  readonly label: string;
}

/** Settings page "Boutique et ticket": shop identity printed on receipts, and paper width. */
@Component({
  selector: 'app-shop-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="page">
      <header>
        <h2>Boutique et ticket</h2>
        <p class="subtitle">Ces informations figurent en tête et en pied de chaque ticket.</p>
      </header>

      <section aria-labelledby="identity-title">
        <h3 id="identity-title" class="group-title">Identité</h3>
        <div class="form">
          @for (field of identityFields; track field.key) {
            <label class="field">
              <span>{{ field.label }}</span>
              <input type="text" [value]="shop.settings()[field.key]" (change)="save(field.key, $event)" />
            </label>
          }
        </div>
      </section>

      <section aria-labelledby="receipt-title">
        <h3 id="receipt-title" class="group-title">Ticket</h3>
        <div class="form">
          <label class="field">
            <span>Message de pied de ticket</span>
            <input type="text" [value]="shop.settings().footer" (change)="save('footer', $event)" />
          </label>
        </div>

        <h4 class="sub-title" id="paper-title">Largeur du papier</h4>
        <div class="options options-two" role="radiogroup" aria-labelledby="paper-title">
          @for (width of widths; track width) {
            <button
              type="button"
              role="radio"
              class="option option-compact"
              [class.selected]="shop.settings().paperWidth === width"
              [attr.aria-checked]="shop.settings().paperWidth === width"
              (click)="shop.update({ paperWidth: width })"
            >
              <span class="option-label">{{ width }} mm</span>
              <span class="option-hint">{{ width === 80 ? 'Ticket large' : 'Ticket compact' }}</span>
            </button>
          }
        </div>
      </section>
    </article>
  `,
  styleUrl: './shop-settings.component.scss',
})
export class ShopSettingsComponent {
  readonly shop = inject(ShopService);
  readonly widths: readonly PaperWidth[] = [80, 58];

  readonly identityFields: readonly TextField[] = [
    { key: 'name', label: 'Nom du commerce' },
    { key: 'address', label: 'Adresse' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'taxId', label: 'NIF' },
    { key: 'tradeRegister', label: 'RCCM' },
  ];

  save(key: keyof ShopSettings, event: Event): void {
    this.shop.update({ [key]: (event.target as HTMLInputElement).value } as Partial<ShopSettings>);
  }
}
