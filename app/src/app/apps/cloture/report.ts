import { formatFcfa } from '../caisse/catalogue';
import { PeriodSummary, ZClosure } from './closure';

export interface ReportRow {
  readonly label: string;
  readonly value: string;
}

/** A report that can be printed or exported (CL-05). */
export interface PrintableReport {
  readonly title: string;
  readonly subtitle: string;
  readonly rows: readonly ReportRow[];
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR');
}

/** The X report: the current period. Nothing is reset. */
export function xReport(summary: PeriodSummary, openingFloat: number, since: string | null): PrintableReport {
  return {
    title: 'Rapport X',
    subtitle: since ? `Depuis la clôture du ${dateLabel(since)}` : 'Depuis l’ouverture de la caisse',
    rows: [
      { label: 'Nombre de ventes', value: String(summary.count) },
      { label: 'Premier ticket', value: summary.firstTicket ?? '—' },
      { label: 'Dernier ticket', value: summary.lastTicket ?? '—' },
      { label: 'Total des ventes', value: formatFcfa(summary.total) },
      { label: 'Fond de caisse', value: formatFcfa(openingFloat) },
      { label: 'Espèces théoriques', value: formatFcfa(openingFloat + summary.cash) },
    ],
  };
}

/** The Z report: a validated closure, with the cash gap and its justification. */
export function zReport(closure: ZClosure): PrintableReport {
  return {
    title: `Clôture ${closure.number}`,
    subtitle: `Validée le ${dateLabel(closure.at)} par ${closure.validatedBy}`,
    rows: [
      { label: 'Nombre de ventes', value: String(closure.count) },
      { label: 'Total des ventes', value: formatFcfa(closure.total) },
      { label: 'Fond de caisse', value: formatFcfa(closure.openingFloat) },
      { label: 'Espèces théoriques', value: formatFcfa(closure.cashExpected) },
      { label: 'Espèces comptées', value: formatFcfa(closure.cashCounted) },
      { label: 'Écart', value: formatFcfa(closure.gap) },
      { label: 'Justification', value: closure.justification || '—' },
    ],
  };
}

/** CSV with ";" as separator, which French spreadsheets open directly. */
export function toCsv(report: PrintableReport): string {
  const escape = (text: string) => `"${text.replace(/"/g, '""')}"`;
  const lines = [`${escape(report.title)};${escape(report.subtitle)}`, `${escape('Libellé')};${escape('Valeur')}`];
  for (const row of report.rows) {
    lines.push(`${escape(row.label)};${escape(row.value)}`);
  }
  return lines.join('\r\n');
}

/** Saves text as a file through the browser. */
export function downloadText(fileName: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
