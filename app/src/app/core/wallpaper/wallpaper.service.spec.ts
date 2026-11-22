import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { BUILTIN_WALLPAPERS, WallpaperService, parseWallpaperChoice } from './wallpaper.service';

describe('parseWallpaperChoice', () => {
  it('falls back to the flat colour for invalid values', () => {
    expect(parseWallpaperChoice(null)).toEqual({ kind: 'color' });
    expect(parseWallpaperChoice({ kind: 'builtin', id: 'unknown' })).toEqual({ kind: 'color' });
  });

  it('keeps known built-in and custom choices', () => {
    expect(parseWallpaperChoice({ kind: 'builtin', id: 'dusk' })).toEqual({ kind: 'builtin', id: 'dusk' });
    expect(parseWallpaperChoice({ kind: 'custom' })).toEqual({ kind: 'custom' });
  });
});

describe('WallpaperService', () => {
  let wallpaper: WallpaperService;

  beforeEach(() => {
    localStorage.removeItem('marketpos.wallpaper');
    localStorage.removeItem('marketpos.wallpaper.custom');
    TestBed.configureTestingModule({});
    wallpaper = TestBed.inject(WallpaperService);
    wallpaper.setChoice({ kind: 'color' });
  });

  it('has no image for the flat colour', () => {
    expect(wallpaper.imageUrl()).toBeNull();
  });

  it('shows the built-in image and saves the choice', () => {
    wallpaper.setChoice({ kind: 'builtin', id: 'blocks' });
    expect(wallpaper.imageUrl()).toBe(BUILTIN_WALLPAPERS.find((w) => w.id === 'blocks')?.url);
    expect(JSON.parse(localStorage.getItem('marketpos.wallpaper') ?? '{}')).toEqual({ kind: 'builtin', id: 'blocks' });
  });

  it('shows nothing for a custom choice when no image was imported', () => {
    wallpaper.setChoice({ kind: 'custom' });
    expect(wallpaper.hasCustom()).toBe(false);
    expect(wallpaper.imageUrl()).toBeNull();
  });
});
