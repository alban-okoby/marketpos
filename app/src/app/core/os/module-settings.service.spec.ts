import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { APPS, AppId } from './apps';
import {
  ModuleSettingsService,
  defaultEnabledModules,
  parseEnabledModules,
  withModuleDisabled,
  withModuleEnabled,
} from './module-settings.service';

describe('module catalogue', () => {
  it('has unique ids and known requirements', () => {
    const ids = APPS.map((app) => app.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const app of APPS) {
      for (const required of app.requires) {
        expect(ids).toContain(required);
      }
    }
  });

  it('enables only in-scope phase 1 modules by default, plus the core', () => {
    const defaults = defaultEnabledModules();
    expect(defaults.has('caisse')).toBe(true);
    expect(defaults.has('parametres')).toBe(true);
    expect(defaults.has('comptabilite')).toBe(false);
    expect(defaults.has('rh')).toBe(false);
  });
});

describe('withModuleEnabled and withModuleDisabled', () => {
  it('enables the requirements of a module first', () => {
    const next = withModuleEnabled(new Set<AppId>(['parametres']), 'comptabilite');
    expect([...next].sort()).toEqual(['caisse', 'comptabilite', 'fiscalite', 'parametres'].sort());
  });

  it('disables the modules that depend on the one turned off', () => {
    const next = withModuleDisabled(new Set<AppId>(['caisse', 'cloture', 'fiscalite', 'comptabilite', 'stock']), 'caisse');
    expect([...next].sort()).toEqual(['stock']);
  });

  it('never disables a core module', () => {
    const before = new Set<AppId>(['parametres', 'caisse']);
    expect(withModuleDisabled(before, 'parametres').has('parametres')).toBe(true);
  });
});

describe('parseEnabledModules', () => {
  it('falls back to the defaults for invalid data', () => {
    expect(parseEnabledModules('nope')).toEqual(defaultEnabledModules());
  });

  it('drops unknown ids and always keeps the core', () => {
    const parsed = parseEnabledModules(['stock', 'unknown']);
    expect(parsed.has('stock')).toBe(true);
    expect(parsed.has('parametres')).toBe(true);
    expect(parsed.has('unknown' as AppId)).toBe(false);
  });
});

describe('ModuleSettingsService', () => {
  let modules: ModuleSettingsService;

  beforeEach(() => {
    localStorage.removeItem('marketpos.modules');
    TestBed.configureTestingModule({});
    modules = TestBed.inject(ModuleSettingsService);
    modules.setEnabled('rh', false);
  });

  it('reports which modules were switched on or off', () => {
    // Fiscalité is on by default; turn it off so enabling Comptabilité must turn it back on.
    modules.setEnabled('fiscalite', false);
    const change = modules.setEnabled('comptabilite', true);
    expect(change.enabled).toEqual(expect.arrayContaining(['comptabilite', 'fiscalite']));
    expect(change.disabled).toEqual([]);
    expect(modules.isEnabled('comptabilite')).toBe(true);
  });

  it('saves the list so it survives a reload', () => {
    modules.setEnabled('sauvegarde', true);
    expect(JSON.parse(localStorage.getItem('marketpos.modules') ?? '[]')).toContain('sauvegarde');
  });
});
