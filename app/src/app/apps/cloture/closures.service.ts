import { Injectable, computed, inject, signal } from '@angular/core';

import { AlertsService } from '../../core/alerts/alerts.service';
import { SalesService } from '../caisse/sales.service';
import {
  Rectification,
  ZClosure,
  cashGap,
  formatZNumber,
  needsJustification,
  salesSince,
  summarize,
} from './closure';

const CLOSURES_KEY = 'marketpos.caisse.clotures';
const RECTIFICATIONS_KEY = 'marketpos.caisse.rectifications';

function readList<T>(key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * X and Z reports. An X report shows the current period and changes nothing. A Z report closes the period:
 * the counters start again, and the closure is kept for good (CL-02, CL-04).
 */
@Injectable({ providedIn: 'root' })
export class ClosuresService {
  private readonly sales = inject(SalesService);
  private readonly alerts = inject(AlertsService);

  private readonly closureList = signal<readonly ZClosure[]>(readList<ZClosure>(CLOSURES_KEY));
  private readonly rectificationList = signal<readonly Rectification[]>(readList<Rectification>(RECTIFICATIONS_KEY));

  readonly closures = this.closureList.asReadonly();
  readonly rectifications = this.rectificationList.asReadonly();

  /** Start of the current period: the last Z closure, or nothing yet. */
  readonly since = computed(() => this.closureList().at(-1)?.at ?? null);
  /** Cash left in the drawer after the last closure: the opening float of the next period (US-05). */
  readonly openingFloat = computed(() => this.closureList().at(-1)?.cashCounted ?? 0);

  /** X report: the current period, without closing it. */
  readonly xReport = computed(() => summarize(salesSince(this.sales.journal(), this.since())));

  /**
   * Validates the Z closure. Throws when a justification is needed and missing.
   * An amount outside the threshold is also recorded as an alert.
   */
  closeDay(input: { readonly countedCash: number; readonly justification: string; readonly validatedBy: string }): ZClosure {
    const since = this.since();
    const period = summarize(salesSince(this.sales.journal(), since));
    const openingFloat = this.openingFloat();
    const cashExpected = openingFloat + period.cash;
    const gap = cashGap(input.countedCash, cashExpected);
    const justification = input.justification.trim();

    if (needsJustification(gap) && justification === '') {
      throw new Error('Justification obligatoire : la caisse ne correspond pas au montant théorique.');
    }

    const at = new Date().toISOString();
    const closure: ZClosure = {
      id: newId('z'),
      number: formatZNumber(this.closureList().length + 1),
      at,
      periodFrom: since,
      count: period.count,
      total: period.total,
      openingFloat,
      cashExpected,
      cashCounted: input.countedCash,
      gap,
      justification,
      validatedBy: input.validatedBy,
    };
    this.closureList.set([...this.closureList(), closure]);
    this.save(CLOSURES_KEY, this.closureList());

    if (gap !== 0) {
      this.alerts.raise('ecart-caisse', `Écart de caisse ${closure.number} : ${gap} F`);
    }
    return closure;
  }

  /**
   * Adds a correction to a validated closure. Closures themselves are never changed (CL-04).
   */
  addRectification(closureId: string, amount: number, reason: string): Rectification {
    if (!this.closureList().some((closure) => closure.id === closureId)) {
      throw new Error('Clôture inconnue.');
    }
    if (reason.trim() === '') {
      throw new Error('Le motif de la rectification est obligatoire.');
    }
    const entry: Rectification = { id: newId('r'), closureId, at: new Date().toISOString(), amount, reason: reason.trim() };
    this.rectificationList.set([...this.rectificationList(), entry]);
    this.save(RECTIFICATIONS_KEY, this.rectificationList());
    return entry;
  }

  rectificationsOf(closureId: string): readonly Rectification[] {
    return this.rectificationList().filter((entry) => entry.closureId === closureId);
  }

  private save(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage is full or blocked: the closure stays on screen for this session.
    }
  }
}
