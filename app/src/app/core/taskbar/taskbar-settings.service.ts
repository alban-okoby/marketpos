import { Injectable, computed, effect, signal } from '@angular/core';

export type TaskbarPosition = 'bottom' | 'top' | 'left' | 'right';
export type TaskbarAlignment = 'center' | 'start';

export type TaskbarIconSize = 'small' | 'normal' | 'large';

export interface TaskbarSettings {
  readonly position: TaskbarPosition;
  readonly alignment: TaskbarAlignment;
  readonly autoHide: boolean;
  readonly iconSize: TaskbarIconSize;
}

export const DEFAULT_TASKBAR_SETTINGS: TaskbarSettings = {
  position: 'bottom',
  alignment: 'center',
  autoHide: false,
  iconSize: 'normal',
};

/** Size in px of the icons and the logo in the taskbar, for each choice in Paramètres. */
export const TASKBAR_ICON_PX: Readonly<Record<TaskbarIconSize, number>> = {
  small: 18,
  normal: 22,
  large: 28,
};

const STORAGE_KEY = 'marketpos.taskbar';
const POSITIONS: readonly TaskbarPosition[] = ['bottom', 'top', 'left', 'right'];
const ALIGNMENTS: readonly TaskbarAlignment[] = ['center', 'start'];
const ICON_SIZES = Object.keys(TASKBAR_ICON_PX) as TaskbarIconSize[];

/**
 * Reads saved taskbar settings. Anything missing or invalid falls back to the defaults,
 * so a corrupted value can never leave the desktop without a taskbar.
 */
export function parseTaskbarSettings(raw: unknown): TaskbarSettings {
  if (typeof raw !== 'object' || raw === null) {
    return DEFAULT_TASKBAR_SETTINGS;
  }
  const value = raw as Record<string, unknown>;
  return {
    position: POSITIONS.includes(value['position'] as TaskbarPosition)
      ? (value['position'] as TaskbarPosition)
      : DEFAULT_TASKBAR_SETTINGS.position,
    alignment: ALIGNMENTS.includes(value['alignment'] as TaskbarAlignment)
      ? (value['alignment'] as TaskbarAlignment)
      : DEFAULT_TASKBAR_SETTINGS.alignment,
    autoHide: typeof value['autoHide'] === 'boolean' ? value['autoHide'] : DEFAULT_TASKBAR_SETTINGS.autoHide,
    iconSize: ICON_SIZES.includes(value['iconSize'] as TaskbarIconSize)
      ? (value['iconSize'] as TaskbarIconSize)
      : DEFAULT_TASKBAR_SETTINGS.iconSize,
  };
}

function readStored(): TaskbarSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseTaskbarSettings(JSON.parse(stored)) : DEFAULT_TASKBAR_SETTINGS;
  } catch {
    return DEFAULT_TASKBAR_SETTINGS;
  }
}

/**
 * Taskbar position, alignment and auto-hide. The service also publishes the space the taskbar takes
 * from the screen (`--reserve-*` on the root element), so windows and icons never sit under the bar.
 */
@Injectable({ providedIn: 'root' })
export class TaskbarSettingsService {
  private readonly state = signal<TaskbarSettings>(readStored());

  readonly position = computed(() => this.state().position);
  readonly alignment = computed(() => this.state().alignment);
  readonly autoHide = computed(() => this.state().autoHide);
  readonly iconSize = computed(() => this.state().iconSize);
  /** Icon size in px, from the chosen size. */
  readonly iconPx = computed(() => TASKBAR_ICON_PX[this.state().iconSize]);

  /** Space reserved on each side of the screen. Zero when the bar hides itself. */
  readonly reserves = computed(() => {
    const { position, autoHide } = this.state();
    const space = autoHide ? '0px' : 'var(--taskbar-space)';
    return {
      top: position === 'top' ? space : '0px',
      bottom: position === 'bottom' ? space : '0px',
      left: position === 'left' ? space : '0px',
      right: position === 'right' ? space : '0px',
    };
  });

  constructor() {
    effect(() => {
      const root = document.documentElement.style;
      const { top, bottom, left, right } = this.reserves();
      root.setProperty('--reserve-top', top);
      root.setProperty('--reserve-bottom', bottom);
      root.setProperty('--reserve-left', left);
      root.setProperty('--reserve-right', right);
    });
  }

  update(change: Partial<TaskbarSettings>): void {
    const next = parseTaskbarSettings({ ...this.state(), ...change });
    this.state.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The choice still applies for this session.
    }
  }
}
