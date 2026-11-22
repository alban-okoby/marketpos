import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ACCENT_ORDER, AccentService, parseAccent } from './accent.service';

describe('parseAccent', () => {
  it('keeps known colours and falls back to green', () => {
    expect(parseAccent('blue')).toBe('blue');
    expect(parseAccent('pink')).toBe('green');
    expect(parseAccent(null)).toBe('green');
  });
});

describe('AccentService', () => {
  let accent: AccentService;

  beforeEach(() => {
    localStorage.removeItem('marketpos.accent');
    TestBed.configureTestingModule({});
    accent = TestBed.inject(AccentService);
  });

  it('offers six palettes', () => {
    expect(ACCENT_ORDER.length).toBe(6);
  });

  it('saves the chosen colour so it survives a reload', () => {
    accent.setAccent('purple');
    expect(accent.accent()).toBe('purple');
    expect(localStorage.getItem('marketpos.accent')).toBe('purple');
  });
});
