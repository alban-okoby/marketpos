import { Sale } from '../caisse/sales.service';

/**
 * Gap between counted and expected cash above which a justification is required (CL-03).
 * The threshold is still to be defined (see the specification, section 18): until then any gap needs a reason.
 */
export const CASH_GAP_THRESHOLD = 0;

export interface PeriodSummary {
  readonly count: number;
  readonly total: number;
  readonly cash: number;
  readonly firstTicket: string | null;
  readonly lastTicket: string | null;
}

/** A Z closure, once validated. It is never edited: corrections are separate rectification entries (CL-04). */
export interface ZClosure {
  readonly id: string;
  readonly number: string;
  readonly at: string;
  readonly periodFrom: string | null;
  readonly count: number;
  readonly total: number;
  readonly openingFloat: number;
  readonly cashExpected: number;
  readonly cashCounted: number;
  readonly gap: number;
  readonly justification: string;
  readonly validatedBy: string;
}

export interface Rectification {
  readonly id: string;
  readonly closureId: string;
  readonly at: string;
  readonly amount: number;
  readonly reason: string;
}

/** Sales made after the given moment (ISO dates compare as text). Everything when there was no previous closure. */
export function salesSince(sales: readonly Sale[], since: string | null): Sale[] {
  return sales.filter((sale) => since === null || sale.date > since);
}

/** Totals of a period: count, amount, cash amount, first and last ticket. */
export function summarize(sales: readonly Sale[]): PeriodSummary {
  return {
    count: sales.length,
    total: sales.reduce((sum, sale) => sum + sale.total, 0),
    // Every sale is paid in cash for now; other payment methods will be added with CA-05 and MM-01.
    cash: sales.reduce((sum, sale) => sum + sale.total, 0),
    firstTicket: sales[0]?.number ?? null,
    lastTicket: sales[sales.length - 1]?.number ?? null,
  };
}

/** Counted minus expected cash. Negative when cash is missing. */
export function cashGap(counted: number, expected: number): number {
  return counted - expected;
}

export function needsJustification(gap: number): boolean {
  return Math.abs(gap) > CASH_GAP_THRESHOLD;
}

/** Z numbers are continuous, like tickets: Z-000001, Z-000002… */
export function formatZNumber(counter: number): string {
  return `Z-${String(counter).padStart(6, '0')}`;
}
