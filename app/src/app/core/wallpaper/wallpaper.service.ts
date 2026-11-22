import { Injectable, computed, signal } from '@angular/core';

/** What the desktop and lock screen show behind the windows. */
export type WallpaperChoice = { readonly kind: 'color' } | { readonly kind: 'builtin'; readonly id: string } | { readonly kind: 'custom' };

export interface BuiltinWallpaper {
  readonly id: string;
  readonly label: string;
  readonly url: string;
}

/** Wallpapers shipped with the app (flat illustrations, in public/wallpapers). */
export const BUILTIN_WALLPAPERS: readonly BuiltinWallpaper[] = [
  { id: 'dawn', label: 'Aube', url: 'wallpapers/dawn.svg' },
  { id: 'blocks', label: 'Blocs', url: 'wallpapers/blocks.svg' },
  { id: 'dusk', label: 'Crépuscule', url: 'wallpapers/dusk.svg' },
];

const CHOICE_KEY = 'marketpos.wallpaper';
const CUSTOM_KEY = 'marketpos.wallpaper.custom';
const CUSTOM_MAX_SIDE = 1920;
const CUSTOM_QUALITY = 0.85;
const DEFAULT_CHOICE: WallpaperChoice = { kind: 'color' };

export function parseWallpaperChoice(raw: unknown): WallpaperChoice {
  if (typeof raw !== 'object' || raw === null) {
    return DEFAULT_CHOICE;
  }
  const value = raw as Record<string, unknown>;
  if (value['kind'] === 'custom') {
    return { kind: 'custom' };
  }
  if (value['kind'] === 'builtin' && BUILTIN_WALLPAPERS.some((w) => w.id === value['id'])) {
    return { kind: 'builtin', id: value['id'] as string };
  }
  return DEFAULT_CHOICE;
}

function readChoice(): WallpaperChoice {
  try {
    const stored = localStorage.getItem(CHOICE_KEY);
    return stored ? parseWallpaperChoice(JSON.parse(stored)) : DEFAULT_CHOICE;
  } catch {
    return DEFAULT_CHOICE;
  }
}

function readCustom(): string | null {
  try {
    return localStorage.getItem(CUSTOM_KEY);
  } catch {
    return null;
  }
}

/** Decodes an image file and re-encodes it as JPEG, scaled down, so it stays small in local storage. */
export async function resizeImageToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, CUSTOM_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Canvas is not available');
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', CUSTOM_QUALITY);
}

/**
 * Desktop and lock-screen wallpaper: a flat colour, one of the built-in images, or an image chosen by the user.
 */
@Injectable({ providedIn: 'root' })
export class WallpaperService {
  readonly choice = signal<WallpaperChoice>(readChoice());
  private readonly custom = signal<string | null>(readCustom());

  /** The imported image, as a data URL, or null when none was imported. */
  readonly customImage = this.custom.asReadonly();
  readonly hasCustom = computed(() => this.custom() !== null);

  /** URL or data URL of the image to show, or null for the flat colour. */
  readonly imageUrl = computed<string | null>(() => {
    const choice = this.choice();
    if (choice.kind === 'builtin') {
      return BUILTIN_WALLPAPERS.find((w) => w.id === choice.id)?.url ?? null;
    }
    if (choice.kind === 'custom') {
      return this.custom();
    }
    return null;
  });

  setChoice(choice: WallpaperChoice): void {
    this.choice.set(choice);
    this.save(CHOICE_KEY, JSON.stringify(choice));
  }

  /**
   * Imports an image from the user's computer and makes it the wallpaper.
   * Rejects non-image files and images that do not fit in local storage.
   */
  async importCustom(file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier choisi n\'est pas une image.');
    }
    const dataUrl = await resizeImageToDataUrl(file);
    try {
      localStorage.setItem(CUSTOM_KEY, dataUrl);
    } catch {
      throw new Error('Cette image est trop volumineuse pour être mémorisée.');
    }
    this.custom.set(dataUrl);
    this.setChoice({ kind: 'custom' });
  }

  private save(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // The choice still applies for this session.
    }
  }
}
