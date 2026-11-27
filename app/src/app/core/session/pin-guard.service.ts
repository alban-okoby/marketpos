import { DestroyRef, Injectable, inject, signal } from '@angular/core';

import { SecuritySettingsService } from '../settings/security.service';
import { NO_FAILURES, PinGuardState, registerFailure, secondsLeft } from './pin-guard';

const STORAGE_KEY = 'marketpos.pinguard';

/**
 * What a block applies to: the manager's PIN for closings ('gerant'), or one account on the lock screen
 * ('compte:<id>'). A wrong password for one account never blocks another account.
 */
export type PinScope = 'gerant' | `compte:${string}`;

/** Scope of the lock-screen block for one account. */
export function accountScope(userId: string): PinScope {
  return `compte:${userId}`;
}

function readStates(): Partial<Record<PinScope, PinGuardState>> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : {};
    return typeof parsed === 'object' && parsed !== null ? (parsed as Partial<Record<PinScope, PinGuardState>>) : {};
  } catch {
    return {};
  }
}

/**
 * Limits wrong attempts (US-03, the manager's PIN for closings, and the lock screen, per account).
 * The counter is kept in local storage, so reloading the page does not reset a block.
 */
@Injectable({ providedIn: 'root' })
export class PinGuardService {
  private readonly security = inject(SecuritySettingsService);
  private readonly states = signal<Partial<Record<PinScope, PinGuardState>>>(readStates());
  private readonly now = signal(Date.now());

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  secondsLeft(scope: PinScope): number {
    return secondsLeft(this.states()[scope] ?? NO_FAILURES, this.now());
  }

  fail(scope: PinScope): void {
    const { maxPinAttempts, lockoutSeconds } = this.security.settings();
    const next = registerFailure(this.states()[scope] ?? NO_FAILURES, Date.now(), maxPinAttempts, lockoutSeconds * 1000);
    this.write(scope, next);
  }

  reset(scope: PinScope): void {
    this.write(scope, NO_FAILURES);
  }

  private write(scope: PinScope, state: PinGuardState): void {
    const next = { ...this.states(), [scope]: state };
    this.states.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage is blocked: the block still applies for this session.
    }
  }
}
