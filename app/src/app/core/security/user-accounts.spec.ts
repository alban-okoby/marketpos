import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { SecuritySettingsService } from '../settings/security.service';
import { hashSecret, isValidPassword, isValidPin, newSalt, normalizeLogin, parseAccounts } from './user-accounts';
import { UsersService } from './users.service';

describe('secret hashing', () => {
  it('gives the same hash for the same secret and salt, and a different one with another salt', async () => {
    const salt = newSalt();
    expect(await hashSecret('1234', salt)).toBe(await hashSecret('1234', salt));
    expect(await hashSecret('1234', salt)).not.toBe(await hashSecret('1234', newSalt()));
  });

  it('never stores the secret itself, and accepts only four digits for a PIN', async () => {
    const hash = await hashSecret('1234', newSalt());
    expect(hash).not.toContain('1234');
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('12a4')).toBe(false);
    expect(isValidPin('123')).toBe(false);
  });

  it('drops invalid saved accounts', () => {
    expect(parseAccounts([{ id: 'x', name: 'y', roleId: 'pirate' }])).toEqual([]);
    expect(parseAccounts('nope')).toEqual([]);
  });

  it('drops accounts saved before identifiants and passwords existed', () => {
    const old = { id: 'x', name: 'y', roleId: 'caissier', salt: 'a', pinHash: 'b', active: true };
    expect(parseAccounts([old])).toEqual([]);
  });
});

describe('identifiant and password rules', () => {
  it('normalises an identifiant and rejects a bad format', () => {
    expect(normalizeLogin('  Caissier.1 ')).toBe('caissier.1');
    expect(normalizeLogin('ab')).toBeNull();
    expect(normalizeLogin('nom avec espace')).toBeNull();
    expect(normalizeLogin('')).toBeNull();
  });

  it('requires the minimum length, and refuses a password made only of spaces', () => {
    expect(isValidPassword('motdepasse', 8)).toBe(true);
    expect(isValidPassword('court', 8)).toBe(false);
    expect(isValidPassword('          ', 4)).toBe(false);
  });
});

describe('UsersService', () => {
  let users: UsersService;
  let security: SecuritySettingsService;

  beforeEach(async () => {
    localStorage.removeItem('marketpos.utilisateurs');
    localStorage.removeItem('marketpos.securite');
    TestBed.configureTestingModule({});
    users = TestBed.inject(UsersService);
    security = TestBed.inject(SecuritySettingsService);
    await users.whenReady();
  });

  it('seeds the demonstration accounts with hashed secrets on first start', async () => {
    expect(users.active().map((account) => account.id)).toEqual(['caissier1', 'caissier2', 'gerant']);
    expect(users.find('gerant')?.passwordHash).not.toBe('gerant-9999');
    expect(users.find('gerant')?.pinHash).not.toBe('9999');
    expect(await users.verifyPin('gerant', '9999')).toBe(true);
  });

  it('signs in with the identifiant and password, ignoring case', async () => {
    expect(await users.checkPassword('caissier1', 'caisse-1111')).toBe('caissier1');
    expect(await users.checkPassword('CAISSIER1', 'caisse-1111')).toBe('caissier1');
    expect(await users.checkPassword('caissier1', 'caisse-2222')).toBeNull();
    expect(await users.checkPassword('inconnu', 'caisse-1111')).toBeNull();
    expect(await users.checkPassword('caissier1', '')).toBeNull();
  });

  it('creates an account that signs in with its identifiant and password, and keeps its PIN', async () => {
    const account = await users.add({
      name: 'Comptable 1',
      login: 'comptable1',
      roleId: 'comptable',
      password: 'compta-2026',
      pin: '4321',
    });
    expect(account.login).toBe('comptable1');
    expect(await users.checkPassword('comptable1', 'compta-2026')).toBe(account.id);
    expect(await users.checkPassword(account.id, 'compta-2026')).toBeNull();
    expect(await users.verifyPin(account.id, '4321')).toBe(true);
  });

  it('refuses a duplicate name, a duplicate identifiant, a bad identifiant and a short password', async () => {
    const base = { roleId: 'caissier' as const, pin: '1111', password: 'motdepasse' };
    await expect(users.add({ ...base, name: 'gérant', login: 'nouveau' })).rejects.toThrowError(/existe déjà/);
    await expect(users.add({ ...base, name: 'Nouveau', login: 'caissier1' })).rejects.toThrowError(/identifiant existe déjà/);
    await expect(users.add({ ...base, name: 'Nouveau', login: 'a b' })).rejects.toThrowError(/identifiant doit/);
    await expect(users.add({ ...base, name: 'Nouveau', login: 'nouveau', password: 'court' })).rejects.toThrowError(/au moins 8/);
    await expect(users.add({ ...base, name: 'Nouveau', login: 'nouveau', pin: '12' })).rejects.toThrowError(/4 chiffres/);
  });

  it('applies the minimum password length from the Sécurité settings', async () => {
    security.update({ minPasswordLength: 12 });
    await expect(users.setPassword('caissier1', 'onze-chars')).rejects.toThrowError(/au moins 12/);
    await users.setPassword('caissier1', 'douze-chars!');
    expect(await users.checkPassword('caissier1', 'douze-chars!')).toBe('caissier1');
  });

  it('changes a password, and the old one stops working', async () => {
    await users.setPassword('caissier1', 'nouveau-mdp');
    expect(await users.checkPassword('caissier1', 'caisse-1111')).toBeNull();
    expect(await users.checkPassword('caissier1', 'nouveau-mdp')).toBe('caissier1');
  });

  it('changes a PIN, and the old one stops working', async () => {
    await users.setPin('caissier1', '5678');
    expect(await users.verifyPin('caissier1', '1111')).toBe(false);
    expect(await users.verifyPin('caissier1', '5678')).toBe(true);
  });

  it('deactivated accounts cannot sign in or unlock', async () => {
    users.setActive('caissier2', false);
    expect(await users.checkPassword('caissier2', 'caisse-2222')).toBeNull();
    expect(await users.verifyPin('caissier2', '2222')).toBe(false);
    expect(users.active().map((account) => account.id)).not.toContain('caissier2');
  });

  it('never leaves the system without an active manager', () => {
    expect(() => users.setActive('gerant', false)).toThrowError(/au moins un gérant/);
    expect(() => users.setRole('gerant', 'caissier')).toThrowError(/au moins un gérant/);
  });
});
