import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';

import { formatFcfa } from './catalogue';
import { CustomerChannelService, CustomerScreenState, EMPTY_CUSTOMER_SCREEN } from './customer-channel.service';

/**
 * Customer display: the ticket in progress, its total and a short message, read from the cashier window.
 * It runs in its own window, opened with ?client=1, and has no controls.
 */
@Component({
  selector: 'app-customer-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="display">
      @if (state().message) {
        <p class="message" role="status">{{ state().message }}</p>
      }

      <ul class="lines">
        @for (line of state().lines; track $index) {
          <li>
            <span>{{ line.qty }} × {{ line.name }}</span>
            <span>{{ fmt(line.price * line.qty) }}</span>
          </li>
        } @empty {
          <li class="welcome">Bienvenue</li>
        }
      </ul>

      <div class="total">
        <span>Total</span>
        <strong>{{ fmt(state().total) }}</strong>
      </div>
    </main>
  `,
  styleUrl: './customer-display.component.scss',
})
export class CustomerDisplayComponent {
  readonly state = signal<CustomerScreenState>(EMPTY_CUSTOMER_SCREEN);

  constructor() {
    const stop = inject(CustomerChannelService).listen((next) => this.state.set(next));
    inject(DestroyRef).onDestroy(stop);
  }

  fmt(amount: number): string {
    return formatFcfa(amount);
  }
}
