import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, input, output } from '@angular/core';
import { gsap } from 'gsap';

import { ClockService } from '../../core/clock.service';
import { ConnectivityService } from '../../core/connectivity.service';
import { duration, reducedMotion } from '../../core/motion';
import { getAppDefinition } from '../../core/os/apps';
import { WindowManagerService, WindowState } from '../../core/os/window-manager.service';
import { IconComponent, IconName } from '../../shared/icon/icon.component';
import { LogoComponent } from '../../shared/logo/logo.component';

/**
 * Bottom bar: start button and open windows in the centre, system tray (network, pending sales, clock) on the right.
 */
@Component({
  selector: 'app-taskbar',
  imports: [IconComponent, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="taskbar glass" aria-label="Barre des tâches">
      <button
        type="button"
        class="start"
        aria-label="Menu Démarrer"
        [attr.aria-expanded]="startOpen()"
        [class.open]="startOpen()"
        (click)="toggleStart.emit()"
      >
        <app-logo [size]="22" />
      </button>

      @for (win of wm.windows(); track win.id) {
        <button
          type="button"
          class="app"
          [class.active]="wm.activeId() === win.id"
          [class.minimized]="win.minimized"
          [attr.aria-label]="win.title + (win.minimized ? ' (réduite)' : '')"
          (click)="onAppClick(win)"
        >
          <app-icon [name]="iconFor(win)" [size]="22" />
          <span class="indicator" aria-hidden="true"></span>
        </button>
      }
    </nav>

    <aside class="tray glass" aria-label="État du système">
      <span class="status" [class.offline]="!connectivity.online()">
        <app-icon [name]="connectivity.online() ? 'online' : 'offline'" [size]="18" />
        <span>{{ connectivity.online() ? 'En ligne' : 'Hors ligne' }}</span>
      </span>
      @if (connectivity.pendingSales() > 0) {
        <span class="pending" aria-live="polite">{{ connectivity.pendingSales() }} en attente</span>
      }
      <time class="time">{{ clock.time() }}</time>
    </aside>
  `,
  host: {
    class: 'taskbar-host',
  },
  styleUrl: './taskbar.component.scss',
})
export class TaskbarComponent implements AfterViewInit {
  readonly startOpen = input(false);
  readonly toggleStart = output<void>();

  readonly wm = inject(WindowManagerService);
  readonly clock = inject(ClockService);
  readonly connectivity = inject(ConnectivityService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    if (reducedMotion()) {
      return;
    }
    gsap.from(this.host.nativeElement, {
      y: 90,
      opacity: 0,
      duration: duration(0.6),
      ease: 'back.out(1.4)',
    });
  }

  iconFor(win: WindowState): IconName {
    return getAppDefinition(win.appId).icon;
  }

  /** Taskbar click: restore a minimized window, minimize the focused one, or bring another to the front. */
  onAppClick(win: WindowState): void {
    if (win.minimized) {
      this.wm.restore(win.id);
    } else if (this.wm.activeId() === win.id) {
      this.wm.minimize(win.id);
    } else {
      this.wm.focus(win.id);
    }
  }
}
