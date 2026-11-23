import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { SessionService } from '../session/session.service';
import { UsersService } from './users.service';
import { DEFAULT_PERMISSIONS, parsePermissions, roleCan } from './permissions';
import { PermissionsService } from './permissions.service';

describe('role rights', () => {
  it('gives the cashier sales and X report only, and the manager everything', () => {
    expect(roleCan(DEFAULT_PERMISSIONS, 'caissier', 'vendre')).toBe(true);
    expect(roleCan(DEFAULT_PERMISSIONS, 'caissier', 'cloture-z')).toBe(false);
    expect(roleCan(DEFAULT_PERMISSIONS, 'gerant', 'cloture-z')).toBe(true);
    expect(roleCan(DEFAULT_PERMISSIONS, 'comptable', 'exporter')).toBe(true);
    expect(roleCan(DEFAULT_PERMISSIONS, 'comptable', 'vendre')).toBe(false);
  });

  it('keeps the settings right for the manager and the administrator, even when saved without it', () => {
    const parsed = parsePermissions({ gerant: ['vendre'], administrateur: [] });
    expect(parsed.gerant).toContain('parametres');
    expect(parsed.administrateur).toContain('parametres');
  });

  it('ignores unknown actions and falls back to defaults for missing roles', () => {
    const parsed = parsePermissions({ caissier: ['vendre', 'voler'] });
    expect(parsed.caissier).toEqual(['vendre']);
    expect(parsed.comptable).toEqual(DEFAULT_PERMISSIONS.comptable);
  });
});

describe('PermissionsService', () => {
  let permissions: PermissionsService;
  let session: SessionService;

  beforeEach(async () => {
    localStorage.removeItem('marketpos.droits');
    localStorage.removeItem('marketpos.utilisateurs');
    TestBed.configureTestingModule({});
    await TestBed.inject(UsersService).whenReady();
    session = TestBed.inject(SessionService);
    permissions = TestBed.inject(PermissionsService);
  });

  it('gives nobody any right while no one is signed in', () => {
    expect(permissions.can('vendre')).toBe(false);
  });

  it('checks the rights of the signed-in user', () => {
    session.unlock('caissier1');
    expect(permissions.can('vendre')).toBe(true);
    expect(permissions.can('cloture-z')).toBe(false);
  });

  it('refuses rights changes from a user without the settings right', () => {
    session.unlock('caissier1');
    expect(() => permissions.set('caissier', 'cloture-z', true)).toThrowError(/ne permet pas/);
  });

  it('lets the manager change rights, but not remove its own settings access', () => {
    session.unlock('gerant');
    permissions.set('caissier', 'exporter', true);
    expect(permissions.roleCan('caissier', 'exporter')).toBe(true);
    expect(() => permissions.set('gerant', 'parametres', false)).toThrowError(/accès aux paramètres/);
  });
});
