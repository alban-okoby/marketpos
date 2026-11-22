import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { formatFcfa } from './catalogue';
import { Sale } from './sales.service';

/**
 * Thermal receipt (80 mm). It is hidden on screen and shown only when printing: the print styles in styles.scss
 * hide the rest of the page.
 */
@Component({
  selector: 'app-ticket-print',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (sale(); as s) {
      <div class="print-area" aria-hidden="true">
        <p class="center"><strong>MARKETPOS</strong><br />Ticket non fiscal</p>
        <hr />
        <p>Ticket : {{ s.number }}</p>
        <p>Date : {{ dateLabel(s.date) }}</p>
        <p>Caissier : {{ s.cashier }}</p>
        <hr />
        @for (line of s.lines; track line.code) {
          <div class="row">
            <span>{{ line.qty }} x {{ line.name }}</span>
            <span>{{ fmt(line.price * line.qty) }}</span>
          </div>
        }
        <hr />
        <div class="row"><strong>TOTAL</strong><strong>{{ fmt(s.total) }}</strong></div>
        <div class="row"><span>Espèces</span><span>{{ fmt(s.received) }}</span></div>
        <div class="row"><span>Rendu</span><span>{{ fmt(s.change) }}</span></div>
        <hr />
        <p class="center">Merci de votre visite</p>
      </div>
    }
  `,
  styleUrl: './ticket-print.component.scss',
})
export class TicketPrintComponent {
  readonly sale = input<Sale | null>(null);

  fmt(amount: number): string {
    return formatFcfa(amount);
  }

  dateLabel(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR');
  }
}
