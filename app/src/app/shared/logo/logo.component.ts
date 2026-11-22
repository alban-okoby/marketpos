import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** MarketPOS mark: four tiles in the brand green and orange. */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="9" height="9" rx="2.5" fill="#4cc46a" />
      <rect x="13" y="2" width="9" height="9" rx="2.5" fill="#f5821f" />
      <rect x="2" y="13" width="9" height="9" rx="2.5" fill="#f5821f" />
      <rect x="13" y="13" width="9" height="9" rx="2.5" fill="#4cc46a" />
    </svg>
  `,
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  readonly size = input(24);
}
