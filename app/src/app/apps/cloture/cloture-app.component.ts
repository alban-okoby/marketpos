import { ChangeDetectionStrategy, Component, Injector, afterNextRender, computed, inject, signal } from '@angular/core';

import { SessionService } from '../../core/session/session.service';
import { formatFcfa } from '../caisse/catalogue';
import { ZClosure, cashGap, needsJustification } from './closure';
import { ClosuresService } from './closures.service';
import { FiscalSettingsService } from '../../core/settings/fiscal.service';
import { PrintableReport, downloadText, toCsv, xReport, zReport } from './report';
import { ReportPrintComponent } from './report-print.component';

/**
 * Cash closings. X shows the current period without changing it. Z closes the period after the cash is counted
 * and a manager has entered their PIN. Validated Z closings are kept; corrections are added as rectifications.
 */
@Component({
  selector: 'app-cloture-app',
  imports: [ReportPrintComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cloture">
      <div class="column">
        <article class="card glass" aria-labelledby="x-title">
          <h3 id="x-title">Rapport X</h3>
          <p class="hint">Période en cours. Le rapport ne remet rien à zéro.</p>
          <dl class="facts">
            <dt>Ventes</dt><dd>{{ x().count }}</dd>
            <dt>Tickets</dt><dd>{{ x().firstTicket ?? '—' }} → {{ x().lastTicket ?? '—' }}</dd>
            <dt>Total</dt><dd>{{ fmt(x().total) }}</dd>
            <dt>Fond de caisse</dt><dd>{{ fmt(openingFloat()) }}</dd>
            <dt>Espèces théoriques</dt><dd>{{ fmt(expected()) }}</dd>
          </dl>
          <div class="row-actions">
            <button type="button" class="secondary" (click)="printX()">Imprimer</button>
            <button type="button" class="secondary" (click)="exportX()">Exporter CSV</button>
          </div>
        </article>

        <article class="card glass" aria-labelledby="z-title">
          <h3 id="z-title">Clôture Z</h3>
          <p class="hint">Compter les espèces, puis valider avec le code PIN du gérant. La clôture ne peut plus être modifiée.</p>

          <label class="field">
            <span>Espèces comptées</span>
            <input
              type="number"
              inputmode="numeric"
              min="0"
              step="1"
              [value]="counted() ?? ''"
              (input)="onCounted($event)"
              aria-label="Espèces comptées"
            />
          </label>

          <p class="gap" [class.alert]="needsReason()">
            Écart : <strong>{{ fmt(gap()) }}</strong>
          </p>

          @if (needsReason()) {
            <label class="field">
              <span>Justification (obligatoire)</span>
              <textarea rows="2" [value]="reason()" (input)="onReason($event)" aria-label="Justification de l'écart"></textarea>
            </label>
          }

          <label class="field">
            <span>Code PIN du gérant</span>
            <input
              type="password"
              inputmode="numeric"
              maxlength="4"
              [value]="pin()"
              (input)="onPin($event)"
              aria-label="Code PIN du gérant"
            />
          </label>

          @if (error(); as message) {
            <p class="error" role="alert">{{ message }}</p>
          }

          <button type="button" class="primary" (click)="validateZ()" [disabled]="!canClose()">
            Valider la clôture Z
          </button>
        </article>
      </div>

      <div class="column">
        <article class="card glass" aria-labelledby="history-title">
          <h3 id="history-title">Clôtures validées</h3>

          @for (closure of closures(); track closure.id) {
            <div class="closure">
              <div class="closure-head">
                <strong>{{ closure.number }}</strong>
                <span>{{ dateLabel(closure.at) }}</span>
              </div>
              <p class="closure-line">
                {{ closure.count }} vente(s) · {{ fmt(closure.total) }} · écart {{ fmt(closure.gap) }}
              </p>
              @if (closure.justification) {
                <p class="closure-line">Justification : {{ closure.justification }}</p>
              }
              @for (entry of rectificationsOf(closure.id); track entry.id) {
                <p class="closure-line rect">Rectification {{ fmt(entry.amount) }} : {{ entry.reason }}</p>
              }

              @if (rectifying() === closure.id) {
                <div class="rect-form">
                  <input type="number" [value]="rectAmount()" (input)="onRectAmount($event)" aria-label="Montant de la rectification" />
                  <input type="text" [value]="rectReason()" (input)="onRectReason($event)" placeholder="Motif" aria-label="Motif de la rectification" />
                  <button type="button" class="secondary" (click)="saveRectification(closure.id)">Enregistrer</button>
                </div>
              } @else {
                <div class="row-actions">
                  <button type="button" class="ghost" (click)="printZ(closure)">Imprimer</button>
                  <button type="button" class="ghost" (click)="startRectification(closure.id)">Rectifier</button>
                </div>
              }
            </div>
          } @empty {
            <p class="hint">Aucune clôture Z pour l'instant.</p>
          }
        </article>
      </div>

      <app-report-print [report]="printed()" />
    </section>
  `,
  styleUrl: './cloture-app.component.scss',
})
export class ClotureAppComponent {
  private readonly closuresService = inject(ClosuresService);
  private readonly session = inject(SessionService);
  private readonly injector = inject(Injector);
  private readonly fiscal = inject(FiscalSettingsService);

  readonly counted = signal<number | null>(null);
  readonly reason = signal('');
  readonly pin = signal('');
  readonly error = signal<string | null>(null);
  readonly printed = signal<PrintableReport | null>(null);
  readonly rectifying = signal<string | null>(null);
  readonly rectAmount = signal(0);
  readonly rectReason = signal('');

  readonly closures = this.closuresService.closures;
  readonly openingFloat = this.closuresService.openingFloat;
  readonly x = computed(() => this.closuresService.xReport());
  readonly expected = computed(() => this.openingFloat() + this.x().cash);
  readonly gap = computed(() => cashGap(this.counted() ?? 0, this.expected()));
  readonly needsReason = computed(
    () => this.counted() !== null && needsJustification(this.gap(), this.fiscal.cashGapThreshold()),
  );
  readonly canClose = computed(
    () =>
      this.counted() !== null &&
      this.pin().length === 4 &&
      (!this.needsReason() || this.reason().trim() !== ''),
  );

  fmt(amount: number): string {
    return formatFcfa(amount);
  }

  dateLabel(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR');
  }

  rectificationsOf(closureId: string) {
    return this.closuresService.rectificationsOf(closureId);
  }

  onCounted(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.counted.set(value === '' ? null : Number(value));
  }

  onReason(event: Event): void {
    this.reason.set((event.target as HTMLTextAreaElement).value);
  }

  onPin(event: Event): void {
    this.pin.set((event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4));
  }

  printX(): void {
    this.print(xReport(this.x(), this.openingFloat(), this.closuresService.since()));
  }

  exportX(): void {
    const report = xReport(this.x(), this.openingFloat(), this.closuresService.since());
    downloadText(`rapport-x-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(report));
  }

  printZ(closure: ZClosure): void {
    this.print(zReport(closure));
  }

  validateZ(): void {
    this.error.set(null);
    if (!this.session.verifyPin('gerant', this.pin())) {
      this.error.set('Code PIN du gérant incorrect.');
      return;
    }
    try {
      const closure = this.closuresService.closeDay({
        countedCash: this.counted() ?? 0,
        justification: this.reason(),
        validatedBy: this.session.findUser('gerant')?.name ?? 'Gérant',
      });
      this.counted.set(null);
      this.reason.set('');
      this.pin.set('');
      this.print(zReport(closure));
    } catch (failure) {
      this.error.set(failure instanceof Error ? failure.message : 'Clôture impossible.');
    }
  }

  startRectification(closureId: string): void {
    this.rectifying.set(closureId);
    this.rectAmount.set(0);
    this.rectReason.set('');
  }

  onRectAmount(event: Event): void {
    this.rectAmount.set(Number((event.target as HTMLInputElement).value) || 0);
  }

  onRectReason(event: Event): void {
    this.rectReason.set((event.target as HTMLInputElement).value);
  }

  saveRectification(closureId: string): void {
    try {
      this.closuresService.addRectification(closureId, this.rectAmount(), this.rectReason());
      this.rectifying.set(null);
      this.error.set(null);
    } catch (failure) {
      this.error.set(failure instanceof Error ? failure.message : 'Rectification impossible.');
    }
  }

  private print(report: PrintableReport): void {
    this.printed.set(report);
    afterNextRender(() => window.print(), { injector: this.injector });
  }
}

