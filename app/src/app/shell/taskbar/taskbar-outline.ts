export interface BarOutline {
  /** Width and height of the bar, in px. */
  readonly width: number;
  readonly height: number;
  /** Space above the top edge of the bar, where the swelling can rise. The path is drawn in this box. */
  readonly headroom: number;
  /** Corner radius of the bar, in px. */
  readonly radius: number;
  /** Horizontal span of the swelling, in px from the left edge of the bar. */
  readonly from: number;
  readonly to: number;
  /** Height of the swelling above the top edge of the bar. Zero, or less than half a px, gives a plain bar. */
  readonly rise: number;
}

/** How far the curve reaches toward the bar's top edge before it flattens out (fraction of the span). */
const SHOULDER = 0.45;
/** Where a swelling that ends at a bar end starts its vertical edge, as a fraction of its rise. */
const WALL_LIFT = 0.6;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * SVG path of the taskbar: a rounded bar whose top edge swells between `from` and `to`.
 * The bar and the swelling are one closed shape, so one fill and one stroke cover both with no seam.
 * When the swelling reaches a bar end, its edge rises straight there, with no curve beyond the bar.
 * Coordinates are in px, with y growing downward; the bar's top edge is at y = headroom.
 */
export function barOutline(o: BarOutline): string {
  const W = o.width;
  const H = o.height;
  const T = o.headroom;
  const B = o.headroom + H;
  const r = o.radius;

  const swelling = o.rise >= 0.5 && Math.min(W, o.to) - Math.max(0, o.from) >= 2 * r;
  const h = swelling ? o.rise : 0;
  let a = swelling ? Math.max(0, o.from) : r;
  let b = swelling ? Math.min(W, o.to) : W - r;
  // A span that ends within one corner radius of a bar end is taken to reach that end.
  if (a < r) {
    a = 0;
  }
  if (W - b < r) {
    b = W;
  }

  const leftWall = a === 0;
  const rightWall = b === W;
  const c = (a + b) / 2;
  const p = round2;
  const arc = (x: number, y: number): string => `A ${r} ${r} 0 0 0 ${p(x)} ${p(y)}`;

  const d: string[] = [`M ${p(r)} ${p(B)}`, `L ${p(W - r)} ${p(B)}`, arc(W, B - r)];

  // Right end, going up. Without a wall the corner is rounded, then the swelling starts on the top edge.
  if (rightWall) {
    d.push(`L ${p(W)} ${p(T)}`);
  } else {
    d.push(`L ${p(W)} ${p(T + r)}`, arc(W - r, T), `L ${p(b)} ${p(T)}`);
  }

  // Right half of the swelling, down to its peak.
  d.push(
    `C ${p(rightWall ? W : b - SHOULDER * (b - c))} ${p(rightWall ? T - WALL_LIFT * h : T)} ` +
      `${p(c + (b - c) / 2)} ${p(T - h)} ${p(c)} ${p(T - h)}`,
  );
  // Left half of the swelling, back down to the left end.
  d.push(
    `C ${p(c - (c - a) / 2)} ${p(T - h)} ` +
      `${p(leftWall ? 0 : a + SHOULDER * (c - a))} ${p(leftWall ? T - WALL_LIFT * h : T)} ${p(a)} ${p(T)}`,
  );

  // Left end, going down.
  if (leftWall) {
    d.push(`L 0 ${p(B - r)}`);
  } else {
    d.push(`L ${p(r)} ${p(T)}`, arc(0, T + r), `L 0 ${p(B - r)}`);
  }
  d.push(arc(r, B), 'Z');

  return d.join(' ');
}
