import type { Role } from '../security/permissions';

export interface DemoUser {
  readonly id: string;
  readonly name: string;
  /** Label shown on the lock screen. */
  readonly role: string;
  /** Rights of this user (see core/security). */
  readonly roleId: Role;
  /**
   * DEMO ONLY. Plain-text PIN copied from the prototype (see README).
   * Requirement US-01 requires a hashed PIN before any real use.
   */
  readonly pin: string;
}

export const DEMO_USERS: readonly DemoUser[] = [
  { id: 'caissier1', name: 'Caissier 1', role: 'Caissier', roleId: 'caissier', pin: '1111' },
  { id: 'caissier2', name: 'Caissier 2', role: 'Caissier', roleId: 'caissier', pin: '2222' },
  { id: 'gerant', name: 'Gérant', role: 'Gérant', roleId: 'gerant', pin: '9999' },
];
