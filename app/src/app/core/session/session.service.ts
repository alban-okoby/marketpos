import { Injectable, computed, signal } from '@angular/core';

import { DEMO_USERS, DemoUser } from './demo-users';

/**
 * Lock and session state of the system.
 * `locked` drives which screen is shown; `user` is the signed-in cashier or manager.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly users = DEMO_USERS;

  private readonly signedInUser = signal<DemoUser | null>(null);
  private readonly isLocked = signal(true);

  readonly user = this.signedInUser.asReadonly();
  readonly locked = this.isLocked.asReadonly();
  readonly hasSession = computed(() => this.signedInUser() !== null);

  findUser(userId: string): DemoUser | undefined {
    return this.users.find((user) => user.id === userId);
  }

  /** Checks a PIN without changing any state. */
  verifyPin(userId: string, pin: string): boolean {
    return this.findUser(userId)?.pin === pin;
  }

  /** Signs the user in and unlocks the system. The caller must verify the PIN first. */
  unlock(userId: string): void {
    const user = this.findUser(userId);
    if (!user) {
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
