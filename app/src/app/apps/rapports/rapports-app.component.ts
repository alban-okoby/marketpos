import { ChangeDetectionStrategy, Component, Injector, afterNextRender, computed, inject, signal } from '@angular/core';

import { PermissionsService } from '../../core/security/permissions.service';
import { formatFcfa } from '../caisse/catalogue';
import { CatalogueService } from '../caisse/catalogue.service';
import { SalesService } from '../caisse/sales.service';
import { PrintableReport, downloadText } from '../cloture/report';
import { ReportPrintComponent } from '../cloture/report-print.component';
import { Period, csvTable, rankProducts, salesByCashier, salesByPeriod, stockSummary } from './report-data';

type Tab = 'ventes' | 'produits' | 'stock';

const PERIOD_LABELS: Record<Period, string> = { jour: 'Par jour', semaine: 'Par semaine', mois: 'Par mois' };
const TITLES: Record<Tab, string> = { ventes: 'Ventes', produits: 'Produits', stock: 'Stock' };

/**
 * Reports: sales by period and cashier, best and worst sellers, stock value, ruptures and critical articles.
 * Anyone can read them. Exporting needs the export right.
 */
@Component({
  selector: 'app-rapports-app',
  imports: [ReportPrintComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="reports">
      <header class="head">
        <nav class="tabs" aria-label="Rapports">
          @for (item of tabs; track item) {
            <button type="button" [class.active]="tab() === item" (click)="tab.set(item)">{{ titles[item] }}</button>
          }
        </nav>
        <div class="actions">
          <button type="button" (click)="print()">Imprimer</button>
          <button type="button" (click)="exportCsv()" [disabled]="!permissions.can('exporter')">Exporter CSV</button>
        </div>
      </header>

      @if (!permissions.can('exporter')) {
        <p class="hint">L’export demande le droit d’exporter. Vous pouvez consulter et imprimer.</p>
      }

      @switch (tab()) {
        @case ('ventes') {
          <div class="bar">
            <label>Période
              <select [value]="period()" (change)="setPeriod($event)">
                @for (item of periods; track item) { <option [value]="item">{{ periodLabels[item] }}</option> }
              </select>
            </label>
            <span class="total">Total : <strong>{{ fmt(salesTotal()) }}</strong> · {{ salesCount() }} vente(s)</span>
          </div>
          <div class="grid2">
            <div class="table-wrap">
              <table>
                <thead><tr><th>Période</th><th>Ventes</th><th>Montant</th></tr></thead>
                <tbody>
                  @for (row of periodRows(); track row.key) {
                    <tr><td>{{ row.label }}</td><td class="num">{{ row.count }}</td><td class="num">{{ fmt(row.total) }}</td></tr>
                  } @empty { <tr><td colspan="3" class="empty">Aucune vente.</td></tr> }
                </tbody>
              </table>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Caissier</th><th>Ventes</th><th>Montant</th></tr></thead>
                <tbody>
                  @for (row of cashiers(); track row.name) {
                    <tr><td>{{ row.name }}</td><td class="num">{{ row.count }}</td><td class="num">{{ fmt(row.total) }}</td></tr>
                  } @empty { <tr><td colspan="3" class="empty">Aucune vente.</td></tr> }
                </tbody>
              </table>
            </div>
          </div>
        }

        @case ('produits') {
          <div class="grid2">
            <div class="table-wrap">
              <h3>Les plus vendus</h3>
              <table>
                <thead><tr><th>Article</th><th>Quantité</th><th>Montant</th></tr></thead>
                <tbody>
                  @for (row of best(); track row.code) {
                    <tr><td>{{ row.name }}</td><td class="num">{{ row.qty }}</td><td class="num">{{ fmt(row.amount) }}</td></tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="table-wrap">
              <h3>Les moins vendus</h3>
              <table>
                <thead><tr><th>Article</th><th>Quantité</th><th>Montant</th></tr></thead>
                <tbody>
                  @for (row of worst(); track row.code) {
                    <tr><td>{{ row.name }}</td><td class="num">{{ row.qty }}</td><td class="num">{{ fmt(row.amount) }}</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @case ('stock') {
          <div class="kpis">
            <div class="kpi"><span>Valeur du stock</span><strong>{{ fmt(summary().value) }}</strong></div>
            <div class="kpi"><span>Ruptures</span><strong>{{ summary().ruptures.length }}</strong></div>
            <div class="kpi"><span>Stock critique</span><strong>{{ summary().critical.length }}</strong></div>
          </div>
          <div class="grid2">
            <div class="table-wrap">
              <h3>Ruptures</h3>
              <ul class="plain">
                @for (product of summary().ruptures; track product.code) { <li>{{ product.name }} <small>{{ product.stock }} {{ product.unit ?? 'pièce' }}</small></li> } @empty { <li class="empty">Aucune rupture.</li> }
              </ul>
            </div>
            <div class="table-wrap">
              <h3>Stock critique</h3>
              <ul class="plain">
                @for (product of summary().critical; track product.code) { <li>{{ product.name }} <small>{{ product.stock }} / seuil {{ product.threshold ?? 5 }}</small></li> } @empty { <li class="empty">Aucun article critique.</li> }
              </ul>
            </div>
          </div>
        }
      }

      <app-report-print [report]="printed()" />
    </section>
  `,
  styleUrl: './rapports-app.component.scss',
})
export class RapportsAppComponent {
  readonly permissions = inject(PermissionsService);
  private readonly sales = inject(SalesService);
  private readonly catalogue = inject(CatalogueService);
  private readonly injector = inject(Injector);

  readonly tabs: readonly Tab[] = ['ventes', 'produits', 'stock'];
  readonly titles = TITLES;
  readonly periods: readonly Period[] = ['jour', 'semaine', 'mois'];
  readonly periodLabels = PERIOD_LABELS;
  readonly tab = signal<Tab>('ventes');
  readonly period = signal<Period>('jour');
  readonly printed = signal<PrintableReport | null>(null);

  readonly periodRows = computed(() => salesByPeriod(this.sales.journal(), this.period()));
  readonly cashiers = computed(() => salesByCashier(this.sales.journal()));
  readonly salesTotal = computed(() => this.sales.journal().reduce((sum, sale) => sum + sale.total, 0));
  readonly salesCount = computed(() => this.sales.journal().length);
  readonly ranking = computed(() => rankProducts(this.catalogue.products(), this.sales.journal()));
  readonly best = computed(() => this.ranking().filter((row) => row.qty > 0).slice(0, 10));
  readonly worst = computed(() => [...this.ranking()].reverse().slice(0, 10));
  readonly summary = computed(() => stockSummary(this.catalogue.products()));

  fmt(amount: number): string {
    return formatFcfa(amount);
  }

  setPeriod(event: Event): void {
    const choice = (event.target as HTMLSelectElement).value;
    this.period.set(this.periods.find((item) => item === choice) ?? 'jour');
  }

  exportCsv(): void {
    if (!this.permissions.can('exporter')) {
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    const { name, content } = this.tableFor(this.tab());
    downloadText(`${name}-${stamp}.csv`, content);
  }

  print(): void {
    this.printed.set(this.reportFor(this.tab()));
    afterNextRender(() => window.print(), { injector: this.injector });
  }

  private tableFor(tab: Tab): { name: string; content: string } {
    if (tab === 'ventes') {
      const rows = this.periodRows().map((row) => [row.label, row.count, row.total]);
      return { name: 'rapport-ventes', content: csvTable(['Période', 'Ventes', 'Montant (F)'], rows) };
    }
    if (tab === 'produits') {
      const rows = this.ranking().map((row) => [row.name, row.qty, row.amount]);
      return { name: 'rapport-produits', content: csvTable(['Article', 'Quantité', 'Montant (F)'], rows) };
    }
    const rows = this.catalogue.products().map((product) => [product.name, product.stock, product.threshold ?? 5, (product.purchasePrice ?? product.price) * Math.max(product.stock, 0)]);
    return { name: 'rapport-stock', content: csvTable(['Article', 'Stock', 'Seuil', 'Valeur (F)'], rows) };
  }

  private reportFor(tab: Tab): PrintableReport {
    if (tab === 'ventes') {
      return {
        title: 'Rapport des ventes',
        subtitle: PERIOD_LABELS[this.period()],
        rows: this.periodRows().map((row) => ({ label: row.label, value: `${row.count} · ${this.fmt(row.total)}` })),
      };
    }
    if (tab === 'produits') {
      return {
        title: 'Produits',
        subtitle: 'Les plus vendus',
        rows: this.best().map((row) => ({ label: row.name, value: `${row.qty} · ${this.fmt(row.amount)}` })),
      };
    }
    return {
      title: 'Stock',
      subtitle: `Valeur ${this.fmt(this.summary().value)}`,
      rows: [
        { label: 'Ruptures', value: String(this.summary().ruptures.length) },
        { label: 'Stock critique', value: String(this.summary().critical.length) },
      ],
    };
  }
}
