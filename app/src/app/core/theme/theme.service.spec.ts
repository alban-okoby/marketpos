import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let theme: ThemeService;

  beforeEach(() => {
    localStorage.removeItem('marketpos.theme');
    TestBed.configureTestingModule({});
    theme = TestBed.inject(ThemeService);
  });

  it('defaults to following the system setting', () => {
    expect(theme.preference()).toBe('system');
  });

  it('resolves to the explicit choice when light or dark is picked', () => {
    theme.setPreference('light');
    expect(theme.resolved()).toBe('light');

    theme.setPreference('dark');
    expect(theme.resolved()).toBe('dark');
  });

  it('saves the choice so it survives a reload', () => {
    theme.setPreference('dark');
    expect(localStorage.getItem('marketpos.theme')).toBe('dark');
  });
});
