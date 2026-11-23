import { Injectable, computed, inject, signal } from '@angular/core';

import { AlertsService } from '../../core/alerts/alerts.service';
import { SessionService } from '../../core/session/session.service';
import { Product, buildTestCatalogue, categoriesOf, parseCatalogue } from './catalogue';

const STORAGE_KEY = 'marketpos.caisse.catalogue';
const MOVEMENTS_KEY = 'marketpos.stock.mouvements';
const MAX_MOVEMENTS = 500;
const DEFAULT_THRESHOLD = 5;

/** Why stock moved. Sales and inventory are recorded automatically; the others are entered by hand (ST-03). */
export type StockReason = 'vente' | 'casse' | 'peremption' | 'autre' | 'inventaire';

export const MANUAL_REASONS: readonly StockReason[] = ['casse', 'peremption', 'autre'];

export interface StockMovement {
  readonly id: string;
  readonly date: string;
  readonly code: string;
  readonly name: string;
  readonly delta: number;
  readonly reason: StockReason;
  readonly comment: string;
  readonly by: string;
}

/** Article as entered in the form. The code identifies the article and cannot change once saved. */
export interface ProductInput {
  readonly code: string;
  readonly name: string;
  readonly price: number;
  readonly category: string;
  readonly unit: string;
  readonly purchasePrice: number;
  readonly threshold: number;
  readonly expiry: string;
}

function loadCatalogue(): Product[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? parseCatalogue(JSON.parse(stored)) : null;
    if (parsed) {
      return parsed;
    }
  } catch {
    // Unreadable data: start again from the test catalogue.
  }
  return buildTestCatalogue();
}

