import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ThemePreference, ThemeService } from '../../core/theme/theme.service';
import {
  TaskbarAlignment,
  TaskbarPosition,
  TaskbarSettingsService,
} from '../../core/taskbar/taskbar-settings.service';

interface ThemeOption {
  readonly value: ThemePreference;
  readonly label: string;
  readonly hint: string;
}

interface TaskbarPositionOption {
  readonly value: TaskbarPosition;
  readonly label: string;
  readonly hint: string;
}

interface TaskbarAlignmentOption {
  readonly value: TaskbarAlignment;
  readonly label: string;
  readonly hint: string;
}

/** Settings window: appearance (theme) and taskbar sections. */
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

      <section aria-labelledby="taskbar-title">
        <h3 id="taskbar-title">Barre des tâches</h3>
        <p class="hint">Où la barre apparaît sur l'écran, comment ses éléments sont placés, et si elle se cache.</p>

        <h4 class="group-title" id="taskbar-position-title">Position</h4>
        <div class="options" role="radiogroup" aria-labelledby="taskbar-position-title">
          @for (option of positionOptions; track option.value) {
            <button
              type="button"
              role="radio"
              class="option option-compact"
              [class.selected]="taskbar.position() === option.value"
              [attr.aria-checked]="taskbar.position() === option.value"
              (click)="taskbar.update({ position: option.value })"
            >
              <span class="option-label">{{ option.label }}</span>
              <span class="option-hint">{{ option.hint }}</span>
            </button>
          }
        </div>

        <h4 class="group-title" id="taskbar-alignment-title">Alignement des éléments</h4>
        <div class="options options-two" role="radiogroup" aria-labelledby="taskbar-alignment-title">
          @for (option of alignmentOptions; track option.value) {
            <button
              type="button"
              role="radio"
              class="option option-compact"
              [class.selected]="taskbar.alignment() === option.value"
              [attr.aria-checked]="taskbar.alignment() === option.value"
              (click)="taskbar.update({ alignment: option.value })"
            >
              <span class="option-label">{{ option.label }}</span>
              <span class="option-hint">{{ option.hint }}</span>
            </button>
          }
        </div>

        <div class="switch-row">
          <div>
            <span class="option-label" id="autohide-label">Masquer automatiquement</span>
            <span class="option-hint">La barre glisse hors de l'écran. Approchez le bord pour la faire réapparaître.</span>
          </div>
          <button
            type="button"
            role="switch"
            class="switch"
            [class.on]="taskbar.autoHide()"
            [attr.aria-checked]="taskbar.autoHide()"
            aria-labelledby="autohide-label"
            (click)="taskbar.update({ autoHide: !taskbar.autoHide() })"
          >
            <span class="knob"></span>
          </button>
        </div>
      </section>
    </article>
  `,
  styleUrl: './settings-app.component.scss',
})
export class SettingsAppComponent {
  readonly theme = inject(ThemeService);
  readonly taskbar = inject(TaskbarSettingsService);

  readonly themeOptions: readonly ThemeOption[] = [
    { value: 'system', label: 'Automatique', hint: 'Suit le système' },
    { value: 'light', label: 'Clair', hint: 'Toujours clair' },
    { value: 'dark', label: 'Sombre', hint: 'Toujours sombre' },
  ];

  readonly positionOptions: readonly TaskbarPositionOption[] = [
    { value: 'bottom', label: 'Bas', hint: 'Par défaut' },
    { value: 'top', label: 'Haut', hint: 'En haut de l\'écran' },
    { value: 'left', label: 'Gauche', hint: 'Colonne à gauche' },
    { value: 'right', label: 'Droite', hint: 'Colonne à droite' },
  ];

  readonly alignmentOptions: readonly TaskbarAlignmentOption[] = [
    { value: 'center', label: 'Centrée', hint: 'Éléments au milieu' },
    { value: 'start', label: 'Au début', hint: 'Collés au bord de départ' },
  ];

  readonly currentLabel = computed(() => (this.theme.resolved() === 'dark' ? 'sombre' : 'clair'));
}
