import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { AppId, MODULE_CATEGORIES, getAppDefinition } from '../../core/os/apps';
import { IconComponent } from '../../shared/icon/icon.component';

/**
 * Content of an app window. Until a module is built, it shows the app's purpose and the
 * specification requirements it will cover.
 */
@Component({
  selector: 'app-module-app',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="module">
      <header>
        <span class="badge-icon"><app-icon [name]="app().icon" [size]="34" /></span>
        <div>
          <h2>{{ app().title }}</h2>
          <p>{{ app().description }}</p>
        </div>
      </header>

      <p class="status" [class.outside]="app().scope === 'outside'">
        {{ categoryLabel() }} ·
        @if (app().scope === 'outside') {
          Hors périmètre actuel, à valider
        } @else {
          En conception · phase {{ app().phase }}
        }
      </p>

      <h3>Exigences couvertes</h3>
      <ul>
        @for (id of app().requirements; track id) {
          <li><code>{{ id }}</code></li>
        }
      </ul>

      <p class="note">Cette fenêtre sera branchée au moteur de vente. Détails dans docs/fr/cahier-des-charges.md.</p>
    </article>
  `,
  styleUrl: './module-app.component.scss',
})
export class ModuleAppComponent {
  readonly appId = input.required<AppId>();
  readonly app = computed(() => getAppDefinition(this.appId()));
  readonly categoryLabel = computed(
    () => MODULE_CATEGORIES.find((category) => category.id === this.app().category)?.label ?? '',
  );
}
