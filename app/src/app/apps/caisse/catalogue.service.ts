import { Injectable, computed, inject, signal } from '@angular/core';

import { AlertsService } from '../../core/alerts/alerts.service';
import { Product, buildTestCatalogue, categoriesOf, parseCatalogue } from './catalogue';

const STORAGE_KEY = 'marketpos.caisse.catalogue';

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

/**
 * Articles on sale, with their stock. Stock is kept locally; it goes below zero rather than blocking a sale (OF-05).
 */
@Injectable({ providedIn: 'root' })
export class CatalogueService {
  private readonly alerts = inject(AlertsService);
  private readonly list = signal<readonly Product[]>(loadCatalogue());
  /** Stock before the last change, to alert once when an article goes below zero. */
  private previous = new Map<string, number>(this.list().map((product) => [product.code, product.stock]));

  readonly products = this.list.asReadonly();
  readonly categories = computed(() => categoriesOf(this.list()));

  find(code: string): Product | undefined {
    return this.list().find((product) => product.code === code);
  }

  /**
   * Removes the sold quantities from the stock. A sale is never refused for lack of stock: the stock goes
   * negative and an alert is raised so someone can check it (OF-05).
   */
  decrementStock(sold: readonly { readonly code: string; readonly qty: number }[]): void {
    const next = this.list().map((product) => {
      const quantity = sold.filter((line) => line.code === product.code).reduce((sum, line) => sum + line.qty, 0);
      return quantity ? { ...product, stock: product.stock - quantity } : product;
    });
    this.list.set(next);
    this.save(next);

    for (const product of next) {
      const before = this.previous.get(product.code);
      if (product.stock < 0 && (before === undefined || before >= 0)) {
        this.alerts.raise('stock-negatif', `Stock négatif : ${product.name} (${product.stock})`);
      }
    }
    this.previous = new Map(next.map((product) => [product.code, product.stock]));
  }

  private save(products: readonly Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {
      // Storage is full or blocked: the stock still changes for this session.
    }
  }
}
