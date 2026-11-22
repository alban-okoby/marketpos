import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { IconComponent } from '../../shared/icon/icon.component';
import { DisplaySettingsComponent } from './sections/display-settings.component';
import { TaskbarSettingsComponent } from './sections/taskbar-settings.component';
import { SETTINGS_SECTIONS, SettingsSectionId } from './settings-sections';

/**
 * Settings window, in the style of Windows 11 and macOS: a sidebar lists the pages,
 * and the selected page fills the content area.
 */
@Component({
  selector: 'app-settings-app',
  imports: [IconComponent, DisplaySettingsComponent, TaskbarSettingsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout">
      <nav class="sidebar" aria-label="Catégories des paramètres">
        <h2 class="sidebar-title">Paramètres</h2>
        <ul class="nav">
          @for (section of sections; track section.id) {
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
        }
      </div>
    </div>
  `,
  styleUrl: './settings-app.component.scss',
})
export class SettingsAppComponent {
  readonly sections = SETTINGS_SECTIONS;
  readonly current = signal<SettingsSectionId>('display');

  select(id: SettingsSectionId): void {
    this.current.set(id);
  }
}
