import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { ShopService } from '../../core/settings/shop.service';
import { formatFcfa } from './catalogue';
import { Sale, vatIncluded } from './sales.service';

/**
 * Thermal receipt (58 or 80 mm). It is hidden on screen and shown only when printing: the print rules in styles.scss
 * hide the rest of the page. The shop identity and the paper width come from the shop settings.
 */
@Component({
  selector: 'app-ticket-print',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (sale(); as s) {
      <div class="print-area" [class.paper-58]="shop.paperWidth() === 58" aria-hidden="true">
        <p class="center">
          <strong>{{ shop.settings().name }}</strong>
          @if (shop.settings().address) { <br />{{ shop.settings().address }} }
          @if (shop.settings().phone) { <br />Tél. {{ shop.settings().phone }} }
          @if (shop.settings().taxId) { <br />NIF {{ shop.settings().taxId }} }
          @if (shop.settings().tradeRegister) { <br />RCCM {{ shop.settings().tradeRegister }} }
        </p>
        <p class="center">Ticket non fiscal</p>
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
        @if (vat(s) > 0) {
          <div class="row"><span>Dont TVA ({{ s.vatRate }} %)</span><span>{{ fmt(vat(s)) }}</span></div>
        }
        <div class="row"><span>Espèces</span><span>{{ fmt(s.received) }}</span></div>
        <div class="row"><span>Rendu</span><span>{{ fmt(s.change) }}</span></div>
        <hr />
        <p class="center">{{ shop.settings().footer }}</p>
      </div>
    }
  `,
  styleUrl: './ticket-print.component.scss',
})
export class TicketPrintComponent {
  readonly sale = input<Sale | null>(null);
  readonly shop = inject(ShopService);

  fmt(amount: number): string {
    return formatFcfa(amount);
  }

  /** Tickets from before VAT was recorded show none. */
  vat(sale: Sale): number {
    return vatIncluded(sale.total, sale.vatRate ?? 0);
  }

  dateLabel(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR');
  }
}
