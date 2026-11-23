import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';

import { ClockService } from '../../core/clock.service';
import { PinGuardService } from '../../core/session/pin-guard.service';
import { duration, reducedMotion } from '../../core/motion';
import { SessionService } from '../../core/session/session.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { LogoComponent } from '../../shared/logo/logo.component';

const PIN_LENGTH = 4;
/** Keypad layout. An empty string is a spacer; '⌫' is the backspace key. */
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

/**
 * Lock screen: choose a user, enter the PIN, then the screen dissolves into the desktop.
 * Keyboard input (digits, Backspace, Escape) works for PIN entry on a physical keyboard or scanner station.
 */
@Component({
  selector: 'app-lock-screen',
  imports: [IconComponent, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
  template: `
    <section class="lock" aria-labelledby="lock-title">
      <div class="intro" #intro>
        <app-logo [size]="44" />
        <p class="clock">{{ clock.time() }}</p>
        <p class="date">{{ clock.date() }}</p>
      </div>

      <div class="card glass" #card>
        <div class="users" role="radiogroup" aria-label="Utilisateur">
          @for (user of session.users; track user.id) {
            <button
              type="button"
              role="radio"
              class="user"
              [class.selected]="user.id === selectedId()"
              [attr.aria-checked]="user.id === selectedId()"
              (click)="selectUser(user.id)"
            >
              <span class="avatar"><app-icon name="user" [size]="22" /></span>
              <span class="user-name">{{ user.name }}</span>
              <span class="user-role">{{ user.role }}</span>
            </button>
          }
        </div>

        <h1 id="lock-title" class="prompt">Bonjour, {{ selectedName() }}</h1>
        <p class="hint">Saisissez votre code PIN</p>

        <div class="dots" [attr.aria-label]="pin().length + ' chiffres saisis sur ' + pinLength">
          @for (slot of slots; track slot) {
            <span class="dot" [class.filled]="slot < pin().length" [class.error]="error()"></span>
          }
        </div>

        <p class="error-text" role="alert">
          @if (guard.secondsLeft('session') > 0) {
            Trop de tentatives. Réessayez dans {{ guard.secondsLeft('session') }} s.
          } @else if (error()) {
            Code PIN incorrect
          }
        </p>

        <div class="keypad">
          @for (key of keys; track $index) {
            @if (key === '⌫') {
              <button type="button" class="key key-secondary" aria-label="Effacer" (click)="backspace()">
                <app-icon name="backspace" [size]="22" />
              </button>
            } @else if (key === '') {
              <span class="key-spacer" aria-hidden="true"></span>
            } @else {
              <button type="button" class="key" (click)="press(key)">{{ key }}</button>
            }
          }
        </div>
      </div>

      <footer class="footer">MarketPOS · version 0.1</footer>
    </section>
  `,
  styleUrl: './lock-screen.component.scss',
})
export class LockScreenComponent implements AfterViewInit {
  /** Emits the id of the user once the PIN is verified and the transition has finished. */
  readonly unlocked = output<string>();

  readonly session = inject(SessionService);
  readonly clock = inject(ClockService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly intro = viewChild.required<ElementRef<HTMLElement>>('intro');
  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');

  readonly keys = KEYS;
  readonly pinLength = PIN_LENGTH;
  readonly slots = Array.from({ length: PIN_LENGTH }, (_, index) => index);

  /** Preselects the user who was signed in before locking, otherwise the first user. */
  readonly selectedId = signal(this.session.user()?.id ?? this.session.users[0].id);
  readonly pin = signal('');
  readonly error = signal(false);
  private busy = false;

  /** Counts wrong PINs; blocks the keypad after too many attempts (Sécurité settings). */
  readonly guard = inject(PinGuardService);

  readonly selectedName = computed(() => this.session.findUser(this.selectedId())?.name ?? '');

  ngAfterViewInit(): void {
    this.playIntro();
  }

  onKeydown(event: KeyboardEvent): void {
    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      this.press(event.key);
    } else if (event.key === 'Backspace') {
      this.backspace();
    } else if (event.key === 'Escape') {
      this.clear();
    }
  }

  selectUser(userId: string): void {
    if (this.busy) {
      return;
    }
    this.selectedId.set(userId);
    this.clear();
  }

  press(digit: string): void {
    if (this.busy || this.guard.secondsLeft('session') > 0 || this.pin().length >= PIN_LENGTH) {
      return;
    }
    const next = this.pin() + digit;
    this.error.set(false);
    this.pin.set(next);
    if (next.length === PIN_LENGTH) {
      this.submit(next);
    }
  }

  backspace(): void {
    if (this.busy) {
      return;
    }
    this.error.set(false);
    this.pin.update((value) => value.slice(0, -1));
  }

  private clear(): void {
    this.pin.set('');
    this.error.set(false);
  }

  private submit(pin: string): void {
    const userId = this.selectedId();
    if (this.session.verifyPin(userId, pin)) {
      this.guard.reset('session');
      this.busy = true;
      this.playUnlock(userId);
    } else {
      this.guard.fail('session');
      this.error.set(true);
      this.pin.set('');
      this.shake();
    }
  }

  private playIntro(): void {
    if (reducedMotion()) {
      return;
    }
    gsap.from(this.intro().nativeElement.children, {
      y: 24,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.08,
    });
    gsap.from(this.card().nativeElement, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      delay: 0.15,
      ease: 'power4.out',
    });
  }

  /** The screen dissolves into the desktop; the session is only changed when the animation ends. */
  private playUnlock(userId: string): void {
    const timeline = gsap.timeline({
      onComplete: () => this.unlocked.emit(userId),
    });
    timeline
      .to(this.card().nativeElement, { y: -24, opacity: 0, duration: duration(0.3), ease: 'power2.in' })
      .to(this.intro().nativeElement, { y: -60, opacity: 0, duration: duration(0.55), ease: 'power3.in' }, '<')
      .to(this.host.nativeElement, { scale: 1.06, opacity: 0, duration: duration(0.5), ease: 'power2.in' }, '-=0.2');
  }

  private shake(): void {
    gsap.fromTo(
      this.card().nativeElement,
      { x: -14 },
      { x: 0, duration: duration(0.6), ease: 'elastic.out(1, 0.25)' },
    );
  }
}
