import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ThemePreference, ThemeService } from '../../../core/theme/theme.service';

interface ThemeOption {
  readonly value: ThemePreference;
  readonly label: string;
  readonly hint: string;
}

/** Settings page "Affichage": the theme. */
@Component({
  selector: 'app-display-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="page">
      <header>
        <h2>Affichage</h2>
        <p class="subtitle">Thème et apparence de MarketPOS</p>
      </header>

      <section aria-labelledby="theme-title">
        <h3 id="theme-title">Thème</h3>
        <p class="hint">
          « Automatique » suit le réglage du système (clair ou sombre). Le choix est mémorisé sur cet appareil.
        </p>

        <div class="options" role="radiogroup" aria-labelledby="theme-title">
          @for (option of themeOptions; track option.value) {
            <button
              type="button"
              role="radio"
              class="option"
              [class.selected]="theme.preference() === option.value"
              [attr.aria-checked]="theme.preference() === option.value"
              (click)="theme.setPreference(option.value)"
            >
              <span class="swatch" [attr.data-kind]="option.value" aria-hidden="true"></span>
              <span class="option-label">{{ option.label }}</span>
              <span class="option-hint">{{ option.hint }}</span>
            </button>
          }
        </div>

        <p class="current" aria-live="polite">Thème affiché : {{ currentLabel() }}</p>
      </section>
    </article>
  `,
  styleUrl: './display-settings.component.scss',
})
export class DisplaySettingsComponent {
  readonly theme = inject(ThemeService);

  readonly themeOptions: readonly ThemeOption[] = [
    { value: 'system', label: 'Automatique', hint: 'Suit le système' },
    { value: 'light', label: 'Clair', hint: 'Toujours clair' },
    { value: 'dark', label: 'Sombre', hint: 'Toujours sombre' },
  ];

  readonly currentLabel = computed(() => (this.theme.resolved() === 'dark' ? 'sombre' : 'clair'));
}
