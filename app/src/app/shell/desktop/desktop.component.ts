import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { gsap } from 'gsap';

import { duration, reducedMotion } from '../../core/motion';
import { AppId, APPS } from '../../core/os/apps';
import { WindowManagerService } from '../../core/os/window-manager.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { StartMenuComponent } from '../start-menu/start-menu.component';
import { TaskbarComponent } from '../taskbar/taskbar.component';
import { WindowComponent } from '../window/window.component';

/** The desktop: app icons, open windows, the start menu and the taskbar. */
@Component({
  selector: 'app-desktop',
  imports: [IconComponent, WindowComponent, TaskbarComponent, StartMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="desktop">
      <nav class="icons" aria-label="Applications">
        @for (app of apps; track app.id) {
          <button type="button" class="icon" [attr.aria-label]="'Ouvrir ' + app.title" (click)="launch(app.id)">
            <span class="icon-tile glass"><app-icon [name]="app.icon" [size]="28" /></span>
            <span class="icon-label">{{ app.title }}</span>
          </button>
        }
      </nav>

      <div class="windows">
        @for (win of wm.windows(); track win.id) {
          <app-window [state]="win" />
        }
      </div>

      @if (startOpen()) {
        <app-start-menu (closed)="startOpen.set(false)" (launch)="launch($event)" />
      }

      <app-taskbar [startOpen]="startOpen()" (toggleStart)="toggleStart()" />
    </main>
  `,
  styleUrl: './desktop.component.scss',
})
export class DesktopComponent implements AfterViewInit {
  readonly wm = inject(WindowManagerService);
  readonly apps = APPS;
  readonly startOpen = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    if (reducedMotion()) {
      return;
    }
    gsap.from('.icon', {
      scale: 0.8,
      opacity: 0,
      duration: duration(0.5),
      ease: 'back.out(1.6)',
      stagger: 0.05,
      delay: 0.2,
    });
  }

  toggleStart(): void {
    this.startOpen.update((open) => !open);
  }

  launch(appId: AppId): void {
    this.wm.open(appId);
    this.startOpen.set(false);
  }
}
