import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { hashPin, isValidPin, newSalt, parseAccounts } from './user-accounts';
import { UsersService } from './users.service';

describe('PIN hashing', () => {
  it('gives the same hash for the same PIN and salt, and a different one with another salt', async () => {
    const salt = newSalt();
    expect(await hashPin('1234', salt)).toBe(await hashPin('1234', salt));
    expect(await hashPin('1234', salt)).not.toBe(await hashPin('1234', newSalt()));
  });

  it('never stores the PIN itself, and accepts only four digits', async () => {
    const hash = await hashPin('1234', newSalt());
    expect(hash).not.toContain('1234');
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('12a4')).toBe(false);
    expect(isValidPin('123')).toBe(false);
  });

  it('drops invalid saved accounts', () => {
    expect(parseAccounts([{ id: 'x', name: 'y', roleId: 'pirate' }])).toEqual([]);
    expect(parseAccounts('nope')).toEqual([]);
  });
});

describe('UsersService', () => {
  let users: UsersService;

  beforeEach(async () => {
    localStorage.removeItem('marketpos.utilisateurs');
    TestBed.configureTestingModule({});
    users = TestBed.inject(UsersService);
    await users.whenReady();
  });

  it('seeds the demonstration accounts with hashed PINs on first start', async () => {
    expect(users.active().map((account) => account.id)).toEqual(['caissier1', 'caissier2', 'gerant']);
    expect(users.find('gerant')?.pinHash).not.toBe('9999');
    expect(await users.verifyPin('gerant', '9999')).toBe(true);
  });

  it('creates an account that can unlock with its PIN', async () => {
    const account = await users.add({ name: 'Comptable 1', roleId: 'comptable', pin: '4321' });
    expect(await users.verifyPin(account.id, '4321')).toBe(true);
    expect(await users.verifyPin(account.id, '0000')).toBe(false);
  });

  it('refuses a duplicate name and a PIN that is not four digits', async () => {
    await expect(users.add({ name: 'gérant', roleId: 'caissier', pin: '1111' })).rejects.toThrowError(/existe déjà/);
    await expect(users.add({ name: 'Nouveau', roleId: 'caissier', pin: '12' })).rejects.toThrowError(/4 chiffres/);
  });

  it('changes a PIN, and the old one stops working', async () => {
    await users.setPin('caissier1', '5678');
    expect(await users.verifyPin('caissier1', '1111')).toBe(false);
    expect(await users.verifyPin('caissier1', '5678')).toBe(true);
  });

  it('deactivated accounts cannot unlock', async () => {
    users.setActive('caissier2', false);
    expect(await users.verifyPin('caissier2', '2222')).toBe(false);
    expect(users.active().map((account) => account.id)).not.toContain('caissier2');
  });

  it('never leaves the system without an active manager', () => {
    expect(() => users.setActive('gerant', false)).toThrowError(/au moins un gérant/);
    expect(() => users.setRole('gerant', 'caissier')).toThrowError(/au moins un gérant/);
  });
});
