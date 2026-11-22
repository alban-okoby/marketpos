import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

import { ModuleAppComponent } from '../../apps/module-app/module-app.component';
import { SettingsAppComponent } from '../../apps/settings/settings-app.component';
import { duration } from '../../core/motion';
import { getAppDefinition } from '../../core/os/apps';
import { WindowManagerService, WindowState } from '../../core/os/window-manager.service';
import { IconComponent } from '../../shared/icon/icon.component';

gsap.registerPlugin(Draggable);

/**
 * A window: a draggable frame with minimize, maximize and close.
 * Open, minimize and close are animated; the window keeps its position across lock and unlock.
 */
@Component({
  selector: 'app-window',
  imports: [IconComponent, ModuleAppComponent, SettingsAppComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'window-host',
    '[class.hidden]': 'hidden()',
    '[class.maximized]': 'state().maximized',
    '[class.active]': 'isActive()',
    '[style.z-index]': 'state().z',
    '[style.width.px]': 'state().maximized ? null : state().width',
    '[style.height.px]': 'state().maximized ? null : state().height',
    '(pointerdown)': 'focusWindow()',
  },
  template: `
    <div class="frame" #frame role="region" [attr.aria-label]="state().title">
      <header class="titlebar" #titlebar (dblclick)="toggleMaximize()">
        <span class="title">
          <app-icon [name]="appIcon()" [size]="16" />
          {{ state().title }}
        </span>
        <div class="controls">
          <button type="button" class="ctl" aria-label="Réduire" (click)="minimize()">
            <app-icon name="minus" [size]="16" />
          </button>
          <button
            type="button"
            class="ctl"
            [attr.aria-label]="state().maximized ? 'Restaurer' : 'Agrandir'"
            (click)="toggleMaximize()"
          >
            <app-icon name="square" [size]="14" />
          </button>
          <button type="button" class="ctl ctl-close" aria-label="Fermer" (click)="close()">
            <app-icon name="close" [size]="16" />
          </button>
        </div>
      </header>

      <div class="content" [class.flush]="state().appId === 'parametres'">
        @switch (state().appId) {
          @case ('parametres') {
            <app-settings-app />
          }
          @default {
            <app-module-app [appId]="state().appId" />
          }
        }
      </div>
    </div>
  `,
  styleUrl: './window.component.scss',
})
export class WindowComponent implements AfterViewInit {
  readonly state = input.required<WindowState>();

  private readonly wm = inject(WindowManagerService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly frame = viewChild.required<ElementRef<HTMLElement>>('frame');
  private readonly titlebar = viewChild.required<ElementRef<HTMLElement>>('titlebar');

  readonly hidden = signal(false);
  readonly isActive = computed(() => this.wm.activeId() === this.state().id);
  readonly appIcon = computed(() => getAppDefinition(this.state().appId).icon);

  private readonly minimized = computed(() => this.state().minimized);
  private readonly maximized = computed(() => this.state().maximized);
  private draggable: Draggable | undefined;
  private viewReady = false;

  constructor() {
    // Animate only when the minimized flag changes, not on every state update.
    effect(() => {
      const minimized = this.minimized();
      if (!this.viewReady) {
        return;
      }
      untracked(() => (minimized ? this.animateOut() : this.animateIn()));
    });

    effect(() => {
      const maximized = this.maximized();
      if (!this.viewReady) {
        return;
      }
      untracked(() => this.applyMaximized(maximized));
    });
  }

  ngAfterViewInit(): void {
    const { x, y } = this.state();
    gsap.set(this.host.nativeElement, { x, y });

    const [draggable] = Draggable.create(this.host.nativeElement, {
      trigger: this.titlebar().nativeElement,
      bounds: this.host.nativeElement.parentElement ?? undefined,
      onDragEnd: () => this.wm.moveTo(this.state().id, draggable.x, draggable.y),
    });
    this.draggable = draggable;

    this.viewReady = true;
    if (this.state().minimized) {
      this.hidden.set(true);
    } else {
      this.animateIn();
    }
    if (this.state().maximized) {
      this.applyMaximized(true);
    }
  }

  focusWindow(): void {
    this.wm.focus(this.state().id);
  }

  minimize(): void {
    this.wm.minimize(this.state().id);
  }

  toggleMaximize(): void {
    this.wm.toggleMaximize(this.state().id);
  }

  close(): void {
    gsap.to(this.frame().nativeElement, {
      scale: 0.94,
      opacity: 0,
      duration: duration(0.2),
      ease: 'power2.in',
      onComplete: () => this.wm.close(this.state().id),
    });
  }

  private animateIn(): void {
    this.hidden.set(false);
    gsap.killTweensOf(this.frame().nativeElement);
    gsap.fromTo(
      this.frame().nativeElement,
      { scale: 0.92, opacity: 0, y: 24 },
      { scale: 1, opacity: 1, y: 0, duration: duration(0.32), ease: 'power3.out', clearProps: 'transform,opacity' },
    );
  }

  /** Shrinks the window toward the taskbar and hides it when the animation ends. */
  private animateOut(): void {
    gsap.killTweensOf(this.frame().nativeElement);
    gsap.to(this.frame().nativeElement, {
      scale: 0.5,
      opacity: 0,
      y: 240,
      duration: duration(0.28),
      ease: 'power2.in',
      onComplete: () => this.hidden.set(true),
    });
  }

  private applyMaximized(maximized: boolean): void {
    this.draggable?.[maximized ? 'disable' : 'enable']();
    if (maximized) {
      gsap.set(this.host.nativeElement, { x: 0, y: 0 });
    } else {
      const { x, y } = this.state();
      gsap.set(this.host.nativeElement, { x, y });
    }
  }
}
