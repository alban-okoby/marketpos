import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { APPS, AppDefinition, AppId, MODULE_CATEGORIES, ModuleCategoryDefinition } from '../../../core/os/apps';
import { ModuleSettingsService } from '../../../core/os/module-settings.service';
import { WindowManagerService } from '../../../core/os/window-manager.service';
import { PermissionsService } from '../../../core/security/permissions.service';
import { IconComponent } from '../../../shared/icon/icon.component';

interface CategoryGroup {
  readonly category: ModuleCategoryDefinition;
  readonly apps: readonly AppDefinition[];
}

/**
 * Settings page "Modules": switch on only the modules the shop needs.
 * Turning a module off closes its window and turns off the modules that need it.
 */
@Component({
  selector: 'app-modules-settings',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="page">
      <header>
        <h2>Modules</h2>
        <p class="subtitle">
          Activez les modules dont vous avez besoin. Le bureau et le menu Démarrer n'affichent que les modules actifs.
        </p>
      </header>

      <div class="summary">
        <span class="count" aria-live="polite">{{ enabledCount() }} sur {{ total }} modules actifs</span>
        <button type="button" class="reset" (click)="resetToDefaults()">Revenir au socle MVP</button>
      </div>

      @for (group of groups(); track group.category.id) {
        <section [attr.aria-labelledby]="'group-' + group.category.id">
          <h3 class="group-title" [id]="'group-' + group.category.id">{{ group.category.label }}</h3>
          <ul class="rows">
            @for (app of group.apps; track app.id) {
              <li class="row">
                <span class="row-icon"><app-icon [name]="app.icon" [size]="26" /></span>

                <div class="row-text">
                  <span class="option-label">{{ app.title }}</span>
                  <span class="option-hint">{{ app.description }}</span>
                  <span class="meta">
                    @if (app.core) {
                      <span class="badge">Toujours actif</span>
                    }
                    @if (app.requires.length > 0) {
                      <span class="requires">Nécessite : {{ requiresLabel(app) }}</span>
                    }
                  </span>
                </div>

                <button
                  type="button"
                  role="switch"
                  class="switch"
                  [class.on]="modules.isEnabled(app.id)"
                  [attr.aria-checked]="modules.isEnabled(app.id)"
                  [attr.aria-label]="'Activer ' + app.title"
                  [disabled]="app.core || !permissions.can('modules')"
                  (click)="toggle(app.id)"
                >
                  <span class="knob"></span>
                </button>
              </li>
            }
          </ul>
        </section>
      }
    </article>
  `,
  styleUrl: './modules-settings.component.scss',
})
export class ModulesSettingsComponent {
  readonly modules = inject(ModuleSettingsService);
  private readonly wm = inject(WindowManagerService);
  readonly permissions = inject(PermissionsService);

  readonly total = APPS.length;
  readonly enabledCount = computed(() => this.modules.enabledApps().length);

  readonly groups = computed<readonly CategoryGroup[]>(() =>
    MODULE_CATEGORIES.map((category) => ({
      category,
      apps: APPS.filter((app) => app.category === category.id),
    })).filter((group) => group.apps.length > 0),
  );

  requiresLabel(app: AppDefinition): string {
    return app.requires.map((id) => APPS.find((candidate) => candidate.id === id)?.title ?? id).join(', ');
  }

  toggle(appId: AppId): void {
    if (!this.permissions.can('modules')) {
      return;
    }
    const change = this.modules.setEnabled(appId, !this.modules.isEnabled(appId));
    change.disabled.forEach((id) => this.wm.closeApp(id));
  }

  resetToDefaults(): void {
    if (!this.permissions.can('modules')) {
      return;
    }
    const change = this.modules.resetToDefaults();
    change.disabled.forEach((id) => this.wm.closeApp(id));
  }
}
