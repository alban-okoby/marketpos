import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ThemePreference, ThemeService } from '../../core/theme/theme.service';

interface ThemeOption {
  readonly value: ThemePreference;
  readonly label: string;
  readonly hint: string;
}

/** Settings window. Currently holds the appearance (theme) section; more sections come with the modules. */
@Component({
  selector: 'app-settings-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="settings">
      <header>
        <h2>Paramètres</h2>
        <p class="subtitle">Préférences de MarketPOS sur cet appareil</p>
      </header>

      <section aria-labelledby="appearance-title">
        <h3 id="appearance-title">Apparence</h3>
        <p class="hint">
          « Automatique » suit le réglage du système (clair ou sombre). Le choix est mémorisé sur cet appareil.
        </p>

        <div class="options" role="radiogroup" aria-labelledby="appearance-title">
          @for (option of options; track option.value) {
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
  styleUrl: './settings-app.component.scss',
})
export class SettingsAppComponent {
  readonly theme = inject(ThemeService);

  readonly options: readonly ThemeOption[] = [
    { value: 'system', label: 'Automatique', hint: 'Suit le système' },
    { value: 'light', label: 'Clair', hint: 'Toujours clair' },
    { value: 'dark', label: 'Sombre', hint: 'Toujours sombre' },
  ];

  readonly currentLabel = computed(() => (this.theme.resolved() === 'dark' ? 'sombre' : 'clair'));
}
