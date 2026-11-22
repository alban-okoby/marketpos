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
  /** Extra words the search matches, such as the settings a page contains. */
  readonly keywords: string;
}

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  {
    id: 'display',
    label: 'Affichage',
    icon: 'display',
    keywords: 'thème clair sombre automatique couleur accentuation accent apparence',
  },
  {
    id: 'taskbar',
    label: 'Barre des tâches',
    icon: 'taskbar',
    keywords: 'barre position haut bas gauche droite alignement masquer automatiquement',
  },
];

/** Sections whose label or keywords match the search text (case and accents ignored). */
export function filterSettingsSections(query: string): readonly SettingsSection[] {
  const term = normalize(query);
  if (!term) {
    return SETTINGS_SECTIONS;
  }
  return SETTINGS_SECTIONS.filter((section) => normalize(`${section.label} ${section.keywords}`).includes(term));
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
