import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import {
  TaskbarAlignment,
  TaskbarPosition,
  TaskbarSettingsService,
} from '../../../core/taskbar/taskbar-settings.service';

interface PositionOption {
  readonly value: TaskbarPosition;
  readonly label: string;
  readonly hint: string;
}

interface AlignmentOption {
  readonly value: TaskbarAlignment;
  readonly label: string;
  readonly hint: string;
}

/** Settings page "Barre des tâches": position, alignment and auto-hide. */
@Component({
  selector: 'app-taskbar-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="page">
      <header>
        <h2>Barre des tâches</h2>
        <p class="subtitle">Où la barre apparaît, comment ses éléments sont placés, et si elle se cache.</p>
      </header>

      <section aria-labelledby="position-title">
        <h3 id="position-title" class="group-title">Position</h3>
        <div class="options" role="radiogroup" aria-labelledby="position-title">
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
      </section>

      <section aria-labelledby="alignment-title">
        <h3 id="alignment-title" class="group-title">Alignement des éléments</h3>
        <div class="options options-two" role="radiogroup" aria-labelledby="alignment-title">
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
      </section>

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
    </article>
  `,
  styleUrl: './taskbar-settings.component.scss',
})
export class TaskbarSettingsComponent {
  readonly taskbar = inject(TaskbarSettingsService);

  readonly positionOptions: readonly PositionOption[] = [
    { value: 'bottom', label: 'Bas', hint: 'Par défaut' },
    { value: 'top', label: 'Haut', hint: 'En haut de l\'écran' },
    { value: 'left', label: 'Gauche', hint: 'Colonne à gauche' },
    { value: 'right', label: 'Droite', hint: 'Colonne à droite' },
  ];

  readonly alignmentOptions: readonly AlignmentOption[] = [
    { value: 'center', label: 'Centrée', hint: 'Éléments au milieu' },
    { value: 'start', label: 'Au début', hint: 'Collés au bord de départ' },
  ];
}
