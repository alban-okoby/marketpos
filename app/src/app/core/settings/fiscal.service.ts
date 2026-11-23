import { Injectable, computed, signal } from '@angular/core';

import { numberOr, readStored, writeStored } from './storage';

export interface FiscalSettings {
  /** VAT rate applied to new sales, in percent. Prices are tax included. 0 means no VAT is shown. */
  readonly vatRate: number;
  /** Cash gap, in FCFA, that a Z closing may have without a justification (CL-03). */
  readonly cashGapThreshold: number;
}

/** Defaults are placeholders: the VAT rate and the threshold are still to be confirmed (see the specification, section 18). */
export const DEFAULT_FISCAL: FiscalSettings = { vatRate: 0, cashGapThreshold: 0 };

const STORAGE_KEY = 'marketpos.fiscal';

export function parseFiscal(raw: unknown): FiscalSettings {
  const value = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    vatRate: numberOr(value['vatRate'], DEFAULT_FISCAL.vatRate, 0, 100),
    cashGapThreshold: numberOr(value['cashGapThreshold'], DEFAULT_FISCAL.cashGapThreshold, 0, 10_000_000),
  };
}

/** Tax settings. Nothing here is hard-coded in the sales or closing logic. */
@Injectable({ providedIn: 'root' })
export class FiscalSettingsService {
  private readonly state = signal<FiscalSettings>(readStored(STORAGE_KEY, parseFiscal));
  readonly settings = this.state.asReadonly();
  readonly vatRate = computed(() => this.state().vatRate);
  readonly cashGapThreshold = computed(() => this.state().cashGapThreshold);

  update(change: Partial<FiscalSettings>): void {
    const next = parseFiscal({ ...this.state(), ...change });
    this.state.set(next);
    writeStored(STORAGE_KEY, next);
  }
}
