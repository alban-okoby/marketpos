import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { PermissionsService } from '../../core/security/permissions.service';
import { ROLES, ROLE_LABELS, Role } from '../../core/security/permissions';
import { UsersService } from '../../core/security/users.service';
import { SessionService } from '../../core/session/session.service';

/**
 * User accounts: create them, give each one a role, change a PIN, and deactivate an account.
 * Anyone can read the list; changes need the settings right.
 */
@Component({
  selector: 'app-utilisateurs-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="users">
      @if (!canManage()) {
        <p class="hint">Vous pouvez consulter les comptes. Seul un rôle autorisé peut les modifier.</p>
      }

      <div class="table-wrap">
        <table>
          <thead><tr><th>Nom</th><th>Identifiant</th><th>Rôle</th><th>Statut</th><th>Mot de passe</th><th>Code PIN</th></tr></thead>
          <tbody>
            @for (account of accounts(); track account.id) {
              <tr [class.inactive]="!account.active">
                <td>{{ account.name }}</td>
                <td><code>{{ account.login }}</code></td>
                <td>
                  <select [value]="account.roleId" [disabled]="!canManage()" [attr.aria-label]="'Rôle de ' + account.name" (change)="setRole(account.id, $event)">
                    @for (role of roles; track role) { <option [value]="role">{{ roleLabels[role] }}</option> }
                  </select>
                </td>
                <td>
                  <button type="button" class="status" [disabled]="!canManage()" (click)="toggle(account.id, account.active)">
                    {{ account.active ? 'Actif' : 'Désactivé' }}
                  </button>
                </td>
                <td>
                  <span class="pin-row">
                    <input type="password" autocomplete="new-password" placeholder="Nouveau" [disabled]="!canManage()" [attr.aria-label]="'Nouveau mot de passe de ' + account.name" [value]="passwordFor(account.id)" (input)="setPasswordDraft(account.id, $event)" />
                    <button type="button" [disabled]="!canManage() || passwordFor(account.id).length === 0" (click)="changePassword(account.id)">Changer</button>
                  </span>
                </td>
                <td>
                  <span class="pin-row">
                    <input type="password" inputmode="numeric" maxlength="4" placeholder="Nouveau" [disabled]="!canManage()" [attr.aria-label]="'Nouveau code PIN de ' + account.name" [value]="pinFor(account.id)" (input)="setPinDraft(account.id, $event)" />
                    <button type="button" [disabled]="!canManage() || pinFor(account.id).length !== 4" (click)="changePin(account.id)">Changer</button>
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <form class="new" (submit)="$event.preventDefault(); create()">
        <h3>Nouvel utilisateur</h3>
        <div class="row">
          <label><span>Nom</span><input [value]="newName()" [disabled]="!canManage()" (input)="newName.set(value($event))" /></label>
          <label><span>Identifiant</span><input autocomplete="off" autocapitalize="none" [value]="newLogin()" [disabled]="!canManage()" (input)="newLogin.set(value($event))" /></label>
          <label><span>Rôle</span>
            <select [value]="newRole()" [disabled]="!canManage()" (change)="newRole.set(roleOf($event))">
              @for (role of roles; track role) { <option [value]="role">{{ roleLabels[role] }}</option> }
            </select>
          </label>
          <label><span>Mot de passe</span><input type="password" autocomplete="new-password" [value]="newPassword()" [disabled]="!canManage()" (input)="newPassword.set(value($event))" /></label>
          <label><span>Code PIN (4 chiffres)</span><input type="password" inputmode="numeric" maxlength="4" [value]="newPin()" [disabled]="!canManage()" (input)="newPin.set(digits($event))" /></label>
          <button type="submit" class="primary" [disabled]="!canManage()">Créer</button>
        </div>
      </form>

      @if (error(); as message) { <p class="error" role="alert">{{ message }}</p> }
      @if (notice(); as message) { <p class="notice" role="status">{{ message }}</p> }
    </section>
  `,
  styleUrl: './utilisateurs-app.component.scss',
})
export class UtilisateursAppComponent {
  private readonly users = inject(UsersService);
  private readonly permissions = inject(PermissionsService);
  private readonly session = inject(SessionService);

  readonly roles = ROLES;
  readonly roleLabels = ROLE_LABELS;
  readonly accounts = this.users.all;
  readonly canManage = computed(() => this.permissions.can('parametres'));

  readonly newName = signal('');
  readonly newLogin = signal('');
  readonly newRole = signal<Role>('caissier');
  readonly newPassword = signal('');
  readonly newPin = signal('');
  readonly drafts = signal<Record<string, string>>({});
  readonly passwordDrafts = signal<Record<string, string>>({});
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  roleOf(event: Event): Role {
    const choice = this.value(event);
    return ROLES.find((role) => role === choice) ?? 'caissier';
  }

  digits(event: Event): string {
    return this.value(event).replace(/\D/g, '').slice(0, 4);
  }

  pinFor(id: string): string {
    return this.drafts()[id] ?? '';
  }

  setPinDraft(id: string, event: Event): void {
    this.drafts.set({ ...this.drafts(), [id]: this.digits(event) });
  }

  passwordFor(id: string): string {
    return this.passwordDrafts()[id] ?? '';
  }

  setPasswordDraft(id: string, event: Event): void {
    this.passwordDrafts.set({ ...this.passwordDrafts(), [id]: this.value(event) });
  }

  async create(): Promise<void> {
    await this.run(async () => {
      const account = await this.users.add({
        name: this.newName(),
        login: this.newLogin(),
        roleId: this.newRole(),
        password: this.newPassword(),
        pin: this.newPin(),
      });
      this.newName.set('');
      this.newLogin.set('');
      this.newPassword.set('');
      this.newPin.set('');
      this.notice.set(`Compte créé : ${account.name} (identifiant ${account.login}).`);
    });
  }

  async changePassword(id: string): Promise<void> {
    await this.run(async () => {
      await this.users.setPassword(id, this.passwordFor(id));
      this.passwordDrafts.set({ ...this.passwordDrafts(), [id]: '' });
      this.notice.set('Mot de passe modifié.');
    });
  }

  setRole(id: string, event: Event): void {
    const role = this.roleOf(event);
    this.run(() => this.users.setRole(id, role));
  }

  toggle(id: string, active: boolean): void {
    if (id === this.session.user()?.id && active) {
      this.error.set('Vous ne pouvez pas désactiver votre propre compte.');
      return;
    }
    this.run(() => this.users.setActive(id, !active));
  }

  async changePin(id: string): Promise<void> {
    await this.run(async () => {
      await this.users.setPin(id, this.pinFor(id));
      this.drafts.set({ ...this.drafts(), [id]: '' });
      this.notice.set('Code PIN modifié.');
    });
  }

  private async run(action: () => void | Promise<void>): Promise<void> {
    if (!this.canManage()) {
      this.error.set('Votre rôle ne permet pas de modifier les comptes.');
      return;
    }
    try {
      await action();
      this.error.set(null);
    } catch (failure) {
      this.notice.set(null);
      this.error.set(failure instanceof Error ? failure.message : 'Opération impossible.');
    }
  }
}
