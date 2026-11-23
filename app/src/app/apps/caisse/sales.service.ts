import { Injectable, computed, inject, signal } from '@angular/core';

import { FiscalSettingsService } from '../../core/settings/fiscal.service';
import { CartLine } from './cart.service';

export const CASH_REGISTER_ID = 'CAISSE-01';
/** Quick banknote buttons in the payment dialog, in FCFA. */
export const BANKNOTE_SHORTCUTS: readonly number[] = [500, 1000, 2000, 5000, 10000, 20000];

/** EN_ATTENTE_SYNC: kept on this device until the server acknowledges it. */
export type SaleStatus = 'EN_ATTENTE_SYNC' | 'SYNCHRONISEE';

export interface Sale {
  /** Unique operation id (OF-03). The server uses it to ignore a sale it has already received. */
  readonly id: string;
  readonly number: string;
  readonly date: string;
  readonly cashier: string;
  readonly lines: readonly CartLine[];
  readonly total: number;
  readonly received: number;
  readonly change: number;
  readonly status: SaleStatus;
  /** VAT rate in force when the sale was made, in percent. Kept so later changes never alter old tickets. */
  readonly vatRate?: number;
}

/** VAT included in a tax-included total, for a rate in percent. */
export function vatIncluded(total: number, vatRate: number): number {
  return vatRate > 0 ? Math.round((total * vatRate) / (100 + vatRate)) : 0;
}

/** Ticket number such as "CAISSE-01-000042". Numbering is continuous (CA-13). */
export function formatTicketNumber(counter: number): string {
  return `${CASH_REGISTER_ID}-${String(counter).padStart(6, '0')}`;
}

/** Change to give back. Never negative. */
export function changeDue(total: number, received: number): number {
  return Math.max(received - total, 0);
}

/** State of the cash payment for a given amount due and amount received. */
export function cashPaymentStatus(total: number, received: number): {
  readonly change: number;
  readonly canValidate: boolean;
  readonly insufficient: boolean;
} {
  const insufficient = received < total;
  return {
    change: changeDue(total, received),
    canValidate: total > 0 && !insufficient,
    insufficient: received > 0 && insufficient,
  };
}

/** Unique id for an operation. Falls back when crypto.randomUUID is not available. */
export function newOperationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `op-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const COUNTER_KEY = 'marketpos.caisse.compteur';
const JOURNAL_KEY = 'marketpos.caisse.ventes';

function readCounter(): number {
  try {
    const value = Number(localStorage.getItem(COUNTER_KEY));
    return Number.isInteger(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function readJournal(): Sale[] {
  try {
    const stored = localStorage.getItem(JOURNAL_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Sales written before operation ids existed get a stable id from their ticket number.
    return (parsed as Sale[]).map((sale) => (sale.id ? sale : { ...sale, id: `legacy-${sale.number}` }));
  } catch {
    return [];
  }
}

/** Ticket counter and sales journal. Both are kept locally, so a sale is never lost when the network drops. */
@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly fiscal = inject(FiscalSettingsService);
  private readonly counter = signal(readCounter());
  readonly journal = signal<readonly Sale[]>(readJournal());

  /** Number the next ticket will get. */
  readonly nextNumber = computed(() => formatTicketNumber(this.counter() + 1));
  readonly pending = computed(() => this.journal().filter((sale) => sale.status === 'EN_ATTENTE_SYNC'));
  readonly pendingSync = computed(() => this.pending().length);

  /**
   * Records a cash sale. Throws if the amount received does not cover the total.
   * Sales are never removed: a synchronised sale only changes status (OF-06).
   */
  record(lines: readonly CartLine[], received: number, cashier: string): Sale {
    const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
    if (total <= 0 || received < total) {
      throw new Error('Montant reçu insuffisant : la vente ne peut pas être validée.');
    }
    const next = this.counter() + 1;
    const sale: Sale = {
      id: newOperationId(),
      number: formatTicketNumber(next),
      date: new Date().toISOString(),
      cashier,
      lines: lines.map((line) => ({ ...line })),
      total,
      received,
      change: changeDue(total, received),
      status: 'EN_ATTENTE_SYNC',
      vatRate: this.fiscal.vatRate(),
    };
    this.counter.set(next);
    this.journal.set([...this.journal(), sale]);
    this.save(COUNTER_KEY, String(next));
    this.save(JOURNAL_KEY, JSON.stringify(this.journal()));
    return sale;
  }

  /** Marks sales as acknowledged by the server. Unknown ids are ignored. */
  markSynced(ids: readonly string[]): void {
    const acknowledged = new Set(ids);
    const next = this.journal().map((sale) =>
      acknowledged.has(sale.id) ? { ...sale, status: 'SYNCHRONISEE' as const } : sale,
    );
    this.journal.set(next);
    this.save(JOURNAL_KEY, JSON.stringify(next));
  }

  private save(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage is full or blocked: the sale is still shown and printed, but not kept after a reload.
    }
  }
}
