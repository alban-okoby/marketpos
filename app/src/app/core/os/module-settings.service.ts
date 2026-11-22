import { Injectable, computed, signal } from '@angular/core';

import { APPS, AppId } from './apps';

const STORAGE_KEY = 'marketpos.modules';

/**
 * Modules on a fresh install: the MVP (phase 1, in scope). The user adds the others as needed.
 */
export function defaultEnabledModules(): ReadonlySet<AppId> {
  return new Set(APPS.filter((app) => app.phase === 1 && app.scope === 'in').map((app) => app.id));
}

/** Core modules are always enabled. */
function coreModules(): readonly AppId[] {
  return APPS.filter((app) => app.core).map((app) => app.id);
}

/** Ids saved by the user that exist in the catalogue. Core modules are always added back. */
export function parseEnabledModules(raw: unknown): ReadonlySet<AppId> {
  if (!Array.isArray(raw)) {
    return defaultEnabledModules();
  }
  const known = new Set(APPS.map((app) => app.id));
  const ids = raw.filter((id): id is AppId => typeof id === 'string' && known.has(id as AppId));
  return new Set([...ids, ...coreModules()]);
}

/** The set of modules after enabling `appId`: its requirements are enabled first, recursively. */
export function withModuleEnabled(enabled: ReadonlySet<AppId>, appId: AppId): Set<AppId> {
  const next = new Set(enabled);
  const visit = (id: AppId): void => {
    if (next.has(id) && id !== appId) {
      return;
    }
    next.add(id);
    const app = APPS.find((candidate) => candidate.id === id);
    app?.requires.forEach(visit);
  };
  visit(appId);
  return next;
}

/** The set of modules after disabling `appId`, and every enabled module that depends on it. Core modules stay on. */
export function withModuleDisabled(enabled: ReadonlySet<AppId>, appId: AppId): Set<AppId> {
  const app = APPS.find((candidate) => candidate.id === appId);
  if (!app || app.core) {
    return new Set(enabled);
  }
  const next = new Set(enabled);
  const remove = (id: AppId): void => {
    if (!next.has(id)) {
      return;
    }
    next.delete(id);
    APPS.filter((candidate) => candidate.requires.includes(id)).forEach((dependent) => remove(dependent.id));
  };
  remove(appId);
  return next;
}

function readStored(): ReadonlySet<AppId> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseEnabledModules(JSON.parse(stored)) : defaultEnabledModules();
  } catch {
    return defaultEnabledModules();
  }
}

/**
 * Which modules are installed and turned on. The desktop, the start menu and the window manager only use enabled modules.
 */
@Injectable({ providedIn: 'root' })
export class ModuleSettingsService {
  private readonly enabled = signal<ReadonlySet<AppId>>(readStored());

  /** Enabled modules, in catalogue order. */
  readonly enabledApps = computed(() => APPS.filter((app) => this.enabled().has(app.id)));

  isEnabled(appId: AppId): boolean {
    return this.enabled().has(appId);
  }

  /**
   * Turns a module on or off. Returns the modules whose state changed, so the caller can close their windows.
   */
  setEnabled(appId: AppId, on: boolean): { readonly enabled: readonly AppId[]; readonly disabled: readonly AppId[] } {
    const current = this.enabled();
    const next = on ? withModuleEnabled(current, appId) : withModuleDisabled(current, appId);
    const enabled = [...next].filter((id) => !current.has(id));
    const disabled = [...current].filter((id) => !next.has(id));
    this.enabled.set(next);
    this.save(next);
    return { enabled, disabled };
  }

  /** Back to the MVP set. Returns the modules whose state changed. */
  resetToDefaults(): { readonly enabled: readonly AppId[]; readonly disabled: readonly AppId[] } {
    const current = this.enabled();
    const defaults = defaultEnabledModules();
    const enabled = [...defaults].filter((id) => !current.has(id));
    const disabled = [...current].filter((id) => !defaults.has(id));
    this.enabled.set(new Set(defaults));
    this.save(defaults);
    return { enabled, disabled };
  }

  private save(enabled: ReadonlySet<AppId>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...enabled]));
    } catch {
      // The choice still applies for this session.
    }
  }
}
