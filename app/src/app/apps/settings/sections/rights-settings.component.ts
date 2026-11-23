import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { ACTIONS, ACTION_LABELS, Action, ROLES, ROLE_LABELS, Role, LOCKED_OUT_GUARD, roleCan } from '../../../core/security/permissions';
import { PermissionsService } from '../../../core/security/permissions.service';

/** Settings page "Droits": which role may do what. Only a user with the settings right can change it. */
@Component({
  selector: 'app-rights-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="page">
      <header>
        <h2>Droits</h2>
        <p class="subtitle">Ce que chaque rôle peut faire dans l'application.</p>
      </header>

      @if (!permissions.can('parametres')) {
        <p class="hint">Seul un utilisateur autorisé à modifier les paramètres peut changer les droits.</p>
      }

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Action</th>
              @for (role of roles; track role) {
                <th scope="col">{{ roleLabels[role] }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (action of actions; track action) {
              <tr>
                <th scope="row">{{ actionLabels[action] }}</th>
                @for (role of roles; track role) {
                  <td>
                    <input
                      type="checkbox"
                      [checked]="roleCan(role, action)"
                      [disabled]="locked(role, action)"
                      [attr.aria-label]="roleLabels[role] + ' : ' + actionLabels[action]"
                      (change)="toggle(role, action, $event)"
                    />
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="row-actions">
        <button type="button" class="reset" (click)="reset()" [disabled]="!permissions.can('parametres')">
          Rétablir les droits par défaut
        </button>
      </div>

      @if (error(); as message) {
        <p class="error" role="alert">{{ message }}</p>
      }
    </article>
  `,
  styleUrl: './rights-settings.component.scss',
})
export class RightsSettingsComponent {
  readonly permissions = inject(PermissionsService);
  readonly roles = ROLES;
  readonly actions = ACTIONS;
  readonly roleLabels = ROLE_LABELS;
  readonly actionLabels = ACTION_LABELS;
  readonly error = signal<string | null>(null);

  roleCan(role: Role, action: Action): boolean {
    return roleCan(this.permissions.matrix(), role, action);
  }

  /** The manager and the administrator always keep the settings right: its box stays ticked. */
  locked(role: Role, action: Action): boolean {
    return !this.permissions.can('parametres') || (action === 'parametres' && LOCKED_OUT_GUARD.includes(role));
  }

  toggle(role: Role, action: Action, event: Event): void {
    this.run(() => this.permissions.set(role, action, (event.target as HTMLInputElement).checked));
  }

  reset(): void {
    this.run(() => this.permissions.resetToDefaults());
  }

  private run(change: () => void): void {
    try {
      change();
      this.error.set(null);
    } catch (failure) {
      this.error.set(failure instanceof Error ? failure.message : 'Modification impossible.');
    }
  }
}
