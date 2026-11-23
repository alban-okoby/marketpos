import { Injectable, computed, signal } from '@angular/core';

import { DEMO_USERS } from '../session/demo-users';
import { readStored, writeStored } from '../settings/storage';
import { Role, isRole } from './permissions';
import { UserAccount, hashPin, isValidPin, newSalt, parseAccounts } from './user-accounts';

const STORAGE_KEY = 'marketpos.utilisateurs';

function newId(): string {
  return `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * User accounts. The first start creates the demonstration accounts from the seed list, with hashed PINs.
 * The last active manager cannot be removed, demoted or deactivated, so the system can always be administered.
 */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly list = signal<readonly UserAccount[]>([]);
  private readonly loaded: Promise<void>;

  readonly all = this.list.asReadonly();
  readonly active = computed(() => this.list().filter((account) => account.active));

  constructor() {
    this.loaded = this.load();
  }

  /** Resolves once the accounts are loaded, and the seed accounts are hashed on the first start. */
  whenReady(): Promise<void> {
    return this.loaded;
  }

  find(id: string): UserAccount | undefined {
    return this.list().find((account) => account.id === id);
  }

  /** Checks a PIN. Inactive accounts never unlock. */
  async verifyPin(id: string, pin: string): Promise<boolean> {
    const account = this.find(id);
    if (!account || !account.active || !isValidPin(pin)) {
      return false;
    }
    return (await hashPin(pin, account.salt)) === account.pinHash;
  }

  async add(input: { readonly name: string; readonly roleId: Role; readonly pin: string }): Promise<UserAccount> {
    const name = input.name.trim();
    if (name === '') {
      throw new Error('Le nom de l’utilisateur est obligatoire.');
    }
    if (this.list().some((account) => account.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Ce nom existe déjà.');
    }
    if (!isRole(input.roleId)) {
      throw new Error('Rôle inconnu.');
    }
    const salt = newSalt();
    const account: UserAccount = {
      id: newId(),
      name,
      roleId: input.roleId,
      salt,
      pinHash: await this.hashChecked(input.pin, salt),
      active: true,
    };
    this.save([...this.list(), account]);
    return account;
  }

  async setPin(id: string, pin: string): Promise<void> {
    const account = this.require(id);
    const salt = newSalt();
    const pinHash = await this.hashChecked(pin, salt);
    this.save(this.list().map((item) => (item.id === id ? { ...account, salt, pinHash } : item)));
  }

  setRole(id: string, roleId: Role): void {
    const account = this.require(id);
    if (!isRole(roleId)) {
      throw new Error('Rôle inconnu.');
    }
    if (account.roleId === 'gerant' && roleId !== 'gerant') {
      this.ensureAnotherManager(id);
    }
    this.save(this.list().map((item) => (item.id === id ? { ...account, roleId } : item)));
  }

  setActive(id: string, active: boolean): void {
    const account = this.require(id);
    if (!active && account.roleId === 'gerant') {
      this.ensureAnotherManager(id);
    }
    this.save(this.list().map((item) => (item.id === id ? { ...account, active } : item)));
  }

  private require(id: string): UserAccount {
    const account = this.find(id);
    if (!account) {
      throw new Error('Utilisateur inconnu.');
    }
    return account;
  }

  private ensureAnotherManager(id: string): void {
    const others = this.active().filter((account) => account.roleId === 'gerant' && account.id !== id);
    if (others.length === 0) {
      throw new Error('Il doit rester au moins un gérant actif.');
    }
  }

  /** Hashes a PIN with the salt that will be stored next to it. */
  private async hashChecked(pin: string, salt: string): Promise<string> {
    if (!isValidPin(pin)) {
      throw new Error('Le code PIN doit comporter exactement 4 chiffres.');
    }
    return hashPin(pin, salt);
  }

  private save(next: readonly UserAccount[]): void {
    this.list.set(next);
    writeStored(STORAGE_KEY, next);
  }

  private async load(): Promise<void> {
    const stored = readStored(STORAGE_KEY, parseAccounts);
    if (stored.length > 0) {
      this.list.set(stored);
      return;
    }
    const seeded: UserAccount[] = [];
    for (const demo of DEMO_USERS) {
      const salt = newSalt();
      seeded.push({ id: demo.id, name: demo.name, roleId: demo.roleId, salt, pinHash: await hashPin(demo.pin, salt), active: true });
    }
    this.list.set(seeded);
    writeStored(STORAGE_KEY, seeded);
  }
}
