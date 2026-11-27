import { Injectable, computed, inject, signal } from '@angular/core';

import { ROLE_LABELS, Role } from '../security/permissions';
import { UsersService } from '../security/users.service';

/** What the screens show about a user. The PIN and its hash never leave the users service. */
export interface SessionUser {
  readonly id: string;
  readonly name: string;
  /** Role label, shown on the lock screen. */
  readonly role: string;
  readonly roleId: Role;
}

/**
 * Lock and session state of the system.
 * `locked` drives which screen is shown; `user` is the signed-in cashier or manager.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly accounts = inject(UsersService);

  /** Active accounts, for the lock screen. */
  readonly users = computed<readonly SessionUser[]>(() => this.accounts.active().map(toSessionUser));

  private readonly signedInUser = signal<SessionUser | null>(null);
  private readonly isLocked = signal(true);

  readonly user = this.signedInUser.asReadonly();
  readonly locked = this.isLocked.asReadonly();
  readonly hasSession = computed(() => this.signedInUser() !== null);

  findUser(userId: string): SessionUser | undefined {
    const account = this.accounts.find(userId);
    return account ? toSessionUser(account) : undefined;
  }

  /** Active account with this identifiant, for the first step of the sign-in. Undefined when unknown or inactive. */
  findByLogin(login: string): SessionUser | undefined {
    const account = this.accounts.findByLogin(login);
    return account && account.active ? toSessionUser(account) : undefined;
  }

  /** Identifiant of an account, to prefill the sign-in form. Empty when unknown. */
  loginOf(userId: string): string {
    return this.accounts.find(userId)?.login ?? '';
  }

  /** Checks an identifiant and password without changing any state. Returns the account id, or null. */
  checkPassword(login: string, password: string): Promise<string | null> {
    return this.accounts.checkPassword(login, password);
  }

  /** Checks a PIN without changing any state. Used for the manager's authorisations. */
  verifyPin(userId: string, pin: string): Promise<boolean> {
    return this.accounts.verifyPin(userId, pin);
  }

  /** Signs the user in and unlocks the system. The caller must verify the PIN first. */
  unlock(userId: string): void {
    const user = this.findUser(userId);
    if (!user || !this.accounts.find(userId)?.active) {
      throw new Error(`Unknown user: ${userId}`);
    }
    this.signedInUser.set(user);
    this.isLocked.set(false);
  }

  /** Locks the screen; the session and open windows are kept. */
  lock(): void {
    this.isLocked.set(true);
  }

  /** Ends the session: the next unlock requires a PIN again. */
  signOut(): void {
    this.signedInUser.set(null);
    this.isLocked.set(true);
  }
}

function toSessionUser(account: { readonly id: string; readonly name: string; readonly roleId: Role }): SessionUser {
  return { id: account.id, name: account.name, role: ROLE_LABELS[account.roleId], roleId: account.roleId };
}
