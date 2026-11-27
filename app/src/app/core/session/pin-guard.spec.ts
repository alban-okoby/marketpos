import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { SecuritySettingsService } from '../settings/security.service';
import { NO_FAILURES, registerFailure, secondsLeft } from './pin-guard';
import { PinGuardService, accountScope } from './pin-guard.service';

describe('PIN guard per account', () => {
  beforeEach(() => {
    localStorage.removeItem('marketpos.pinguard');
    localStorage.removeItem('marketpos.securite');
    TestBed.configureTestingModule({});
    TestBed.inject(SecuritySettingsService).update({ maxPinAttempts: 2, lockoutSeconds: 60 });
  });

  it('blocks only the account whose password failed', () => {
    const guard = TestBed.inject(PinGuardService);
    guard.fail(accountScope('caissier1'));
    guard.fail(accountScope('caissier1'));
    expect(guard.secondsLeft(accountScope('caissier1'))).toBeGreaterThan(0);
    expect(guard.secondsLeft(accountScope('caissier2'))).toBe(0);
    expect(guard.secondsLeft(accountScope('gerant'))).toBe(0);
  });

  it('keeps the manager PIN block separate from the sign-in blocks', () => {
    const guard = TestBed.inject(PinGuardService);
    guard.fail('gerant');
    guard.fail('gerant');
    expect(guard.secondsLeft('gerant')).toBeGreaterThan(0);
    expect(guard.secondsLeft(accountScope('gerant'))).toBe(0);
  });
});

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
