import { Injectable, computed, inject, signal } from '@angular/core';

import type { AppDefinition } from '../os/apps';
import { SessionService } from '../session/session.service';
import { readStored, writeStored } from '../settings/storage';
import { Action, DEFAULT_PERMISSIONS, LOCKED_OUT_GUARD, PermissionMatrix, Role, parsePermissions, roleCan } from './permissions';

const STORAGE_KEY = 'marketpos.droits';

/**
 * Rights of each role, and the check for the signed-in user. Only a user who may change the settings can change the rights.
 */
@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private readonly session = inject(SessionService);
  private readonly state = signal<PermissionMatrix>(readStored(STORAGE_KEY, parsePermissions));
  readonly matrix = this.state.asReadonly();

  /** Rights of the signed-in user. Nobody has rights while no one is signed in. */
  readonly currentRole = computed<Role | null>(() => this.session.user()?.roleId ?? null);

  roleCan(role: Role, action: Action): boolean {
    return roleCan(this.state(), role, action);
  }

  /** True when the signed-in user may do the action. */
  can(action: Action): boolean {
    const role = this.currentRole();
    return role !== null && roleCan(this.state(), role, action);
  }

  /**
   * True when the signed-in user has at least one right the module needs. A module without rights is visible to everyone.
   */
  canSee(app: AppDefinition): boolean {
    if (!app.actions) {
      return true;
    }
    return app.actions.some((action) => this.can(action));
  }

  /** Grants or removes one right. Refused unless the signed-in user may change the settings, and the manager keeps the settings right. */
  set(role: Role, action: Action, allowed: boolean): void {
    if (!this.can('parametres')) {
      throw new Error('Votre rôle ne permet pas de modifier les droits.');
    }
    if (!allowed && action === 'parametres' && LOCKED_OUT_GUARD.includes(role)) {
      throw new Error('Ce rôle doit garder l’accès aux paramètres.');
    }
    const current = this.state()[role];
    const next = allowed ? [...new Set([...current, action])] : current.filter((item) => item !== action);
    this.save({ ...this.state(), [role]: next });
  }

  resetToDefaults(): void {
    if (!this.can('parametres')) {
      throw new Error('Votre rôle ne permet pas de modifier les droits.');
    }
    this.save(DEFAULT_PERMISSIONS);
  }

  private save(matrix: PermissionMatrix): void {
    const checked = parsePermissions(matrix);
    this.state.set(checked);
    writeStored(STORAGE_KEY, checked);
  }
}
