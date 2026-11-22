import { Injectable, signal } from '@angular/core';

/**
 * Network state shown in the system tray. Offline operation is a core requirement (OF-01, OF-02):
 * the cashier must always see whether sales are waiting to be synchronised.
 */
@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  readonly online = signal(typeof navigator === 'undefined' ? true : navigator.onLine);

  /**
   * Number of sales stored locally and not yet synchronised (OF-04).
   * Placeholder at 0 until the offline sales queue exists.
   */
  readonly pendingSales = signal(0);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.online.set(true));
      window.addEventListener('offline', () => this.online.set(false));
    }
  }
}
