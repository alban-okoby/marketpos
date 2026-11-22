import { Injectable, computed, effect, signal } from '@angular/core';

/** What the user chose. "system" follows the operating system, like the system setting on Windows and macOS. */
export type ThemePreference = 'system' | 'light' | 'dark';
/** What is actually shown. */
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'marketpos.theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';
const META_COLOR: Record<ResolvedTheme, string> = { light: '#e6efe9', dark: '#0d1412' };

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    // Storage can be blocked (private mode, disabled site data): fall back to the system setting.
    return 'system';
  }
}

/**
 * Owns the theme: the user's preference (persisted), the operating-system setting, and the
 * resolved theme applied to the document. Components never read the preference directly; they use CSS tokens.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly preference = signal<ThemePreference>(readStoredPreference());

  private readonly systemDark = signal(
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(DARK_QUERY).matches
      : false,
  );

  readonly resolved = computed<ResolvedTheme>(() => {
    const preference = this.preference();
    if (preference === 'system') {
      return this.systemDark() ? 'dark' : 'light';
    }
    return preference;
  });

  constructor() {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      // Follow live changes of the system setting (for example, sunset auto-switch on macOS).
      window.matchMedia(DARK_QUERY).addEventListener('change', (event) => this.systemDark.set(event.matches));
    }

    effect(() => {
      const theme = this.resolved();
      const root = document.documentElement;
      root.dataset['theme'] = theme;
      root.style.colorScheme = theme;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[theme]);
    });
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // The choice still applies for this session.
    }
  }
}
