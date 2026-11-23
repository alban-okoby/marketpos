import { Injectable, computed, signal } from '@angular/core';

import { numberOr, readStored, writeStored } from './storage';

export interface SecuritySettings {
  /** Minutes without activity before the session locks. 0 turns the lock off (US-04). */
  readonly idleMinutes: number;
}

export const DEFAULT_SECURITY: SecuritySettings = { idleMinutes: 5 };
export const MAX_IDLE_MINUTES = 120;

const STORAGE_KEY = 'marketpos.securite';

export function parseSecurity(raw: unknown): SecuritySettings {
  const value = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  return { idleMinutes: Math.round(numberOr(value['idleMinutes'], DEFAULT_SECURITY.idleMinutes, 0, MAX_IDLE_MINUTES)) };
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
