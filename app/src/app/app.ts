import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

import { SessionService } from './core/session/session.service';
import { AccentService } from './core/theme/accent.service';
import { WallpaperService } from './core/wallpaper/wallpaper.service';
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
    <div class="wallpaper" aria-hidden="true" [class.has-image]="wallpaperImage() !== null" [style.background-image]="wallpaperImage()"></div>

    @if (session.locked()) {
      <app-lock-screen (unlocked)="session.unlock($event)" />
    } @else {
      <app-desktop />
    }
  `,
  styleUrl: './app.scss',
})
export class App {
  readonly session = inject(SessionService);
  // Created at start-up so the saved accent colour applies before the settings are opened.
  private readonly accent = inject(AccentService);
  private readonly wallpaper = inject(WallpaperService);

  /** CSS value for the wallpaper layer, or null to show the flat background colour. */
  readonly wallpaperImage = computed(() => {
    const url = this.wallpaper.imageUrl();
    return url ? `url("${url}")` : null;
  });

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