function loadMovements(): StockMovement[] {
  try {
    const stored = localStorage.getItem(MOVEMENTS_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? (parsed as StockMovement[]) : [];
  } catch {
    return [];
  }
}

function newId(): string {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Checks the form before saving. Returns the message to show, or null when the article is valid. */
export function validateProduct(input: ProductInput): string | null {
  if (input.code.trim() === '') {
    return 'Le code article est obligatoire.';
  }
  if (input.name.trim() === '') {
    return 'Le nom de l’article est obligatoire.';
  }
  if (!Number.isFinite(input.price) || input.price < 0) {
    return 'Le prix de vente doit être positif.';
  }
  if (!Number.isFinite(input.purchasePrice) || input.purchasePrice < 0) {
    return 'Le prix d’achat doit être positif.';
  }
  if (!Number.isFinite(input.threshold) || input.threshold < 0) {
    return 'Le seuil d’alerte doit être positif.';
  }
  return null;
}

/**
 * Articles, stock and stock movements. A sale never waits for stock: the stock may go below zero and an alert is raised (OF-05).
 * A manual output cannot take more than the stock (ST-03). Every movement is kept with its reason and the user who made it.
 */
@Injectable({ providedIn: 'root' })
export class CatalogueService {
  private readonly alerts = inject(AlertsService);
  private readonly session = inject(SessionService);
  private readonly list = signal<readonly Product[]>(loadCatalogue());
  private readonly movementList = signal<readonly StockMovement[]>(loadMovements());

  readonly products = this.list.asReadonly();
  readonly movements = this.movementList.asReadonly();
  readonly categories = computed(() => categoriesOf(this.list()));

  find(code: string): Product | undefined {
    return this.list().find((product) => product.code === code);
  }

  /** Articles at or below their alert threshold. */
  readonly lowStock = computed(() =>
    this.list().filter((product) => product.stock <= (product.threshold ?? DEFAULT_THRESHOLD)),
  );

  /** Articles whose best-before date is within `days` of `now`, or already passed. */
  expiringWithin(days: number, now: Date = new Date()): Product[] {
    const limit = now.getTime() + days * 86_400_000;
    return this.list().filter((product) => product.expiry !== undefined && Date.parse(product.expiry) <= limit);
  }

  /** Creates an article, or updates it when the code already exists. The stock is not changed by an update. */
  save(input: ProductInput): Product {
    const problem = validateProduct(input);
    if (problem) {
      throw new Error(problem);
    }
    const code = input.code.trim();
    const existing = this.find(code);
    const product: Product = {
      code,
      name: input.name.trim(),
      price: Math.round(input.price),
      category: input.category.trim() || 'Divers',
      stock: existing?.stock ?? 0,
      unit: input.unit.trim() || 'pièce',
      purchasePrice: Math.round(input.purchasePrice),
      threshold: Math.round(input.threshold),
      expiry: input.expiry || undefined,
    };
    const next = existing ? this.list().map((item) => (item.code === code ? product : item)) : [...this.list(), product];
    this.setProducts(next);
    return product;
  }

  /** Removes the sold quantities. Recorded as sales; the stock may go below zero (OF-05). */
  decrementStock(sold: readonly { readonly code: string; readonly qty: number }[]): void {
    const before = this.list();
    const next = before.map((product) => {
      const quantity = sold.filter((line) => line.code === product.code).reduce((sum, line) => sum + line.qty, 0);
      return quantity ? { ...product, stock: product.stock - quantity } : product;
    });
    for (const line of sold) {
      const product = next.find((item) => item.code === line.code);
      if (product) {
        this.log(product, -line.qty, 'vente', '');
      }
    }
    this.setProducts(next, before);
  }

  /** Manual output (breakage, expiry, other). Refused when the quantity is more than the stock. */
  recordOutput(code: string, qty: number, reason: StockReason, comment: string): void {
    const product = this.find(code);
    if (!product) {
      throw new Error('Article inconnu.');
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new Error('La quantité doit être un nombre entier positif.');
    }
    if (qty > product.stock) {
      throw new Error(`Sortie impossible : il ne reste que ${product.stock} ${product.unit ?? 'pièce'}.`);
    }
    if (!MANUAL_REASONS.includes(reason)) {
      throw new Error('Motif de sortie inconnu.');
    }
    const before = this.list();
    const next = before.map((item) => (item.code === code ? { ...item, stock: item.stock - qty } : item));
    this.log(product, -qty, reason, comment.trim());
    this.setProducts(next, before);
  }

  /**
   * Applies a physical count. Returns the differences found. Differences are recorded as inventory movements.
   */
  applyInventory(counts: readonly { readonly code: string; readonly counted: number }[]): { readonly code: string; readonly name: string; readonly before: number; readonly after: number; readonly delta: number }[] {
    const before = this.list();
    const variances: { code: string; name: string; before: number; after: number; delta: number }[] = [];
    const next = before.map((product) => {
      const count = counts.find((line) => line.code === product.code);
      if (!count || !Number.isInteger(count.counted) || count.counted < 0 || count.counted === product.stock) {
        return product;
      }
      const delta = count.counted - product.stock;
      variances.push({ code: product.code, name: product.name, before: product.stock, after: count.counted, delta });
      this.log(product, delta, 'inventaire', `Compté ${count.counted}`);
      return { ...product, stock: count.counted };
    });
    this.setProducts(next, before);
    return variances;
  }

  private log(product: Product, delta: number, reason: StockReason, comment: string): void {
    const movement: StockMovement = {
      id: newId(),
      date: new Date().toISOString(),
      code: product.code,
      name: product.name,
      delta,
      reason,
      comment,
      by: this.session.user()?.name ?? '',
    };
    const next = [movement, ...this.movementList()].slice(0, MAX_MOVEMENTS);
    this.movementList.set(next);
    this.saveJson(MOVEMENTS_KEY, next);
  }

  /** Saves the list and raises the alerts for articles that went below zero or below their threshold. */
  private setProducts(next: readonly Product[], before: readonly Product[] = this.list()): void {
    this.list.set(next);
    this.saveJson(STORAGE_KEY, next);
    for (const product of next) {
      const previous = before.find((item) => item.code === product.code);
      const threshold = product.threshold ?? DEFAULT_THRESHOLD;
      if (product.stock < 0 && (!previous || previous.stock >= 0)) {
        this.alerts.raise('stock-negatif', `Stock négatif : ${product.name} (${product.stock})`);
      } else if (product.stock <= threshold && (!previous || previous.stock > (previous.threshold ?? DEFAULT_THRESHOLD))) {
        this.alerts.raise('stock-bas', `Stock bas : ${product.name} (${product.stock} ${product.unit ?? 'pièce'})`);
      }
    }
  }

  private saveJson(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage is full or blocked: the change still applies for this session.
    }
  }
}
