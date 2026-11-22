import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { ResolvedTheme, ThemeService } from './theme.service';

export type AccentColor = 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'graphite';

interface AccentPalette {
  readonly label: string;
  /** Button background with white text (passes WCAG AA in both themes). */
  readonly strong: string;
  /** Indicators and focus rings, on light and dark surfaces. */
  readonly light: string;
  readonly dark: string;
}

/** Accent palettes offered in Paramètres. Each one keeps white button text readable. */
export const ACCENT_PALETTES: Readonly<Record<AccentColor, AccentPalette>> = {
  green: { label: 'Vert', strong: '#1e7a3a', light: '#1e7a3a', dark: '#4cc46a' },
  blue: { label: 'Bleu', strong: '#1d5fb8', light: '#1d5fb8', dark: '#6aa8ff' },
  orange: { label: 'Orange', strong: '#a84f08', light: '#a84f08', dark: '#ffa257' },
  red: { label: 'Rouge', strong: '#b42323', light: '#b42323', dark: '#ff7a7a' },
  purple: { label: 'Violet', strong: '#6b3fb8', light: '#6b3fb8', dark: '#b68cff' },
  graphite: { label: 'Graphite', strong: '#4a5550', light: '#4a5550', dark: '#c7d0cc' },
};

export const ACCENT_ORDER: readonly AccentColor[] = ['green', 'blue', 'orange', 'red', 'purple', 'graphite'];

const STORAGE_KEY = 'marketpos.accent';
const DEFAULT_ACCENT: AccentColor = 'green';

export function parseAccent(raw: unknown): AccentColor {
  return ACCENT_ORDER.includes(raw as AccentColor) ? (raw as AccentColor) : DEFAULT_ACCENT;
}

function readStored(): AccentColor {
  try {
    return parseAccent(localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_ACCENT;
  }
}

/**
 * The application accent colour. It sets the colours of primary buttons, selected items and focus rings
 * on the root element, for the resolved theme (light or dark).
 */
@Injectable({ providedIn: 'root' })
export class AccentService {
  private readonly theme = inject(ThemeService);
  readonly accent = signal<AccentColor>(readStored());

  readonly palette = computed(() => ACCENT_PALETTES[this.accent()]);

  constructor() {
    effect(() => {
      const { strong, light, dark } = this.palette();
      const mode: ResolvedTheme = this.theme.resolved();
      const style = document.documentElement.style;
      style.setProperty('--accent-strong', strong);
      style.setProperty('--accent-indicator', mode === 'dark' ? dark : light);
      style.setProperty('--focus', mode === 'dark' ? dark : light);
    });
  }

  setAccent(accent: AccentColor): void {
    this.accent.set(accent);
    try {
      localStorage.setItem(STORAGE_KEY, accent);
    } catch {
      // The choice still applies for this session.
    }
  }
}
