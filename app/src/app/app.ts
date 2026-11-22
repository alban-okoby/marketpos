import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

import { SessionService } from './core/session/session.service';
import { DesktopComponent } from './shell/desktop/desktop.component';
import { LockScreenComponent } from './shell/lock-screen/lock-screen.component';

/**
 * Root of the MarketPOS shell. The app behaves like an operating system:
 * a lock screen comes first, then the desktop with windows and a taskbar.
 */
@Component({
  selector: 'app-root',
  imports: [LockScreenComponent, DesktopComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (session.locked()) {
      <app-lock-screen (unlocked)="session.unlock($event)" />
    } @else {
      <app-desktop />
    }
  `,
})
export class App {
  readonly session = inject(SessionService);

  constructor() {
    // The service worker serves the cached build first. When a new build is ready, activate it and reload,
    // so an old interface (for example, a previous theme) never stays on screen.
    const updates = inject(SwUpdate);
    if (updates.isEnabled) {
      updates.versionUpdates
        .pipe(filter((event: VersionEvent) => event.type === 'VERSION_READY'))
        .subscribe(() => {
          void updates.activateUpdate().then(() => document.location.reload());
        });
    }
  }
}
