import { describe, expect, it } from 'vitest';

import { SETTINGS_SECTIONS, filterSettingsSections } from './settings-sections';

describe('filterSettingsSections', () => {
  it('returns every page when the search is empty', () => {
    expect(filterSettingsSections('  ')).toEqual(SETTINGS_SECTIONS);
  });

  it('matches labels and keywords, ignoring case and accents', () => {
    expect(filterSettingsSections('BARRE').map((s) => s.id)).toEqual(['taskbar']);
    expect(filterSettingsSections('couleur').map((s) => s.id)).toEqual(['display']);
    expect(filterSettingsSections('accentuation').map((s) => s.id)).toEqual(['display']);
  });

  it('returns nothing when no page matches', () => {
    expect(filterSettingsSections('zzz')).toEqual([]);
  });
});
