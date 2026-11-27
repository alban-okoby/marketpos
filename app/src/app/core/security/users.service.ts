import { Injectable, computed, inject, signal } from '@angular/core';

import { DEMO_USERS } from '../session/demo-users';
import { SecuritySettingsService } from '../settings/security.service';
import { readStored, writeStored } from '../settings/storage';
import { Role, isRole } from './permissions';
import {
  UserAccount,
  hashSecret,
  isValidPassword,
  isValidPin,
  newSalt,
  normalizeLogin,
  parseAccounts,
} from './user-accounts';

const STORAGE_KEY = 'marketpos.utilisateurs';

function newId(): string {
  return `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * User accounts. The first start creates the demonstration accounts from the seed list, with hashed secrets.
 * Each account has an identifiant and a password (sign-in) and a PIN (manager authorisations).
 * The last active manager cannot be removed, demoted or deactivated, so the system can always be administered.
 */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly security = inject(SecuritySettingsService);
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

  /** Account with this identifiant, ignoring case and spaces. */
  findByLogin(login: string): UserAccount | undefined {
    const value = login.trim().toLowerCase();
    return this.list().find((account) => account.login === value);
  }

  /**
   * Checks an identifiant and its password. Returns the account id when both match, null otherwise.
   * Inactive accounts never sign in.
   */
  async checkPassword(login: string, password: string): Promise<string | null> {
    const account = this.findByLogin(login);
    if (!account || !account.active || password === '') {
      return null;
    }
    return (await hashSecret(password, account.passwordSalt)) === account.passwordHash ? account.id : null;
  }

  /** Checks a PIN. Inactive accounts never unlock. */
  async verifyPin(id: string, pin: string): Promise<boolean> {
    const account = this.find(id);
    if (!account || !account.active || !isValidPin(pin)) {
      return false;
    }
    return (await hashSecret(pin, account.salt)) === account.pinHash;
  }

  async add(input: {
    readonly name: string;
    readonly login: string;
    readonly roleId: Role;
    readonly password: string;
    readonly pin: string;
  }): Promise<UserAccount> {
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
    const login = normalizeLogin(input.login);
    if (login === null) {
      throw new Error('L’identifiant doit comporter de 3 à 32 lettres, chiffres, points, tirets ou tirets bas.');
    }
    if (this.findByLogin(login)) {
      throw new Error('Cet identifiant existe déjà.');
    }
    const passwordSalt = newSalt();
    const salt = newSalt();
    const account: UserAccount = {
      id: newId(),
      name,
      login,
      roleId: input.roleId,
      passwordSalt,
      passwordHash: await this.hashPasswordChecked(input.password, passwordSalt),
      salt,
      pinHash: await this.hashPinChecked(input.pin, salt),
      active: true,
    };
    this.save([...this.list(), account]);
    return account;
  }

  async setPassword(id: string, password: string): Promise<void> {
    const account = this.require(id);
    const passwordSalt = newSalt();
    const passwordHash = await this.hashPasswordChecked(password, passwordSalt);
    this.save(this.list().map((item) => (item.id === id ? { ...account, passwordSalt, passwordHash } : item)));
  }

  async setPin(id: string, pin: string): Promise<void> {
    const account = this.require(id);
    const salt = newSalt();
    const pinHash = await this.hashPinChecked(pin, salt);
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

  /** Hashes a password with the salt that will be stored next to it, after checking the minimum length. */
  private async hashPasswordChecked(password: string, salt: string): Promise<string> {
    const minLength = this.security.settings().minPasswordLength;
    if (!isValidPassword(password, minLength)) {
      throw new Error(`Le mot de passe doit comporter au moins ${minLength} caractères.`);
    }
    return hashSecret(password, salt);
  }

  /** Hashes a PIN with the salt that will be stored next to it. */
  private async hashPinChecked(pin: string, salt: string): Promise<string> {
    if (!isValidPin(pin)) {
      throw new Error('Le code PIN doit comporter exactement 4 chiffres.');
    }
    return hashSecret(pin, salt);
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
      const passwordSalt = newSalt();
      seeded.push({
        id: demo.id,
        name: demo.name,
        login: demo.login,
        roleId: demo.roleId,
        passwordSalt,
        passwordHash: await hashSecret(demo.password, passwordSalt),
        salt,
        pinHash: await hashSecret(demo.pin, salt),
        active: true,
      });
    }
    this.list.set(seeded);
    writeStored(STORAGE_KEY, seeded);
  }
}
