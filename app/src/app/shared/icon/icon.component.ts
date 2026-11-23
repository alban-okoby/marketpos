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
 * 3D illustrations from Fluent Emoji (Microsoft, MIT licence), packaged by @lobehub/fluent-emoji-3d.
 * Files are named by their Unicode code points and live in assets/icons/3d. Each one is a small image,
 * cached by the service worker, so it works offline.
 */
const PICTURES: Partial<Record<IconName, string>> = {
  register: '1f6d2',
  receipt: '1f9fe',
  box: '1f4e6',
  chart: '1f4ca',
  users: '1f465',
  settings: '2699-fe0f',
  power: '1f6aa',
  lock: '1f512',
  online: '1f4e1',
  offline: '1f4f5',
  user: '1f9d1-200d-1f4bc',
  display: '1f5a5-fe0f',
  taskbar: '1f4d0',
  modules: '1f4c7',
  label: '1f3f7-fe0f',
  'shopping-bags': '1f6cd-fe0f',
  card: '1f4b3',
  bank: '1f3e6',
  abacus: '1f9ee',
  money: '1f4b0',
  briefcase: '1f4bc',
  key: '1f511',
  printer: '1f5a8-fe0f',
  cloud: '2601-fe0f',
  backup: '1f4be',
  bell: '1f514',
  scroll: '1f4dc',
  building: '1f3e2',
  truck: '1f69a',
  laptop: '1f4bb',
};

/**
 * Renders a 3D picture when one exists for the name. The search button and the window controls use thin grey
 * line icons drawn in-house, so they stay simple and neutral at small sizes.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pictureSrc(); as src) {
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
          @case ('search') {
            <circle cx="11" cy="11" r="6.5" />
            <path d="M20 20l-4.2-4.2" />
          }
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
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
    }

    img {
      display: block;
      object-fit: contain;
      pointer-events: none;
      filter: drop-shadow(0 4px 6px var(--icon-shadow));
    }

    svg {
      color: var(--text-muted);
    }
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(24);

  readonly pictureSrc = computed(() => {
    const code = PICTURES[this.name()];
    return code ? `icons/3d/${code}.webp` : null;
  });
}
