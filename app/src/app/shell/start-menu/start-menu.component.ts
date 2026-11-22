import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';

import { duration, reducedMotion } from '../../core/motion';
import { AppId } from '../../core/os/apps';
import { ModuleSettingsService } from '../../core/os/module-settings.service';
import { SessionService } from '../../core/session/session.service';
import { TaskbarSettingsService } from '../../core/taskbar/taskbar-settings.service';
import { IconComponent } from '../../shared/icon/icon.component';

/** Start menu: search, app grid, and user actions (lock, sign out). It opens next to the taskbar. */
@Component({
  selector: 'app-start-menu',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'close()',
    '[class]': 'anchorClass()',
  },
  template: `
    <div class="backdrop" (click)="close()" aria-hidden="true"></div>

    <section class="start glass" #panel role="dialog" aria-label="Menu Démarrer">
      <label class="search">
        <app-icon name="search" [size]="18" />
        <input
          #search
          type="search"
          placeholder="Rechercher une application"
          aria-label="Rechercher une application"
          [value]="query()"
          (input)="onSearch($event)"
          (keydown.enter)="launchFirst()"
        />
      </label>

      <h2 class="section-title">Applications</h2>

      <div class="grid">
        @for (app of filtered(); track app.id) {
          <button type="button" class="tile" (click)="launchApp(app.id)">
            <span class="tile-icon"><app-icon [name]="app.icon" [size]="26" /></span>
            <span class="tile-title">{{ app.title }}</span>
            @if (app.phase === 2) {
              <span class="badge">Phase 2</span>
            }
          </button>
        } @empty {
          <p class="empty">Aucune application ne correspond.</p>
        }
      </div>

      <footer class="footer">
        <div class="user">
          <span class="avatar"><app-icon name="user" [size]="18" /></span>
          <span>{{ userName() }}</span>
        </div>
        <div class="actions">
          <button type="button" class="ghost" aria-label="Verrouiller" title="Verrouiller" (click)="lock()">
            <app-icon name="lock" [size]="18" />
          </button>
          <button type="button" class="ghost" aria-label="Se déconnecter" title="Se déconnecter" (click)="signOut()">
            <app-icon name="power" [size]="18" />
          </button>
        </div>
      </footer>
    </section>
  `,
  styleUrl: './start-menu.component.scss',
})
export class StartMenuComponent implements AfterViewInit {
  /** Emitted after the close animation, so the parent can remove the menu. */
  readonly closed = output<void>();
  readonly launch = output<AppId>();

  private readonly session = inject(SessionService);
  private readonly modules = inject(ModuleSettingsService);
  private readonly taskbar = inject(TaskbarSettingsService);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly search = viewChild.required<ElementRef<HTMLInputElement>>('search');
  private closing = false;

  /** Classes that place the menu next to the start button: the taskbar side and its alignment. */
  readonly anchorClass = computed(() => `anchor-${this.taskbar.position()} anchor-${this.taskbar.alignment()}`);

  readonly query = signal('');
  readonly filtered = computed(() => {
    const apps = this.modules.enabledApps();
    const term = this.query().trim().toLowerCase();
    if (!term) {
      return apps;
    }
    return apps.filter((app) => `${app.title} ${app.description}`.toLowerCase().includes(term));
  });
  readonly userName = computed(() => this.session.user()?.name ?? '');

  constructor() {
    afterNextRender(() => this.search().nativeElement.focus());
  }

  ngAfterViewInit(): void {
    if (reducedMotion()) {
      return;
    }
    gsap.from(this.panel().nativeElement, { y: 40, opacity: 0, scale: 0.98, duration: 0.3, ease: 'power3.out' });
    gsap.from(this.panel().nativeElement.querySelectorAll('.tile'), {
      y: 12,
      opacity: 0,
      duration: 0.3,
      stagger: 0.03,
      delay: 0.08,
      ease: 'power2.out',
    });
  }

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  launchFirst(): void {
    const first = this.filtered()[0];
    if (first) {
      this.launchApp(first.id);
    }
  }

  launchApp(appId: AppId): void {
    this.launch.emit(appId);
  }

  lock(): void {
    this.session.lock();
  }

  signOut(): void {
    this.session.signOut();
  }

  /** Slides the menu down and then reports it closed. */
  close(): void {
    if (this.closing) {
      return;
    }
    this.closing = true;
    gsap.to(this.panel().nativeElement, {
      y: 30,
      opacity: 0,
      duration: duration(0.2),
      ease: 'power2.in',
      onComplete: () => this.closed.emit(),
    });
  }
}
