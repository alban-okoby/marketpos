/** True when the user has asked the operating system to reduce motion. */
export function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Returns the animation duration in seconds, or 0 when motion is reduced.
 * Every GSAP call goes through this helper so the setting is respected everywhere.
 */
export function duration(seconds: number): number {
  return reducedMotion() ? 0 : seconds;
}
