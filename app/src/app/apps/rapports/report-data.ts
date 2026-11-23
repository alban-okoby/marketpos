import type { Product } from '../caisse/catalogue';
import type { Sale } from '../caisse/sales.service';

export type Period = 'jour' | 'semaine' | 'mois';

export interface PeriodRow {
  readonly key: string;
  readonly label: string;
  readonly count: number;
  readonly total: number;
}

export interface ProductRow {
  readonly code: string;
  readonly name: string;
  readonly qty: number;
  readonly amount: number;
}

export interface StockSummary {
  readonly value: number;
  readonly ruptures: readonly Product[];
  readonly critical: readonly Product[];
}

const pad = (value: number) => String(value).padStart(2, '0');

/** ISO week key, such as "2026-S47". Weeks start on Monday. */
function weekKey(date: Date): string {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${utc.getUTCFullYear()}-S${pad(week)}`;
}

/** Period key of a sale, in local time. */
export function periodKey(iso: string, period: Period): string {
  const date = new Date(iso);
  if (period === 'semaine') {
    return weekKey(date);
  }
  if (period === 'mois') {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Readable label for a period key. */
export function periodLabel(key: string, period: Period): string {
  if (period === 'jour') {
    const [year, month, day] = key.split('-');
    return `${day}/${month}/${year}`;
  }
  if (period === 'mois') {
    const [year, month] = key.split('-');
    return `${month}/${year}`;
  }
  return key;
}

/** Sales totals per period, most recent first. */
export function salesByPeriod(sales: readonly Sale[], period: Period): PeriodRow[] {
  const groups = new Map<string, { count: number; total: number }>();
  for (const sale of sales) {
    const key = periodKey(sale.date, period);
    const group = groups.get(key) ?? { count: 0, total: 0 };
    groups.set(key, { count: group.count + 1, total: group.total + sale.total });
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([key, group]) => ({ key, label: periodLabel(key, period), ...group }));
}

/** Sales per cashier, largest first. */
export function salesByCashier(sales: readonly Sale[]): { name: string; count: number; total: number }[] {
  const groups = new Map<string, { count: number; total: number }>();
  for (const sale of sales) {
    const name = sale.cashier || 'Non renseigné';
    const group = groups.get(name) ?? { count: 0, total: 0 };
    groups.set(name, { count: group.count + 1, total: group.total + sale.total });
  }
  return [...groups.entries()]
    .map(([name, group]) => ({ name, ...group }))
    .sort((a, b) => b.total - a.total);
}

/** Every article with the quantity and amount sold, best sellers first. Articles never sold are included at zero (RP-03). */
export function rankProducts(products: readonly Product[], sales: readonly Sale[]): ProductRow[] {
  const sold = new Map<string, { qty: number; amount: number }>();
  for (const sale of sales) {
    for (const line of sale.lines) {
      const current = sold.get(line.code) ?? { qty: 0, amount: 0 };
      sold.set(line.code, { qty: current.qty + line.qty, amount: current.amount + line.price * line.qty });
    }
  }
  return products
    .map((product) => ({ code: product.code, name: product.name, ...(sold.get(product.code) ?? { qty: 0, amount: 0 }) }))
    .sort((a, b) => b.qty - a.qty || a.name.localeCompare(b.name));
}

/** Stock value at purchase price (or sale price when unknown), ruptures and articles at or below their threshold (RP-04). */
export function stockSummary(products: readonly Product[]): StockSummary {
  const value = products.reduce((sum, product) => sum + Math.max(product.stock, 0) * (product.purchasePrice ?? product.price), 0);
  return {
    value,
    ruptures: products.filter((product) => product.stock <= 0),
    critical: products.filter((product) => product.stock > 0 && product.stock <= (product.threshold ?? 5)),
  };
}

/** CSV that French spreadsheets open directly: ";" separator and a byte-order mark so accents survive (RP-05). */
export function csvTable(headers: readonly string[], rows: readonly (string | number)[][]): string {
  const cell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const lines = [headers, ...rows].map((row) => row.map(cell).join(';'));
  return `﻿${lines.join('\r\n')}`;
}
