import { Injectable, computed, signal } from '@angular/core';

export type AlertKind = 'stock-negatif' | 'synchronisation' | 'ecart-caisse';

export interface Alert {
  readonly id: string;
  readonly kind: AlertKind;
  readonly message: string;
  readonly date: string;
  readonly acknowledged: boolean;
}

const STORAGE_KEY = 'marketpos.alertes';
const MAX_KEPT = 200;

function readAlerts(): Alert[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? (parsed as Alert[]) : [];
  } catch {
    return [];
  }
}

/**
 * Alerts raised by the system (negative stock, failed synchronisation, cash gap).
 * They stay until they are acknowledged.
 */
@Injectable({ providedIn: 'root' })
export class AlertsService {
  private readonly list = signal<readonly Alert[]>(readAlerts());

  readonly all = this.list.asReadonly();
  readonly open = computed(() => this.list().filter((alert) => !alert.acknowledged));

  raise(kind: AlertKind, message: string): Alert {
    const alert: Alert = {
      id: `${kind}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      kind,
      message,
      date: new Date().toISOString(),
      acknowledged: false,
    };
    this.setList([alert, ...this.list()].slice(0, MAX_KEPT));
    return alert;
  }

  acknowledge(id: string): void {
    this.setList(this.list().map((alert) => (alert.id === id ? { ...alert, acknowledged: true } : alert)));
  }

  private setList(next: readonly Alert[]): void {
    this.list.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage is full or blocked: the alert is still shown for this session.
    }
  }
}
