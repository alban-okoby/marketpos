import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { SessionService } from './session.service';

describe('SessionService', () => {
  let session: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    session = TestBed.inject(SessionService);
  });

  it('starts locked with no user signed in', () => {
    expect(session.locked()).toBe(true);
    expect(session.user()).toBeNull();
  });

  it('accepts the correct PIN and rejects a wrong one', () => {
    expect(session.verifyPin('caissier1', '1111')).toBe(true);
    expect(session.verifyPin('caissier1', '2222')).toBe(false);
    expect(session.verifyPin('inconnu', '1111')).toBe(false);
  });

  it('unlocks as the given user', () => {
    session.unlock('gerant');

    expect(session.locked()).toBe(false);
    expect(session.user()?.name).toBe('Gérant');
  });

  it('keeps the user when the screen is locked, and clears it on sign out', () => {
    session.unlock('caissier2');

    session.lock();
    expect(session.locked()).toBe(true);
    expect(session.user()?.id).toBe('caissier2');

    session.signOut();
    expect(session.locked()).toBe(true);
    expect(session.user()).toBeNull();
  });

  it('refuses to unlock as an unknown user', () => {
    expect(() => session.unlock('inconnu')).toThrowError(/Unknown user/);
  });
});
