import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';

import { IconComponent } from '../../shared/icon/icon.component';
import { CartService } from './cart.service';
import { CatalogueService } from './catalogue.service';
import { formatFcfa, productPicture } from './catalogue';

/** Ticket in progress: lines with thumbnails and quantity steppers, totals, and the cancel and pay actions. */
@Component({
  selector: 'app-caisse-ticket',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="ticket glass" aria-label="Ticket en cours">
      <header class="head">
        <h3>Ticket en cours</h3>
        <span class="count">{{ itemCount() }} article(s)</span>
      </header>

      <div class="lines">
        @for (line of cart.lines(); track line.code) {
          <div class="line">
            <span class="thumb"><img [src]="picture(line.code)" alt="" /></span>
            <div class="line-name">
              <span>{{ line.name }}</span>
              <small>{{ fmt(line.price) }} l'unité</small>
            </div>
            <div class="stepper">
              <button type="button" (click)="cart.changeQty(line.code, -1)" aria-label="Retirer une unité">−</button>
              <span>{{ line.qty }}</span>
              <button type="button" (click)="cart.changeQty(line.code, 1)" aria-label="Ajouter une unité">+</button>
            </div>
            <span class="amount">{{ fmt(line.price * line.qty) }}</span>
            <button type="button" class="remove" (click)="cart.remove(line.code)" aria-label="Supprimer la ligne">
              <app-icon name="close" [size]="14" />
            </button>
          </div>
        } @empty {
          <p class="empty">Panier vide. Scanner ou choisir un article.</p>
        }
      </div>

      <div class="total">
        <span>Total</span>
        <strong>{{ fmt(cart.total()) }}</strong>
      </div>

      <div class="actions">
        <button type="button" class="cancel" (click)="cart.clear()" [disabled]="cart.lines().length === 0">
          Annuler
        </button>
        <button type="button" class="pay" (click)="payRequested.emit()" [disabled]="cart.lines().length === 0">
          Encaisser (F9)
        </button>
      </div>
    </aside>
  `,
  styleUrl: './caisse-ticket.component.scss',
})
export class CaisseTicketComponent {
  readonly cart = inject(CartService);
  private readonly catalogue = inject(CatalogueService);
  readonly payRequested = output<void>();

  readonly itemCount = computed(() => this.cart.lines().reduce((sum, line) => sum + line.qty, 0));

  fmt(amount: number): string {
    return formatFcfa(amount);
  }

  picture(code: string): string {
    const product = this.catalogue.find(code);
    return product ? productPicture(product) : '';
  }
}
