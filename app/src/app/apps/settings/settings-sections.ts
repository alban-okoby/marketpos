import { IconName } from '../../shared/icon/icon.component';

export type SettingsSectionId = 'display' | 'taskbar';

/**
 * Sidebar entries of the Settings app, in display order. Add a new page here and in the
 * component map in SettingsAppComponent.
 */
export interface SettingsSection {
  readonly id: SettingsSectionId;
  readonly label: string;
  readonly icon: IconName;
}

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  { id: 'display', label: 'Affichage', icon: 'display' },
  { id: 'taskbar', label: 'Barre des tâches', icon: 'taskbar' },
];
