/** Failed PIN attempts for one user, and the moment the block ends (null when not blocked). */
export interface PinGuardState {
  readonly failures: number;
  readonly blockedUntil: number | null;
}

export const NO_FAILURES: PinGuardState = { failures: 0, blockedUntil: null };

/**
 * Registers a wrong PIN. After `maxAttempts` wrong PINs in a row, the PIN is blocked for `lockoutMs`
 * and the counter starts again when the block ends.
 */
export function registerFailure(state: PinGuardState, now: number, maxAttempts: number, lockoutMs: number): PinGuardState {
  const failures = state.failures + 1;
  if (failures >= maxAttempts) {
    return { failures: 0, blockedUntil: now + lockoutMs };
  }
  return { failures, blockedUntil: state.blockedUntil };
}

/** Seconds left before the PIN can be tried again. Zero when it is not blocked. */
export function secondsLeft(state: PinGuardState, now: number): number {
  if (state.blockedUntil === null || now >= state.blockedUntil) {
    return 0;
  }
  return Math.ceil((state.blockedUntil - now) / 1000);
}
