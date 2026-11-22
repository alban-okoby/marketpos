import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type IconName =
  | 'register'
  | 'receipt'
  | 'box'
  | 'chart'
  | 'users'
  | 'settings'
  | 'search'
  | 'power'
  | 'lock'
  | 'online'
  | 'offline'
  | 'user'
  | 'display'
  | 'taskbar'
  | 'modules'
  | 'label'
  | 'shopping-bags'
  | 'card'
  | 'bank'
  | 'abacus'
  | 'money'
  | 'briefcase'
  | 'key'
  | 'printer'
  | 'cloud'
  | 'backup'
  | 'bell'
  | 'scroll'
  | 'building'
  | 'truck'
  | 'laptop'
  | 'minus'
  | 'square'
  | 'close'
  | 'backspace';

/**
 * Colour illustrations from Fluent Emoji (Microsoft, MIT licence), stored in assets/icons/fluent.
 * Each file is a standalone image, so it is cached by the service worker and works offline.
 */
const COLOR_ICONS: Partial<Record<IconName, string>> = {
  register: 'shopping-cart.svg',
  receipt: 'receipt.svg',
  box: 'package.svg',
  chart: 'bar-chart.svg',
  users: 'busts-in-silhouette.svg',
  settings: 'gear.svg',
  search: 'magnifying-glass-tilted-right.svg',
  power: 'door.svg',
  lock: 'locked.svg',
  online: 'satellite-antenna.svg',
  offline: 'mobile-phone-off.svg',
  user: 'office-worker-default.svg',
  display: 'desktop-computer.svg',
  taskbar: 'triangular-ruler.svg',
  modules: 'card-index.svg',
  label: 'label.svg',
  'shopping-bags': 'shopping-bags.svg',
  card: 'credit-card.svg',
  bank: 'bank.svg',
  abacus: 'abacus.svg',
  money: 'money-bag.svg',
  briefcase: 'briefcase.svg',
  key: 'key.svg',
  printer: 'printer.svg',
  cloud: 'cloud.svg',
  backup: 'floppy-disk.svg',
  bell: 'bell.svg',
  scroll: 'scroll.svg',
  building: 'office-building.svg',
  truck: 'delivery-truck.svg',
  laptop: 'laptop.svg',
};

/**
 * Renders a colour illustration when one exists for the name. Window controls keep thin line icons
 * drawn in-house, because they must stay simple and neutral at small sizes.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (colorSrc(); as src) {
      <img [src]="src" [attr.width]="size()" [attr.height]="size()" alt="" draggable="false" />
    } @else {
      <svg
        [attr.width]="size()"
        [attr.height]="size()"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        @switch (name()) {
          @case ('minus') {
            <path d="M5 12h14" />
          }
          @case ('square') {
            <rect x="5" y="5" width="14" height="14" rx="2" />
          }
          @case ('close') {
            <path d="M6 6l12 12M18 6 6 18" />
          }
          @case ('backspace') {
            <path d="M21 6H9l-6 6 6 6h12z" />
            <path d="M18 9l-6 6M12 9l6 6" />
          }
        }
      </svg>
    }
  `,
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(24);

  readonly colorSrc = computed(() => {
    const file = COLOR_ICONS[this.name()];
    return file ? `icons/fluent/${file}` : null;
  });
}
