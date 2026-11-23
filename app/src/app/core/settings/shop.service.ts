import { Injectable, computed, signal } from '@angular/core';

import { readStored, textOr, writeStored } from './storage';

export type PaperWidth = 58 | 80;

/** Shop identity printed on each receipt. */
export interface ShopSettings {
  readonly name: string;
  readonly address: string;
  readonly phone: string;
  /** Tax identification number (NIF). */
  readonly taxId: string;
  /** Trade register number (RCCM). */
  readonly tradeRegister: string;
  readonly footer: string;
  readonly paperWidth: PaperWidth;
}

export const DEFAULT_SHOP: ShopSettings = {
  name: 'MarketPOS',
  address: '',
  phone: '',
  taxId: '',
  tradeRegister: '',
  footer: 'Merci de votre visite',
  paperWidth: 80,
};

const STORAGE_KEY = 'marketpos.boutique';

export function parseShop(raw: unknown): ShopSettings {
  const value = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    name: textOr(value['name'], DEFAULT_SHOP.name),
    address: textOr(value['address'], DEFAULT_SHOP.address),
    phone: textOr(value['phone'], DEFAULT_SHOP.phone, 40),
    taxId: textOr(value['taxId'], DEFAULT_SHOP.taxId, 40),
    tradeRegister: textOr(value['tradeRegister'], DEFAULT_SHOP.tradeRegister, 40),
    footer: textOr(value['footer'], DEFAULT_SHOP.footer, 160),
    paperWidth: value['paperWidth'] === 58 ? 58 : 80,
  };
}

/** Shop identity and receipt format. */
@Injectable({ providedIn: 'root' })
export class ShopService {
  private readonly state = signal<ShopSettings>(readStored(STORAGE_KEY, parseShop));
  readonly settings = this.state.asReadonly();
  readonly paperWidth = computed(() => this.state().paperWidth);

  update(change: Partial<ShopSettings>): void {
    const next = parseShop({ ...this.state(), ...change });
    this.state.set(next);
    writeStored(STORAGE_KEY, next);
  }
}

