import { DestroyRef, Injectable, inject } from '@angular/core';

import { SecuritySettingsService } from '../settings/security.service';
import { SessionService } from './session.service';

const CHECK_INTERVAL_MS = 5_000;
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const;

/** True when the session has been idle for at least `idleMinutes`. Zero minutes means the lock is off. */
export function isIdle(lastActivity: number, now: number, idleMinutes: number): boolean {
  return idleMinutes > 0 && now - lastActivity >= idleMinutes * 60_000;
}

/**
 * Locks the session after a period without activity (US-04). The period comes from the security settings.
 */
@Injectable({ providedIn: 'root' })
export class IdleLockService {
  constructor() {
    const session = inject(SessionService);
    const security = inject(SecuritySettingsService);

    let lastActivity = Date.now();
    const touch = () => {
      lastActivity = Date.now();
    };
    for (const name of ACTIVITY_EVENTS) {
      document.addEventListener(name, touch, { passive: true });
    }

    const timer = setInterval(() => {
      if (!session.locked() && isIdle(lastActivity, Date.now(), security.idleMinutes())) {
        session.lock();
      }
    }, CHECK_INTERVAL_MS);

    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      for (const name of ACTIVITY_EVENTS) {
        document.removeEventListener(name, touch);
      }
    });
  }
}
