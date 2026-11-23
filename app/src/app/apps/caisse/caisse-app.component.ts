import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { SessionService } from '../../core/session/session.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { CartService } from './cart.service';
import { CatalogueService } from './catalogue.service';
import { Product, formatFcfa, matchesSearch, productPicture } from './catalogue';
import { CustomerChannelService, CustomerScreenState } from './customer-channel.service';
import { PermissionsService } from '../../core/security/permissions.service';
import { CaisseTicketComponent } from './caisse-ticket.component';
import { PaymentDialogComponent } from './payment-dialog.component';
import { Sale, SalesService } from './sales.service';
import { TicketPrintComponent } from './ticket-print.component';

const ALL = 'all';
const MAX_VISIBLE = 200;
const THANKS_DURATION_MS = 3000;

interface CategoryChoice {
  readonly id: string;
  readonly label: string;
  readonly count: number;
}

/**
 * Cashier screen: search or scan an article, add it to the ticket, take the cash payment, print the receipt.
 * Keys: F9 opens the payment, Échap closes it.
 */
@Component({
  selector: 'app-caisse-app',
  imports: [IconComponent, PaymentDialogComponent, TicketPrintComponent, CaisseTicketComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown)': 'onKeydown($event)',
  },
  template: `
    <section class="caisse">
      @if (notice(); as text) {
        <p class="notice" role="status">{{ text }}</p>
      }

      <header class="top">
        <label class="search">
          <app-icon name="search" [size]="18" />
          <input
            #search
            type="search"
            placeholder="Chercher un article ou scanner un code"
            aria-label="Chercher un article ou scanner un code"
            [value]="query()"
            (input)="onSearch($event)"
            (keydown.enter)="onEnter()"
          />
        </label>
        <span class="next">Prochain ticket : {{ sales.nextNumber() }}</span>
        <button type="button" class="ghost" (click)="openCustomerDisplay()">Afficheur client</button>
        <span class="sync" [class.pending]="sales.pendingSync() > 0">
          @if (sales.pendingSync() > 0) {
            {{ sales.pendingSync() }} vente(s) en attente
          } @else {
            En ligne
          }
        </span>
      </header>

      <nav class="categories" aria-label="Rayons">
        @for (choice of categoryChoices(); track choice.id) {
          <button
            type="button"
            class="category"
            [class.active]="activeCategory() === choice.id"
            [attr.aria-pressed]="activeCategory() === choice.id"
            (click)="activeCategory.set(choice.id)"
          >
            <span class="round">{{ choice.label.charAt(0) }}</span>
            <strong>{{ choice.label }}</strong>
            <small>{{ choice.count }} articles</small>
          </button>
        }
      </nav>

      <div class="body">
        <section class="products" aria-label="Articles">
          <p class="count">{{ visible().length }} article(s)</p>
          <div class="grid">
            @for (product of visible(); track product.code) {
              <button type="button" class="product" (click)="cart.add(product)">
                <span class="image"><img [src]="picture(product)" alt="" /></span>
                <span class="name">{{ product.name }}</span>
                <span class="meta">{{ product.category }} · {{ product.code.slice(-6) }}</span>
                <span class="price">{{ fmt(product.price) }}</span>
              </button>
            } @empty {
              <p class="empty">Aucun article trouvé.</p>
            }
          </div>
        </section>

        <app-caisse-ticket (payRequested)="openPayment()" />
      </div>

      @if (paying()) {
        <app-payment-dialog
          [total]="cart.total()"
          (cancelled)="paying.set(false)"
          (validated)="onValidated($event)"
        />
      }

      <app-ticket-print [sale]="printed()" />
    </section>
  `,
  styleUrl: './caisse-app.component.scss',
})
export class CaisseAppComponent {
  readonly cart = inject(CartService);
  readonly sales = inject(SalesService);
  private readonly catalogue = inject(CatalogueService);
  private readonly session = inject(SessionService);
  private readonly customer = inject(CustomerChannelService);
  private readonly injector = inject(Injector);
  private readonly search = viewChild.required<ElementRef<HTMLInputElement>>('search');

  readonly query = signal('');
  readonly activeCategory = signal(ALL);
  readonly paying = signal(false);
  readonly printed = signal<Sale | null>(null);
  readonly message = signal('');
  /** Short message shown above the ticket, for example when the role does not allow a sale. */
  readonly notice = signal<string | null>(null);
  private readonly permissions = inject(PermissionsService);

  readonly categoryChoices = computed<readonly CategoryChoice[]>(() => {
    const products = this.catalogue.products();
    const all: CategoryChoice = { id: ALL, label: 'Tous', count: products.length };
    const perCategory = this.catalogue.categories().map((category) => ({
      id: category,
      label: category,
      count: products.filter((product) => product.category === category).length,
    }));
    return [all, ...perCategory];
  });

  readonly visible = computed<readonly Product[]>(() => {
    const category = this.activeCategory();
    const term = this.query();
    return this.catalogue
      .products()
      .filter((product) => (category === ALL || product.category === category) && matchesSearch(product, term))
      .slice(0, MAX_VISIBLE);
  });

  constructor() {
    // Every change of the ticket is sent to the customer display.
    effect(() => {
      const lines = this.cart.lines();
      const total = this.cart.total();
      const message = this.message();
      untracked(() =>
        this.customer.publish({
          lines: lines.map((line) => ({ name: line.name, qty: line.qty, price: line.price })),
          total,
          message,
        } satisfies CustomerScreenState),
      );
    });
  }

  fmt(amount: number): string {
    return formatFcfa(amount);
  }

  picture(product: Product): string {
    return productPicture(product);
  }

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  /** A scanner sends the code followed by Enter: an exact code adds the article and clears the field for the next scan. */
  onEnter(): void {
    const code = this.query().trim();
    const product = this.catalogue.find(code);
    if (product) {
      this.cart.add(product);
      this.query.set('');
      this.search().nativeElement.value = '';
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'F9') {
      event.preventDefault();
      this.openPayment();
    } else if (event.key === 'Escape' && this.paying()) {
      this.paying.set(false);
    }
  }

  openPayment(): void {
    if (this.cart.lines().length === 0) {
      return;
    }
    if (!this.permissions.can('vendre')) {
      this.notice.set('Votre rôle ne permet pas d’encaisser. Demandez à un gérant.');
      return;
    }
    this.notice.set(null);
    this.paying.set(true);
  }

  onValidated(received: number): void {
    const lines = this.cart.lines();
    const cashier = this.session.user()?.name ?? '';
    const sale = this.sales.record(lines, received, cashier);
    this.catalogue.decrementStock(lines);
    this.cart.clear();
    this.paying.set(false);
    this.printed.set(sale);
    afterNextRender(() => window.print(), { injector: this.injector });
    this.thank();
  }

  openCustomerDisplay(): void {
    window.open(`${location.pathname}?client=1`, 'marketpos-client', 'width=900,height=600');
  }

  private thank(): void {
    this.message.set('Merci, à bientôt');
    setTimeout(() => this.message.set(''), THANKS_DURATION_MS);
  }
}
