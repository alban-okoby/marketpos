import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';

import { ClockService } from '../../core/clock.service';
import { PinGuardService, accountScope } from '../../core/session/pin-guard.service';
import { duration, reducedMotion } from '../../core/motion';
import { SessionService, SessionUser } from '../../core/session/session.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { LogoComponent } from '../../shared/logo/logo.component';

/** Sign-in steps: first the identifiant, then, once it is recognised, the password of that account. */
type Step = 'identifiant' | 'secret';

/**
 * Lock screen in two steps, like the Windows and macOS lock screens: type the identifiant, the account
 * appears with its picture and name, then type the password. The role comes from the account.
 */
@Component({
  selector: 'app-lock-screen',
  imports: [IconComponent, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'onEscape()',
  },
  template: `
    <section class="lock" aria-labelledby="lock-title">
      <div class="intro" #intro>
        <app-logo [size]="44" />
        <p class="clock">{{ clock.time() }}</p>
        <p class="date">{{ clock.date() }}</p>
      </div>

      <div class="signin" #card>
        @if (step() === 'identifiant') {
          <div class="avatar" aria-hidden="true"><app-icon name="user" [size]="56" /></div>
          <h1 id="lock-title" class="name">Connexion</h1>

          <form class="row" (submit)="$event.preventDefault(); nextStep()">
            <input
              #login
              type="text"
              autocomplete="username"
              autocapitalize="none"
              spellcheck="false"
              placeholder="Identifiant"
              aria-label="Identifiant"
              [value]="loginName()"
              (input)="onLogin($event)"
            />
            <button type="submit" class="go" aria-label="Suivant" [disabled]="loginName().trim() === ''">→</button>
          </form>

          <p class="error-text" role="alert">{{ error() }}</p>
        } @else {
          <div class="avatar" aria-hidden="true"><app-icon name="user" [size]="56" /></div>
          <h1 id="lock-title" class="name">{{ user()?.name }}</h1>
          <p class="role">{{ user()?.role }}</p>

          <form class="row" (submit)="$event.preventDefault(); submit()">
            <input
              #secret
              type="password"
              autocomplete="current-password"
              placeholder="Mot de passe"
              aria-label="Mot de passe"
              [value]="password()"
              (input)="onPassword($event)"
              [disabled]="blockedSeconds() > 0"
            />
            <button type="submit" class="go" aria-label="Se connecter" [disabled]="!canSubmit()">→</button>
          </form>

          <p class="error-text" role="alert">
            @if (blockedSeconds() > 0) {
              Trop de tentatives sur ce compte. Réessayez dans {{ blockedSeconds() }} s.
            } @else {
              {{ error() }}
            }
          </p>

          <button type="button" class="link" (click)="back()">Ce n'est pas vous ? Changer d'identifiant</button>
        }
      </div>

      <footer class="footer">MarketPOS · version 0.1</footer>
    </section>
  `,
  styleUrl: './lock-screen.component.scss',
})
export class LockScreenComponent implements AfterViewInit {
  /** Emits the id of the user once the password is verified and the transition has finished. */
  readonly unlocked = output<string>();

  readonly session = inject(SessionService);
  readonly clock = inject(ClockService);
  /** Counts wrong attempts; blocks the password field after too many (Sécurité settings). */
  readonly guard = inject(PinGuardService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly intro = viewChild.required<ElementRef<HTMLElement>>('intro');
  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');
  private readonly loginInput = viewChild<ElementRef<HTMLInputElement>>('login');
  private readonly secretInput = viewChild<ElementRef<HTMLInputElement>>('secret');

  /** The account the user has identified. Set once the identifiant is recognised. */
  readonly user = signal<SessionUser | null>(null);
  readonly step = signal<Step>('identifiant');
  readonly loginName = signal('');
  readonly password = signal('');
  readonly error = signal('');
  private busy = false;
  /** True while a password is being checked, so a second submit cannot start another check. */
  private checking = false;

  /** Seconds the identified account stays blocked. Zero when there is no block or no account yet. */
  readonly blockedSeconds = computed(() => {
    const account = this.user();
    return account ? this.guard.secondsLeft(accountScope(account.id)) : 0;
  });
  readonly canSubmit = computed(() => this.password() !== '' && this.blockedSeconds() === 0);

  constructor() {
    // The account signed in before locking is already identified: go straight to its password.
    const previous = this.session.user();
    if (previous) {
      this.loginName.set(this.session.loginOf(previous.id));
      this.user.set(previous);
      this.step.set('secret');
    }
  }

  ngAfterViewInit(): void {
    this.playIntro();
    this.focusField();
  }

  onLogin(event: Event): void {
    this.error.set('');
    this.loginName.set((event.target as HTMLInputElement).value);
  }

  onPassword(event: Event): void {
    this.error.set('');
    this.password.set((event.target as HTMLInputElement).value);
  }

  /** Step 1: the identifiant must belong to an active account. Then the password field appears. */
  nextStep(): void {
    const found = this.session.findByLogin(this.loginName());
    if (!found) {
      this.error.set('Identifiant inconnu.');
      return;
    }
    this.user.set(found);
    this.error.set('');
    this.goTo('secret');
  }

  /** Back to the identifiant, for another account. */
  back(): void {
    if (this.busy) {
      return;
    }
    this.user.set(null);
    this.password.set('');
    this.error.set('');
    this.goTo('identifiant');
  }

  onEscape(): void {
    if (this.busy) {
      return;
    }
    if (this.step() === 'secret') {
      this.password.set('');
      this.error.set('');
    } else {
      this.loginName.set('');
      this.error.set('');
    }
  }

  async submit(): Promise<void> {
    const account = this.user();
    if (this.busy || this.checking || !account || !this.canSubmit()) {
      return;
    }
    this.checking = true;
    const userId = await this.session.checkPassword(this.session.loginOf(account.id), this.password());
    this.checking = false;
    if (userId) {
      this.guard.reset(accountScope(account.id));
      this.busy = true;
      this.playUnlock(userId);
    } else {
      this.guard.fail(accountScope(account.id));
      this.error.set('Mot de passe incorrect.');
      this.password.set('');
      this.shake();
      this.focusField();
    }
  }

  private goTo(next: Step): void {
    this.step.set(next);
    afterNextRender(() => this.focusField(), { injector: this.injector });
  }

  private focusField(): void {
    const field = this.step() === 'identifiant' ? this.loginInput() : this.secretInput();
    field?.nativeElement.focus();
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
      y: 30,
      opacity: 0,
      duration: 0.7,
      delay: 0.15,
      ease: 'power3.out',
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
      { x: -12 },
      { x: 0, duration: duration(0.6), ease: 'elastic.out(1, 0.25)' },
    );
  }
}
