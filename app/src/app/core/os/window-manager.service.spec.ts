import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { WindowManagerService } from './window-manager.service';

describe('WindowManagerService', () => {
  let wm: WindowManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    wm = TestBed.inject(WindowManagerService);
  });

  it('opens one window per app and brings the existing one to the front', () => {
    const first = wm.open('caisse');
    const second = wm.open('caisse');

    expect(second).toBe(first);
    expect(wm.windows().length).toBe(1);
  });

  it('makes the most recently opened or focused window active', () => {
    const caisse = wm.open('caisse');
    const stock = wm.open('stock');
    expect(wm.activeId()).toBe(stock);

    wm.focus(caisse);
    expect(wm.activeId()).toBe(caisse);
  });

  it('ignores minimized windows when choosing the active one', () => {
    const caisse = wm.open('caisse');
    const stock = wm.open('stock');

    wm.minimize(stock);
    expect(wm.activeId()).toBe(caisse);

    wm.minimize(caisse);
    expect(wm.activeId()).toBeNull();
  });

  it('restores a minimized window and brings it to the front', () => {
    const caisse = wm.open('caisse');
    wm.open('stock');
    wm.minimize(caisse);

    wm.restore(caisse);

    const win = wm.windows().find((w) => w.id === caisse);
    expect(win?.minimized).toBe(false);
    expect(wm.activeId()).toBe(caisse);
  });

  it('toggles maximize without losing the stored position', () => {
    const id = wm.open('rapports');
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
    const id = wm.open('stock');

    wm.moveTo(id, 200, 120);

    const win = wm.windows().find((w) => w.id === id);
    expect(win?.x).toBe(200);
    expect(win?.y).toBe(120);
  });

  it('removes a closed window', () => {
    const id = wm.open('parametres');

    wm.close(id);

    expect(wm.windows().length).toBe(0);
    expect(wm.activeId()).toBeNull();
  });
});
