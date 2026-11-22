import { Injectable, computed, signal } from '@angular/core';

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
  private readonly list = signal<readonly Product[]>(loadCatalogue());

  readonly products = this.list.asReadonly();
  readonly categories = computed(() => categoriesOf(this.list()));

  find(code: string): Product | undefined {
    return this.list().find((product) => product.code === code);
  }

  /** Removes the sold quantities from the stock. */
  decrementStock(sold: readonly { readonly code: string; readonly qty: number }[]): void {
    const next = this.list().map((product) => {
      const quantity = sold.filter((line) => line.code === product.code).reduce((sum, line) => sum + line.qty, 0);
      return quantity ? { ...product, stock: product.stock - quantity } : product;
    });
    this.list.set(next);
    this.save(next);
  }

  private save(products: readonly Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {
      // Storage is full or blocked: the stock still changes for this session.
    }
  }
}
