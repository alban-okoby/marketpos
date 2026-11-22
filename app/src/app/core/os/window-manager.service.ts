import { Injectable, computed, inject, signal } from '@angular/core';

import { AppId, getAppDefinition } from './apps';
import { ModuleSettingsService } from './module-settings.service';

export interface WindowState {
  readonly id: string;
  readonly appId: AppId;
  readonly title: string;
  /** Stacking order: the highest value is in front. */
  readonly z: number;
  readonly minimized: boolean;
  readonly maximized: boolean;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const FIRST_OFFSET = 64;
const CASCADE_STEP = 32;
const CASCADE_LENGTH = 6;

/**
 * Keeps the list of open windows and their stacking order.
 * Each app has at most one window: opening it again brings the existing window to the front.
 */
@Injectable({ providedIn: 'root' })
export class WindowManagerService {
  private readonly state = signal<readonly WindowState[]>([]);
  private readonly modules = inject(ModuleSettingsService);
  private topZ = 1;
  private windowCount = 0;

  readonly windows = this.state.asReadonly();

  /** Id of the frontmost visible window, or null when none is visible. */
  readonly activeId = computed(() => {
    const visible = this.state().filter((win) => !win.minimized);
    if (visible.length === 0) {
      return null;
    }
    return visible.reduce((top, win) => (win.z > top.z ? win : top)).id;
  });

  /**
   * Opens the module's window, or restores and focuses it if it is already open.
   * Returns the window id, or null when the module is turned off.
   */
  open(appId: AppId): string | null {
    if (!this.modules.isEnabled(appId)) {
      return null;
    }
    const existing = this.state().find((win) => win.appId === appId);
    if (existing) {
      this.restore(existing.id);
      return existing.id;
    }

    const app = getAppDefinition(appId);
    this.windowCount += 1;
    const offset = ((this.windowCount - 1) % CASCADE_LENGTH) * CASCADE_STEP;
    const win: WindowState = {
      id: `window-${this.windowCount}`,
      appId,
      title: app.title,
      z: ++this.topZ,
      minimized: false,
      maximized: false,
      x: FIRST_OFFSET + offset,
      y: FIRST_OFFSET + offset,
      width: app.size.width,
      height: app.size.height,
    };
    this.state.update((list) => [...list, win]);
    return win.id;
  }

  focus(id: string): void {
    this.patch(id, () => ({ z: ++this.topZ }));
  }

  minimize(id: string): void {
    this.patch(id, () => ({ minimized: true }));
  }

  /** Restores a minimized window and brings it to the front. */
  restore(id: string): void {
    this.patch(id, () => ({ minimized: false, z: ++this.topZ }));
  }

  toggleMaximize(id: string): void {
    this.patch(id, (win) => ({ maximized: !win.maximized, z: ++this.topZ }));
  }

  /** Stores a new position after the user has dragged the window. */
  moveTo(id: string, x: number, y: number): void {
    this.patch(id, () => ({ x, y }));
  }

  close(id: string): void {
    this.state.update((list) => list.filter((win) => win.id !== id));
  }

  /** Closes the window of a module, for example when the module is turned off. */
  closeApp(appId: AppId): void {
    this.state.update((list) => list.filter((win) => win.appId !== appId));
  }

  private patch(id: string, change: (win: WindowState) => Partial<WindowState>): void {
    this.state.update((list) =>
      list.map((win) => (win.id === id ? { ...win, ...change(win) } : win)),
    );
  }
}
