import { Injectable, computed, signal } from '@angular/core';

import { numberOr, readStored, writeStored } from './storage';

export interface SecuritySettings {
  /** Minutes without activity before the session locks. 0 turns the lock off (US-04). */
  readonly idleMinutes: number;
  /** Wrong PIN attempts allowed in a row before the PIN is blocked. */
  readonly maxPinAttempts: number;
  /** Seconds the PIN stays blocked after too many wrong attempts. */
  readonly lockoutSeconds: number;
  /** Fewest characters a password may have when an account is created or its password changed. */
  readonly minPasswordLength: number;
}

export const DEFAULT_SECURITY: SecuritySettings = {
  idleMinutes: 5,
  maxPinAttempts: 3,
  lockoutSeconds: 60,
  minPasswordLength: 8,
};
export const MAX_IDLE_MINUTES = 120;
export const MAX_PIN_ATTEMPTS = 10;
export const MAX_LOCKOUT_SECONDS = 900;
export const MIN_PASSWORD_LENGTH_LIMIT = 4;
export const MAX_PASSWORD_LENGTH_LIMIT = 64;

const STORAGE_KEY = 'marketpos.securite';

export function parseSecurity(raw: unknown): SecuritySettings {
  const value = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    idleMinutes: Math.round(numberOr(value['idleMinutes'], DEFAULT_SECURITY.idleMinutes, 0, MAX_IDLE_MINUTES)),
    maxPinAttempts: Math.round(numberOr(value['maxPinAttempts'], DEFAULT_SECURITY.maxPinAttempts, 1, MAX_PIN_ATTEMPTS)),
    lockoutSeconds: Math.round(numberOr(value['lockoutSeconds'], DEFAULT_SECURITY.lockoutSeconds, 10, MAX_LOCKOUT_SECONDS)),
    minPasswordLength: Math.round(
      numberOr(
        value['minPasswordLength'],
        DEFAULT_SECURITY.minPasswordLength,
        MIN_PASSWORD_LENGTH_LIMIT,
        MAX_PASSWORD_LENGTH_LIMIT,
      ),
    ),
  };
}

/** Session security settings. */
@Injectable({ providedIn: 'root' })
export class SecuritySettingsService {
  private readonly state = signal<SecuritySettings>(readStored(STORAGE_KEY, parseSecurity));
  readonly settings = this.state.asReadonly();
  readonly idleMinutes = computed(() => this.state().idleMinutes);

  update(change: Partial<SecuritySettings>): void {
    const next = parseSecurity({ ...this.state(), ...change });
    this.state.set(next);
    writeStored(STORAGE_KEY, next);
  }
}
