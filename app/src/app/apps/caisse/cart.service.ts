import { Injectable, computed, signal } from '@angular/core';

export interface CartLine {
  readonly code: string;
  readonly name: string;
  readonly price: number;
  readonly qty: number;
}

/** Ticket in progress. Quantities go up with each scan or click, and a line disappears when its quantity reaches zero. */
@Injectable({ providedIn: 'root' })
export class CartService {
  readonly lines = signal<readonly CartLine[]>([]);
  readonly total = computed(() => this.lines().reduce((sum, line) => sum + line.price * line.qty, 0));
  readonly itemCount = computed(() => this.lines().reduce((sum, line) => sum + line.qty, 0));

  add(product: { readonly code: string; readonly name: string; readonly price: number }): void {
    const existing = this.lines().find((line) => line.code === product.code);
    if (existing) {
      this.setLines(this.lines().map((line) => (line.code === product.code ? { ...line, qty: line.qty + 1 } : line)));
    } else {
      this.setLines([...this.lines(), { code: product.code, name: product.name, price: product.price, qty: 1 }]);
    }
  }

  changeQty(code: string, delta: number): void {
    const next = this.lines()
      .map((line) => (line.code === code ? { ...line, qty: line.qty + delta } : line))
      .filter((line) => line.qty > 0);
    this.setLines(next);
  }

  remove(code: string): void {
    this.setLines(this.lines().filter((line) => line.code !== code));
  }

  clear(): void {
    this.setLines([]);
  }

  private setLines(lines: readonly CartLine[]): void {
    this.lines.set(lines);
  }
}
