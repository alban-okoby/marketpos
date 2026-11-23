import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { IconComponent } from '../../shared/icon/icon.component';
import { DisplaySettingsComponent } from './sections/display-settings.component';
import { FiscalSettingsComponent } from './sections/fiscal-settings.component';
import { ModulesSettingsComponent } from './sections/modules-settings.component';
import { RightsSettingsComponent } from './sections/rights-settings.component';
import { SecuritySettingsComponent } from './sections/security-settings.component';
import { ShopSettingsComponent } from './sections/shop-settings.component';
import { TaskbarSettingsComponent } from './sections/taskbar-settings.component';
import { SettingsSectionId, filterSettingsSections } from './settings-sections';

/**
 * Settings window, in the style of Windows 11 and macOS: a sidebar with a search field and the list of pages,
 * and the selected page in the content area.
 */
@Component({
  selector: 'app-settings-app',
  imports: [
    IconComponent,
    DisplaySettingsComponent,
    TaskbarSettingsComponent,
    ModulesSettingsComponent,
    ShopSettingsComponent,
    FiscalSettingsComponent,
    SecuritySettingsComponent,
    RightsSettingsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout">
      <nav class="sidebar" aria-label="Catégories des paramètres">
        <h2 class="sidebar-title">Paramètres</h2>

        <label class="search">
          <app-icon name="search" [size]="16" />
          <input
            type="search"
            placeholder="Rechercher"
            aria-label="Rechercher un paramètre"
            [value]="query()"
            (input)="onSearch($event)"
            (keydown.escape)="query.set('')"
          />
        </label>

        <ul class="nav">
          @for (section of visibleSections(); track section.id) {
            <li>
              <button
                type="button"
                class="nav-item"
                [class.active]="current() === section.id"
                [attr.aria-current]="current() === section.id ? 'page' : null"
                (click)="select(section.id)"
              >
                <app-icon [name]="section.icon" [size]="20" />
                <span>{{ section.label }}</span>
              </button>
            </li>
          } @empty {
            <li class="empty">Aucun paramètre ne correspond.</li>
          }
        </ul>
      </nav>

      <div class="content">
        @switch (current()) {
          @case ('display') {
            <app-display-settings />
          }
          @case ('taskbar') {
            <app-taskbar-settings />
          }
          @case ('modules') {
            <app-modules-settings />
          }
          @case ('boutique') {
            <app-shop-settings />
          }
          @case ('fiscalite') {
            <app-fiscal-settings />
          }
          @case ('securite') {
            <app-security-settings />
          }
          @case ('droits') {
            <app-rights-settings />
          }
        }
      </div>
    </div>
  `,
  styleUrl: './settings-app.component.scss',
})
export class SettingsAppComponent {
  readonly current = signal<SettingsSectionId>('display');
  readonly query = signal('');
  readonly visibleSections = computed(() => filterSettingsSections(this.query()));

  select(id: SettingsSectionId): void {
    this.current.set(id);
  }

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
