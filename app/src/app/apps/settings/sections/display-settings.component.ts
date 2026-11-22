import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ACCENT_ORDER, ACCENT_PALETTES, AccentService } from '../../../core/theme/accent.service';
import { ThemePreference, ThemeService } from '../../../core/theme/theme.service';
import { BUILTIN_WALLPAPERS, WallpaperService } from '../../../core/wallpaper/wallpaper.service';

interface ThemeOption {
  readonly value: ThemePreference;
  readonly label: string;
  readonly hint: string;
}

/** Settings page "Affichage": theme, accent colour and wallpaper. */
@Component({
  selector: 'app-display-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="page">
      <header>
        <h2>Affichage</h2>
        <p class="subtitle">Thème et apparence de MarketPOS</p>
      </header>

      <section aria-labelledby="theme-title">
        <h3 id="theme-title">Thème</h3>
        <p class="hint">
          « Automatique » suit le réglage du système (clair ou sombre). Le choix est mémorisé sur cet appareil.
        </p>

        <div class="options" role="radiogroup" aria-labelledby="theme-title">
          @for (option of themeOptions; track option.value) {
            <button
              type="button"
              role="radio"
              class="option"
              [class.selected]="theme.preference() === option.value"
              [attr.aria-checked]="theme.preference() === option.value"
              (click)="theme.setPreference(option.value)"
            >
              <span class="swatch" [attr.data-kind]="option.value" aria-hidden="true"></span>
              <span class="option-label">{{ option.label }}</span>
              <span class="option-hint">{{ option.hint }}</span>
            </button>
          }
        </div>

        <p class="current" aria-live="polite">Thème affiché : {{ currentLabel() }}</p>
      </section>

      <section aria-labelledby="accent-title">
        <h3 id="accent-title">Couleur d'accentuation</h3>
        <p class="hint">Couleur des boutons principaux, des éléments sélectionnés et du focus clavier.</p>

        <div class="accents" role="radiogroup" aria-labelledby="accent-title">
          @for (color of accentOrder; track color) {
            <button
              type="button"
              role="radio"
              class="accent"
              [class.selected]="accent.accent() === color"
              [attr.aria-checked]="accent.accent() === color"
              [attr.aria-label]="accentPalettes[color].label"
              [attr.title]="accentPalettes[color].label"
              (click)="accent.setAccent(color)"
            >
              <span class="dot" [style.background-color]="accentPalettes[color].strong"></span>
              <span class="accent-label">{{ accentPalettes[color].label }}</span>
            </button>
          }
        </div>
      </section>

      <section aria-labelledby="wallpaper-title">
        <h3 id="wallpaper-title">Fond d'écran</h3>
        <p class="hint">Image affichée derrière les fenêtres et sur l'écran de verrouillage.</p>

        <div class="wallpapers" role="radiogroup" aria-labelledby="wallpaper-title">
          <button
            type="button"
            role="radio"
            class="wallpaper"
            [class.selected]="wallpaper.choice().kind === 'color'"
            [attr.aria-checked]="wallpaper.choice().kind === 'color'"
            (click)="wallpaper.setChoice({ kind: 'color' })"
          >
            <span class="thumb plain" aria-hidden="true"></span>
            <span class="option-label">Uni</span>
          </button>

          @for (item of builtins; track item.id) {
            <button
              type="button"
              role="radio"
              class="wallpaper"
              [class.selected]="isBuiltinSelected(item.id)"
              [attr.aria-checked]="isBuiltinSelected(item.id)"
              (click)="wallpaper.setChoice({ kind: 'builtin', id: item.id })"
            >
              <img class="thumb" [src]="item.url" alt="" />
              <span class="option-label">{{ item.label }}</span>
            </button>
          }

          @if (wallpaper.customImage(); as custom) {
            <button
              type="button"
              role="radio"
              class="wallpaper"
              [class.selected]="wallpaper.choice().kind === 'custom'"
              [attr.aria-checked]="wallpaper.choice().kind === 'custom'"
              (click)="wallpaper.setChoice({ kind: 'custom' })"
            >
              <img class="thumb" [src]="custom" alt="" />
              <span class="option-label">Mon image</span>
            </button>
          }
        </div>

        <div class="import-row">
          <button type="button" class="import" (click)="fileInput.click()">Importer une image…</button>
          <input #fileInput type="file" accept="image/*" hidden (change)="onFile($event)" />
        </div>

        @if (importError(); as error) {
          <p class="error" role="alert">{{ error }}</p>
        }
      </section>
    </article>
  `,
  styleUrl: './display-settings.component.scss',
})
export class DisplaySettingsComponent {
  readonly theme = inject(ThemeService);
  readonly accent = inject(AccentService);
  readonly wallpaper = inject(WallpaperService);
  readonly accentPalettes = ACCENT_PALETTES;
  readonly accentOrder = ACCENT_ORDER;
  readonly builtins = BUILTIN_WALLPAPERS;
  readonly importError = signal<string | null>(null);

  readonly themeOptions: readonly ThemeOption[] = [
    { value: 'system', label: 'Automatique', hint: 'Suit le système' },
    { value: 'light', label: 'Clair', hint: 'Toujours clair' },
    { value: 'dark', label: 'Sombre', hint: 'Toujours sombre' },
  ];

  readonly currentLabel = computed(() => (this.theme.resolved() === 'dark' ? 'sombre' : 'clair'));

  isBuiltinSelected(id: string): boolean {
    const choice = this.wallpaper.choice();
    return choice.kind === 'builtin' && choice.id === id;
  }

  async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    this.importError.set(null);
    try {
      await this.wallpaper.importCustom(file);
    } catch (error) {
      this.importError.set(error instanceof Error ? error.message : 'Import impossible.');
    }
  }
}
