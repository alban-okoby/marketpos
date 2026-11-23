import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, input, output, signal, viewChild } from '@angular/core';

import { formatFcfa } from './catalogue';
import { BANKNOTE_SHORTCUTS, PaymentLine, PaymentMethod, splitPaymentStatus } from './sales.service';

export const PAYMENT_METHOD_LABELS: Readonly<Record<PaymentMethod, string>> = {
  ESPECES: 'Espèces',
  CARTE: 'Carte',
  MOBILE_MONEY: 'Mobile money',
};

/** Payment with one or several methods (CA-05). Cash gives change; card and mobile money need a reference. */
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
        <h2 id="pay-title">Encaissement</h2>

        <p class="due">
          <span>À payer</span>
          <strong>{{ fmt(total()) }}</strong>
        </p>

        <div class="methods" role="group" aria-label="Moyen de paiement">
          @for (option of methods; track option.value) {
            <button
              type="button"
              [class.selected]="method() === option.value"
              [attr.aria-pressed]="method() === option.value"
              (click)="setMethod(option.value)"
            >
              {{ option.label }}
            </button>
          }
        </div>

        <label class="field">
          <span>{{ isCash() ? 'Montant reçu' : 'Montant' }}</span>
          <input
            #received
            type="number"
            inputmode="numeric"
            min="0"
            step="1"
            [value]="amount() || ''"
            (input)="onInput($event)"
            [attr.aria-label]="isCash() ? 'Montant reçu' : 'Montant du paiement'"
          />
        </label>

        @if (!isCash()) {
          <label class="field">
            <span>Référence de la transaction</span>
            <input
              type="text"
              autocomplete="off"
              [value]="reference()"
              (input)="onReference($event)"
              aria-label="Référence de la transaction"
            />
          </label>
        }

        @if (isCash()) {
          <div class="shortcuts">
            <button type="button" class="exact" (click)="setAmount(remainingDue())">Montant exact</button>
            @for (banknote of banknotes; track banknote) {
              <button type="button" (click)="setAmount(banknote)">{{ fmt(banknote) }}</button>
            }
          </div>
        }

        <button type="button" class="add" [disabled]="!pendingValid()" (click)="addLine()">
          Ajouter ce paiement
        </button>

        @if (lines().length > 0) {
          <ul class="lines" aria-label="Paiements enregistrés">
            @for (line of lines(); track $index; let i = $index) {
              <li>
                <span>{{ label(line.method) }}</span>
                @if (line.reference) {
                  <span class="ref">{{ line.reference }}</span>
                }
                <strong>{{ fmt(line.amount) }}</strong>
                <button type="button" (click)="removeLine(i)" [attr.aria-label]="'Retirer le paiement ' + label(line.method)">×</button>
              </li>
            }
          </ul>
        }

        @if (status().remaining > 0) {
          <p class="change" aria-live="polite">
            Reste à payer <strong>{{ fmt(status().remaining) }}</strong>
          </p>
        } @else {
          <p class="change" aria-live="polite">
            Rendu <strong>{{ fmt(status().change) }}</strong>
          </p>
        }

        @if (hasInput() && status().reason; as reason) {
          <p class="error" role="alert">{{ reason }}</p>
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
  readonly validated = output<PaymentLine[]>();
  readonly cancelled = output<void>();

  readonly banknotes = BANKNOTE_SHORTCUTS;
  readonly methods = (Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((value) => ({
    value,
    label: PAYMENT_METHOD_LABELS[value],
  }));

  readonly method = signal<PaymentMethod>('ESPECES');
  readonly amount = signal(0);
  readonly reference = signal('');
  /** Payments already added to this receipt. */
  readonly lines = signal<PaymentLine[]>([]);

  readonly isCash = computed(() => this.method() === 'ESPECES');
  /** Amount still to be covered by the lines already added. */
  readonly remainingDue = computed(() => splitPaymentStatus(this.total(), this.lines()).remaining);
  /** The payment typed in the form, not yet added to the list. */
  readonly pending = computed<PaymentLine | null>(() => {
    const amount = this.amount();
    if (amount <= 0) {
      return null;
    }
    return this.isCash()
      ? { method: 'ESPECES', amount }
      : { method: this.method(), amount, reference: this.reference().trim() };
  });
  readonly pendingValid = computed(() => {
    const line = this.pending();
    return line !== null && Number.isInteger(line.amount) && (this.isCash() || !!line.reference);
  });
  readonly hasInput = computed(() => this.lines().length > 0 || this.amount() > 0);
  readonly status = computed(() => {
    const pending = this.pending();
    return splitPaymentStatus(this.total(), pending ? [...this.lines(), pending] : this.lines());
  });

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('received');

  constructor() {
    afterNextRender(() => this.field().nativeElement.focus());
  }

  fmt(amount: number): string {
    return formatFcfa(amount);
  }

  label(method: PaymentMethod): string {
    return PAYMENT_METHOD_LABELS[method];
  }

  setMethod(method: PaymentMethod): void {
    this.method.set(method);
    if (method === 'ESPECES') {
      this.reference.set('');
    }
    this.setAmount(this.remainingDue());
  }

  onInput(event: Event): void {
    this.amount.set(Number((event.target as HTMLInputElement).value) || 0);
  }

  onReference(event: Event): void {
    this.reference.set((event.target as HTMLInputElement).value);
  }

  setAmount(value: number): void {
    this.amount.set(value);
    this.field().nativeElement.value = value ? String(value) : '';
  }

  addLine(): void {
    const line = this.pending();
    if (!line || !this.pendingValid()) {
      return;
    }
    this.lines.update((current) => [...current, line]);
    this.reference.set('');
    this.setAmount(this.remainingDue());
  }

  removeLine(index: number): void {
    this.lines.update((current) => current.filter((_, i) => i !== index));
    this.setAmount(this.remainingDue());
  }

  submit(): void {
    if (!this.status().canValidate) {
      return;
    }
    const pending = this.pending();
    this.validated.emit(pending ? [...this.lines(), pending] : this.lines());
  }
}
