import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';

import { ClockService } from '../../core/clock.service';
import { ConnectivityService } from '../../core/connectivity.service';
import { duration, reducedMotion } from '../../core/motion';
import { getAppDefinition } from '../../core/os/apps';
import { WindowManagerService, WindowState } from '../../core/os/window-manager.service';
import { TaskbarSettingsService } from '../../core/taskbar/taskbar-settings.service';
import { IconComponent, IconName } from '../../shared/icon/icon.component';
import { LogoComponent } from '../../shared/logo/logo.component';
import { barOutline } from './taskbar-outline';
import { TaskbarSurfaceComponent } from './taskbar-surface.component';

const HIDE_DELAY_MS = 500;
/** Space above a horizontal bar where the swelling rises. Must match the surface height in the stylesheet. */
const HEADROOM = 40;
/** How far the swelling rises above the bar, in px. */
const SWELL_RISE = 30;
/** Space on each side of the hovered item that the swelling covers, in px. */
const SWELL_PAD = 14;
/** Corner radius of the bar. Must match the taskbar corner radius in the stylesheet. */
const BAR_RADIUS = 16;

/** Start or app button, as opposed to the surface or outline elements in the bar. */
function isItem(element: Element | null): element is HTMLElement {
  return element !== null && element.matches('.start, .app');
}

/**
 * Taskbar: start button and open windows, plus the system tray (network, pending sales, clock).
 * Position, alignment and auto-hide come from TaskbarSettingsService.
 */
@Component({
  selector: 'app-taskbar',
  imports: [IconComponent, LogoComponent, TaskbarSurfaceComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav #bar class="taskbar" aria-label="Barre des tâches" (mouseleave)="hideSwell()">
      <app-taskbar-surface [class.horizontal]="horizontal()" [class.flip]="flipped()" />
      <button
        type="button"
        class="start"
        aria-label="Menu Démarrer"
        [attr.aria-expanded]="startOpen()"
        [class.open]="startOpen()"
        (click)="toggleStart.emit()"
        (mouseenter)="raise($event)"
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
          (mouseenter)="raise($event)"
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
    '(window:resize)': 'draw()',
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

  private readonly barRef = viewChild.required<ElementRef<HTMLElement>>('bar');
  private readonly surface = viewChild.required(TaskbarSurfaceComponent);

  /** Horizontal bars (top or bottom) can swell; vertical ones keep their plain shape. */
  readonly horizontal = computed(() => {
    const position = this.settings.position();
    return position === 'bottom' || position === 'top';
  });
  /** A top bar is drawn flipped, so its swelling drops below it. */
  readonly flipped = computed(() => this.settings.position() === 'top');

  /** Span of the swelling and its height, animated by GSAP. A rise of zero is a plain bar. */
  private readonly swell = { from: 0, to: 0, rise: 0 };

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
    this.draw();
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

  /** The swelling covers the hovered item and half of each neighbour, up to the next item's centre. */
  raise(event: MouseEvent): void {
    if (!this.horizontal()) {
      return;
    }
    const button = event.currentTarget as HTMLElement;
    const left = button.offsetLeft;
    const right = left + button.offsetWidth;
    const previous = button.previousElementSibling;
    const next = button.nextElementSibling;
    const from = isItem(previous) ? previous.offsetLeft + previous.offsetWidth / 2 : left - SWELL_PAD;
    const to = isItem(next) ? next.offsetLeft + next.offsetWidth / 2 : right + SWELL_PAD;
    this.animateSwell(from, to, SWELL_RISE);
  }

  hideSwell(): void {
    this.animateSwell(this.swell.from, this.swell.to, 0);
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

  /** Animates the swelling toward a span and a rise. Overwrites a running animation so the motion follows the pointer. */
  private animateSwell(from: number, to: number, rise: number): void {
    if (this.swell.rise < 0.5) {
      // Starting from a plain bar: the swelling appears at the item, then grows.
      this.swell.from = from;
      this.swell.to = to;
    }
    gsap.to(this.swell, {
      from,
      to,
      rise,
      duration: duration(0.28),
      ease: 'power3.out',
      overwrite: true,
      onUpdate: () => this.draw(),
    });
    if (reducedMotion()) {
      this.swell.from = from;
      this.swell.to = to;
      this.swell.rise = rise;
      this.draw();
    }
  }

  /** Writes the current outline to the bar's glass surface (its clip) and to its stroke. */
  private draw(): void {
    const bar = this.barRef().nativeElement;
    const headroom = this.horizontal() ? HEADROOM : 0;
    const width = bar.offsetWidth;
    const height = bar.offsetHeight;
    const d = barOutline({
      width,
      height,
      headroom,
      radius: BAR_RADIUS,
      from: this.swell.from,
      to: this.swell.to,
      rise: this.horizontal() ? this.swell.rise : 0,
    });
    this.surface().paint(d, width, height + headroom);
  }
}
