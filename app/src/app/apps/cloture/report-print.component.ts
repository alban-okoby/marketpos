import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PrintableReport } from './report';

/** Printable report. Shown only when printing: the print rules in styles.scss hide everything else. */
@Component({
  selector: 'app-report-print',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (report(); as r) {
      <div class="print-area" aria-hidden="true">
        <p class="center"><strong>MARKETPOS</strong><br />{{ r.title }}</p>
        <p class="center">{{ r.subtitle }}</p>
        <hr />
        @for (row of r.rows; track row.label) {
          <div class="row"><span>{{ row.label }}</span><span>{{ row.value }}</span></div>
        }
        <hr />
        <p class="center">Ticket non fiscal</p>
      </div>
    }
  `,
  styleUrl: './report-print.component.scss',
})
export class ReportPrintComponent {
  readonly report = input<PrintableReport | null>(null);
}
