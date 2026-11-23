import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';
import { gsap } from 'gsap';

import { ClockService } from '../../core/clock.service';
import { ConnectivityService } from '../../core/connectivity.service';
import { duration, reducedMotion } from '../../core/motion';
import { getAppDefinition } from '../../core/os/apps';
import { WindowManagerService, WindowState } from '../../core/os/window-manager.service';
import { TaskbarSettingsService } from '../../core/taskbar/taskbar-settings.service';
import { IconComponent, IconName } from '../../shared/icon/icon.component';
import { LogoComponent } from '../../shared/logo/logo.component';

const HIDE_DELAY_MS = 500;

/**
 * Taskbar: start button and open windows, plus the system tray (network, pending sales, clock).
 * Position, alignment and auto-hide come from TaskbarSettingsService.
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
        <span class="glyph"><app-logo [size]="22" /></span>
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
          <span class="glyph"><app-icon [name]="iconFor(win)" [size]="22" /></span>
          <span class="indicator" aria-hidden="true"></span>
        </button>
      }
    </nav>

    <!-- The tray is shown only while sales are waiting: connection status and clock are commented out. -->
    @if (connectivity.pendingSales() > 0) {
      <aside class="tray glass" aria-label="Ventes en attente">
        <span class="status" [class.offline]="!connectivity.online()">
          <!-- <app-icon [name]="connectivity.online() ? 'online' : 'offline'" [size]="18" /> -->
          <!-- <span class="label">{{ connectivity.online() ? 'En ligne' : 'Hors ligne' }}</span> -->
        </span>
        <span class="pending" aria-live="polite">
          {{ connectivity.pendingSales() }} <span class="label">en attente</span>
        </span>
        <!-- <time class="time">{{ clock.time() }}</time> -->
      </aside>
    }

    @if (settings.autoHide()) {
      <div class="edge" aria-hidden="true" (mouseenter)="reveal()" (mouseleave)="scheduleHide()"></div>
    }
  `,
  host: {
    '[class]': 'hostClasses()',
    '(mouseenter)': 'reveal()',
    '(mouseleave)': 'scheduleHide()',
  },
  styleUrl: './taskbar.component.scss',
})
export class TaskbarComponent implements AfterViewInit {
  readonly startOpen = input(false);
  readonly toggleStart = output<void>();

  readonly wm = inject(WindowManagerService);
  readonly clock = inject(ClockService);
  readonly connectivity = inject(ConnectivityService);
  readonly settings = inject(TaskbarSettingsService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** True while the pointer is on the bar or its edge, or while the start menu is open. */
  private readonly revealed = signal(false);
  private hideTimer: ReturnType<typeof setTimeout> | undefined;

  readonly hidden = computed(() => this.settings.autoHide() && !this.revealed() && !this.startOpen());

  readonly hostClasses = computed(() =>
    [
      'taskbar-host',
      `pos-${this.settings.position()}`,
      `align-${this.settings.alignment()}`,
      this.hidden() ? 'hidden-state' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  ngAfterViewInit(): void {
    if (reducedMotion()) {
      return;
    }
    gsap.from(this.host.nativeElement, {
      opacity: 0,
      duration: duration(0.6),
      ease: 'power2.out',
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

  reveal(): void {
    clearTimeout(this.hideTimer);
    this.revealed.set(true);
  }

  /** Hides the bar after a short delay, so moving across the edge does not make it flicker. */
  scheduleHide(): void {
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.revealed.set(false), HIDE_DELAY_MS);
  }
}
