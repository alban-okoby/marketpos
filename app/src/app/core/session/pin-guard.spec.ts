import { describe, expect, it } from 'vitest';

import { NO_FAILURES, registerFailure, secondsLeft } from './pin-guard';

describe('PIN guard', () => {
  const minute = 60_000;

  it('blocks after the allowed number of wrong PINs, and starts the count again after the block', () => {
    let state = NO_FAILURES;
    state = registerFailure(state, 0, 3, minute);
    state = registerFailure(state, 0, 3, minute);
    expect(state.blockedUntil).toBeNull();
    state = registerFailure(state, 0, 3, minute);
    expect(state.blockedUntil).toBe(minute);
    expect(state.failures).toBe(0);
  });

  it('counts down the seconds left and reaches zero when the block ends', () => {
    const state = { failures: 0, blockedUntil: 60_000 };
    expect(secondsLeft(state, 0)).toBe(60);
    expect(secondsLeft(state, 59_500)).toBe(1);
    expect(secondsLeft(state, 60_000)).toBe(0);
    expect(secondsLeft(NO_FAILURES, 0)).toBe(0);
  });
});
