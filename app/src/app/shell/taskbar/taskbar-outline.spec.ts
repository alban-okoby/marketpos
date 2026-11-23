import { describe, expect, it } from 'vitest';

import { barOutline } from './taskbar-outline';

const bar = { width: 400, height: 56, headroom: 40, radius: 16 };
/** Number of rounded corners (arcs) in the outline. */
const corners = (d: string): number => (d.match(/A /g) ?? []).length;

describe('barOutline', () => {
  it('is a plain rounded bar when nothing swells', () => {
    const d = barOutline({ ...bar, from: 0, to: 0, rise: 0 });
    expect(corners(d)).toBe(4);
    expect(d).toContain('M 16 96');
  });

  it('swells in the middle with rounded corners on both sides', () => {
    expect(corners(barOutline({ ...bar, from: 150, to: 250, rise: 30 }))).toBe(4);
  });

  it('keeps a straight edge where the swelling reaches a bar end', () => {
    expect(corners(barOutline({ ...bar, from: 0, to: 80, rise: 30 }))).toBe(3);
    expect(corners(barOutline({ ...bar, from: 320, to: 400, rise: 30 }))).toBe(3);
    expect(corners(barOutline({ ...bar, from: 0, to: 400, rise: 30 }))).toBe(2);
  });
});
