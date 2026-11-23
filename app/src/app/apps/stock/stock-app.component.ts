import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { PermissionsService } from '../../core/security/permissions.service';
import { imageFileToDataUrl } from '../../core/images/image-data';
import { formatFcfa } from '../caisse/catalogue';
import { Product, productPicture } from '../caisse/catalogue';
import { CatalogueService, MANUAL_REASONS, ProductInput, StockReason } from '../caisse/catalogue.service';

type Tab = 'articles' | 'sorties' | 'inventaire';

const EMPTY: ProductInput = {
  code: '',
  name: '',
  price: 0,
  category: '',
  unit: 'pièce',
  purchasePrice: 0,
  threshold: 5,
  expiry: '',
  image: '',
};

const REASON_LABELS: Record<StockReason, string> = {
  vente: 'Vente',
  casse: 'Casse',
  peremption: 'Péremption',
  autre: 'Autre',
  inventaire: 'Inventaire',
};

/**
 * Stock module: articles, manual outputs with a reason, and physical inventory with the differences found.
 * Changing stock needs the stock right; the others can only read.
 */
@Component({
  selector: 'app-stock-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="stock">
      <nav class="tabs" aria-label="Stock">
        <button type="button" [class.active]="tab() === 'articles'" (click)="tab.set('articles')">Articles</button>
        <button type="button" [class.active]="tab() === 'sorties'" (click)="tab.set('sorties')">Sorties</button>
        <button type="button" [class.active]="tab() === 'inventaire'" (click)="tab.set('inventaire')">Inventaire</button>
      </nav>

      @if (!canEdit()) {
        <p class="hint">Vous pouvez consulter le stock. Seul un rôle autorisé peut le modifier.</p>
      }

      @switch (tab()) {
        @case ('articles') {
          <div class="split">
            <div class="list-pane">
              <div class="toolbar">
                <input type="search" placeholder="Chercher un article" aria-label="Chercher un article" [value]="query()" (input)="query.set(value($event))" />
                <button type="button" class="primary" (click)="newProduct()" [disabled]="!canEdit()">Nouvel article</button>
              </div>
              <p class="count">{{ visible().length }} article(s) · {{ lowCount() }} sous le seuil · {{ expiringCount() }} proche(s) de la péremption</p>
              <div class="table-wrap">
                <table>
                  <thead><tr><th>Article</th><th>Stock</th><th>Seuil</th><th>Prix</th></tr></thead>
                  <tbody>
                    @for (product of visible(); track product.code) {
                      <tr [class.low]="isLow(product)" (click)="edit(product)">
                        <td class="article"><img class="thumb" [src]="picture(product)" alt="" /><span><span class="name">{{ product.name }}</span><small>{{ product.code }} · {{ product.category }}</small></span></td>
                        <td class="num">{{ product.stock }} {{ product.unit ?? 'pièce' }}</td>
                        <td class="num">{{ product.threshold ?? 5 }}</td>
                        <td class="num">{{ fmt(product.price) }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <form class="form-pane" (submit)="$event.preventDefault(); save()">
              <h3>{{ editing() ? 'Modifier l’article' : 'Nouvel article' }}</h3>
              <label class="field"><span>Code</span><input [value]="form().code" [disabled]="editing() !== null" (input)="patch('code', value($event))" /></label>
              <label class="field"><span>Nom</span><input [value]="form().name" [disabled]="!canEdit()" (input)="patch('name', value($event))" /></label>
              <label class="field"><span>Catégorie</span><input [value]="form().category" [disabled]="!canEdit()" (input)="patch('category', value($event))" /></label>
              <div class="pair">
                <label class="field"><span>Prix de vente (F)</span><input type="number" min="0" [value]="form().price" [disabled]="!canEdit()" (input)="patch('price', num($event))" /></label>
                <label class="field"><span>Prix d’achat (F)</span><input type="number" min="0" [value]="form().purchasePrice" [disabled]="!canEdit()" (input)="patch('purchasePrice', num($event))" /></label>
              </div>
              <div class="pair">
                <label class="field"><span>Unité</span><input [value]="form().unit" [disabled]="!canEdit()" (input)="patch('unit', value($event))" /></label>
                <label class="field"><span>Seuil d’alerte</span><input type="number" min="0" [value]="form().threshold" [disabled]="!canEdit()" (input)="patch('threshold', num($event))" /></label>
              </div>
              <label class="field"><span>Date de péremption (facultative)</span><input type="date" [value]="form().expiry" [disabled]="!canEdit()" (input)="patch('expiry', value($event))" /></label>
              <div class="photo">
                <img [src]="form().image || pictureOfForm()" alt="Aperçu de l’article" />
                <div class="photo-actions">
                  <label class="file"><span>Choisir une photo</span><input type="file" accept="image/*" [disabled]="!canEdit()" (change)="pickPhoto($event)" /></label>
                  @if (form().image) { <button type="button" [disabled]="!canEdit()" (click)="patch('image', '')">Retirer la photo</button> }
                </div>
              </div>
              @if (error(); as message) { <p class="error" role="alert">{{ message }}</p> }
              <button type="submit" class="primary" [disabled]="!canEdit()">Enregistrer</button>
            </form>
          </div>
        }

        @case ('sorties') {
          <div class="split">
            <form class="form-pane" (submit)="$event.preventDefault(); output()">
              <h3>Sortie de stock</h3>
              <label class="field">
                <span>Article</span>
                <select [value]="outCode()" [disabled]="!canEdit()" (change)="outCode.set(value($event))">
                  <option value="">Choisir un article</option>
                  @for (product of catalogue.products(); track product.code) {
                    <option [value]="product.code">{{ product.name }} ({{ product.stock }})</option>
                  }
                </select>
              </label>
              <div class="pair">
                <label class="field"><span>Quantité</span><input type="number" min="1" step="1" [value]="outQty()" [disabled]="!canEdit()" (input)="outQty.set(num($event))" /></label>
                <label class="field">
                  <span>Motif</span>
                  <select [value]="outReason()" [disabled]="!canEdit()" (change)="outReason.set(value($event) === 'casse' ? 'casse' : value($event) === 'peremption' ? 'peremption' : 'autre')">
                    @for (reason of reasons; track reason) { <option [value]="reason">{{ reasonLabel(reason) }}</option> }
                  </select>
                </label>
              </div>
              <label class="field"><span>Commentaire</span><input [value]="outComment()" [disabled]="!canEdit()" (input)="outComment.set(value($event))" /></label>
              @if (error(); as message) { <p class="error" role="alert">{{ message }}</p> }
              <button type="submit" class="primary" [disabled]="!canEdit()">Valider la sortie</button>
            </form>
            <div class="list-pane">
              <h3>Derniers mouvements</h3>
              <ul class="moves">
                @for (move of movements(); track move.id) {
                  <li>
                    <span>{{ dateLabel(move.date) }}</span>
                    <span class="name">{{ move.name }}</span>
                    <span class="num">{{ move.delta > 0 ? '+' : '' }}{{ move.delta }}</span>
                    <small>{{ reasonLabel(move.reason) }}{{ move.comment ? ' · ' + move.comment : '' }}{{ move.by ? ' · ' + move.by : '' }}</small>
                  </li>
                } @empty {
                  <li class="empty">Aucun mouvement.</li>
                }
              </ul>
            </div>
          </div>
        }

        @case ('inventaire') {
          <div class="inventory">
            <p class="hint">Saisissez le nombre compté pour chaque article. Les lignes vides ne changent rien.</p>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Article</th><th>Théorique</th><th>Compté</th></tr></thead>
                <tbody>
                  @for (product of catalogue.products(); track product.code) {
                    <tr>
                      <td><span class="name">{{ product.name }}</span><small>{{ product.code }}</small></td>
                      <td class="num">{{ product.stock }}</td>
                      <td>
                        <input type="number" min="0" step="1" aria-label="Quantité comptée" [disabled]="!canEdit()" [value]="counts()[product.code] ?? ''" (input)="setCount(product.code, value($event))" />
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="row-actions">
              <button type="button" class="primary" (click)="validateInventory()" [disabled]="!canEdit() || countedCount() === 0">
                Valider l’inventaire ({{ countedCount() }} compté(s))
              </button>
            </div>
            @if (error(); as message) { <p class="error" role="alert">{{ message }}</p> }
            @if (variances(); as list) {
              <h3>Écarts constatés</h3>
              @for (line of list; track line.code) {
                <p class="gap">{{ line.name }} : {{ line.before }} → {{ line.after }} ({{ line.delta > 0 ? '+' : '' }}{{ line.delta }})</p>
              } @empty {
                <p class="hint">Aucun écart : le stock correspond au comptage.</p>
              }
            }
          </div>
        }
      }
    </section>
  `,
  styleUrl: './stock-app.component.scss',
})
export class StockAppComponent {
  readonly catalogue = inject(CatalogueService);
  private readonly permissions = inject(PermissionsService);

  readonly tab = signal<Tab>('articles');
  readonly query = signal('');
  readonly editing = signal<string | null>(null);
  readonly form = signal<ProductInput>(EMPTY);
  readonly error = signal<string | null>(null);

  readonly outCode = signal('');
  readonly outQty = signal(1);
  readonly outReason = signal<StockReason>('casse');
  readonly outComment = signal('');

  readonly counts = signal<Record<string, number>>({});
  readonly variances = signal<{ code: string; name: string; before: number; after: number; delta: number }[] | null>(null);

  readonly reasons = MANUAL_REASONS;
  readonly canEdit = computed(() => this.permissions.can('stock'));
  readonly movements = computed(() => this.catalogue.movements().slice(0, 30));
  readonly visible = computed(() => {
    const term = this.query().trim().toLowerCase();
    return this.catalogue
      .products()
      .filter((product) => !term || product.name.toLowerCase().includes(term) || product.code.includes(term));
  });
  readonly lowCount = computed(() => this.catalogue.lowStock().length);
  readonly expiringCount = computed(() => this.catalogue.expiringWithin(30).length);
  readonly countedCount = computed(() => Object.keys(this.counts()).length);

  fmt(amount: number): string {
    return formatFcfa(amount);
  }

  picture(product: Product): string {
    return productPicture(product);
  }

  /** Picture of the article being edited, or the category picture of the empty form. */
  pictureOfForm(): string {
    return productPicture({ ...this.form(), stock: 0, image: undefined } as Product);
  }

  async pickPhoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    try {
      this.patch('image', await imageFileToDataUrl(file, 200));
    } catch (failure) {
      this.error.set(failure instanceof Error ? failure.message : 'Photo impossible à lire.');
    }
  }

  reasonLabel(reason: StockReason): string {
    return REASON_LABELS[reason];
  }

  dateLabel(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR');
  }

  isLow(product: Product): boolean {
    return product.stock <= (product.threshold ?? 5);
  }

  value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  num(event: Event): number {
    return Number((event.target as HTMLInputElement).value) || 0;
  }

  patch<K extends keyof ProductInput>(key: K, value: ProductInput[K] extends number ? number : string): void {
    this.form.set({ ...this.form(), [key]: value } as ProductInput);
  }

  newProduct(): void {
    this.editing.set(null);
    this.form.set(EMPTY);
    this.error.set(null);
  }

  edit(product: Product): void {
    this.editing.set(product.code);
    this.form.set({
      code: product.code,
      name: product.name,
      price: product.price,
      category: product.category,
      unit: product.unit ?? 'pièce',
      purchasePrice: product.purchasePrice ?? 0,
      threshold: product.threshold ?? 5,
      expiry: product.expiry ?? '',
      image: product.image ?? '',
    });
    this.error.set(null);
  }

  save(): void {
    this.run(() => {
      this.catalogue.save(this.form());
      this.editing.set(this.form().code.trim());
    });
  }

  output(): void {
    this.run(() => {
      this.catalogue.recordOutput(this.outCode(), this.outQty(), this.outReason(), this.outComment());
      this.outQty.set(1);
      this.outComment.set('');
    });
  }

  setCount(code: string, raw: string): void {
    const next = { ...this.counts() };
    if (raw.trim() === '') {
      delete next[code];
    } else {
      next[code] = Number(raw);
    }
    this.counts.set(next);
  }

  validateInventory(): void {
    this.run(() => {
      const lines = Object.entries(this.counts()).map(([code, counted]) => ({ code, counted }));
      this.variances.set(this.catalogue.applyInventory(lines));
      this.counts.set({});
    });
  }

  private run(action: () => void): void {
    if (!this.canEdit()) {
      this.error.set('Votre rôle ne permet pas de modifier le stock.');
      return;
    }
    try {
      action();
      this.error.set(null);
    } catch (failure) {
      this.error.set(failure instanceof Error ? failure.message : 'Opération impossible.');
    }
  }
}
