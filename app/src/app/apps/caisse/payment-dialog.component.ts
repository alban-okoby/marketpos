import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, input, output, signal, viewChild } from '@angular/core';

import { formatFcfa } from './catalogue';
import { BANKNOTE_SHORTCUTS, cashPaymentStatus } from './sales.service';

/** Cash payment: amount received, banknote shortcuts, change to give back. */
@Component({
  selector: 'app-payment-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'cancelled.emit()',
    '(keydown.enter)': 'submit()',
  },
  template: `
    <div class="overlay">
      <section class="dialog glass" role="dialog" aria-modal="true" aria-labelledby="pay-title">
        <h2 id="pay-title">Encaissement en espèces</h2>

        <p class="due">
          <span>À payer</span>
          <strong>{{ fmt(total()) }}</strong>
        </p>

        <label class="field">
          <span>Montant reçu</span>
          <input
            #received
            type="number"
            inputmode="numeric"
            min="0"
            step="1"
            [value]="amount() || ''"
            (input)="onInput($event)"
            aria-label="Montant reçu"
          />
        </label>

        <div class="shortcuts">
          <button type="button" class="exact" (click)="setAmount(total())">Montant exact</button>
          @for (banknote of banknotes; track banknote) {
            <button type="button" (click)="setAmount(banknote)">{{ fmt(banknote) }}</button>
          }
        </div>

        <p class="change" aria-live="polite">
          Rendu <strong>{{ fmt(status().change) }}</strong>
        </p>

        @if (status().insufficient) {
          <p class="error" role="alert">Montant reçu insuffisant.</p>
        }

        <div class="actions">
          <button type="button" class="secondary" (click)="cancelled.emit()">Annuler (Échap)</button>
          <button type="button" class="primary" [disabled]="!status().canValidate" (click)="submit()">
            Valider (Entrée)
          </button>
        </div>
      </section>
    </div>
  `,
  styleUrl: './payment-dialog.component.scss',
})
export class PaymentDialogComponent {
  readonly total = input.required<number>();
  readonly validated = output<number>();
  readonly cancelled = output<void>();

  readonly banknotes = BANKNOTE_SHORTCUTS;
  readonly amount = signal(0);
  readonly status = computed(() => cashPaymentStatus(this.total(), this.amount()));

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('received');

  constructor() {
    afterNextRender(() => this.field().nativeElement.focus());
  }

  fmt(amount: number): string {
    return formatFcfa(amount);
  }

  onInput(event: Event): void {
    this.amount.set(Number((event.target as HTMLInputElement).value) || 0);
  }

  setAmount(value: number): void {
    this.amount.set(value);
    this.field().nativeElement.value = String(value);
  }

  submit(): void {
    if (this.status().canValidate) {
      this.validated.emit(this.amount());
    }
  }
}
