import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from '../security/users.service';
import { SessionService } from '../session/session.service';
import { WindowManagerService } from './window-manager.service';

/** Opens a module and fails the test if it is switched off. */
function openApp(wm: WindowManagerService, appId: Parameters<WindowManagerService['open']>[0]): string {
  const id = wm.open(appId);
  if (id === null) {
    throw new Error(`${appId} should be enabled by default`);
  }
  return id;
}

describe('WindowManagerService', () => {
  let wm: WindowManagerService;

  beforeEach(async () => {
    localStorage.removeItem('marketpos.utilisateurs');
    localStorage.removeItem('marketpos.droits');
    TestBed.configureTestingModule({});
    await TestBed.inject(UsersService).whenReady();
    // The manager sees every module, so the windows below can open.
    TestBed.inject(SessionService).unlock('gerant');
    wm = TestBed.inject(WindowManagerService);
  });

  it('opens one window per app and brings the existing one to the front', () => {
    const first = openApp(wm, 'caisse');
    const second = openApp(wm, 'caisse');

    expect(second).toBe(first);
    expect(wm.windows().length).toBe(1);
  });

  it('makes the most recently opened or focused window active', () => {
    const caisse = openApp(wm, 'caisse');
    const stock = openApp(wm, 'stock');
    expect(wm.activeId()).toBe(stock);

    wm.focus(caisse);
    expect(wm.activeId()).toBe(caisse);
  });

  it('ignores minimized windows when choosing the active one', () => {
    const caisse = openApp(wm, 'caisse');
    const stock = openApp(wm, 'stock');

    wm.minimize(stock);
    expect(wm.activeId()).toBe(caisse);

    wm.minimize(caisse);
    expect(wm.activeId()).toBeNull();
  });

  it('restores a minimized window and brings it to the front', () => {
    const caisse = openApp(wm, 'caisse');
    openApp(wm, 'stock');
    wm.minimize(caisse);

    wm.restore(caisse);

    const win = wm.windows().find((w) => w.id === caisse);
    expect(win?.minimized).toBe(false);
    expect(wm.activeId()).toBe(caisse);
  });

  it('toggles maximize without losing the stored position', () => {
    const id = openApp(wm, 'rapports');
    const before = wm.windows().find((w) => w.id === id);

    wm.toggleMaximize(id);
    expect(wm.windows().find((w) => w.id === id)?.maximized).toBe(true);

    wm.toggleMaximize(id);
    const after = wm.windows().find((w) => w.id === id);
    expect(after?.maximized).toBe(false);
    expect(after?.x).toBe(before?.x);
    expect(after?.y).toBe(before?.y);
  });

  it('stores a new position after a move', () => {
    const id = openApp(wm, 'stock');

    wm.moveTo(id, 200, 120);

    const win = wm.windows().find((w) => w.id === id);
    expect(win?.x).toBe(200);
    expect(win?.y).toBe(120);
  });

  it('removes a closed window', () => {
    const id = openApp(wm, 'parametres');

    wm.close(id);

    expect(wm.windows().length).toBe(0);
    expect(wm.activeId()).toBeNull();
  });
});
