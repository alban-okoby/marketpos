import type { Role } from '../security/permissions';

export interface DemoUser {
  readonly id: string;
  readonly name: string;
  /** Identifiant typed on the lock screen. */
  readonly login: string;
  /** Label shown on the lock screen. */
  readonly role: string;
  /** Rights of this user (see core/security). */
  readonly roleId: Role;
  /**
   * DEMO ONLY. Plain-text password, used once to seed the hashed account on the first start.
   * Requirement US-01 requires hashed secrets before any real use.
   */
  readonly password: string;
  /** DEMO ONLY. Plain-text PIN for manager authorisations, hashed on the first start. */
  readonly pin: string;
}

export const DEMO_USERS: readonly DemoUser[] = [
  {
    id: 'caissier1',
    name: 'Caissier 1',
    login: 'caissier1',
    role: 'Caissier',
    roleId: 'caissier',
    password: 'caisse-1111',
    pin: '1111',
  },
  {
    id: 'caissier2',
    name: 'Caissier 2',
    login: 'caissier2',
    role: 'Caissier',
    roleId: 'caissier',
    password: 'caisse-2222',
    pin: '2222',
  },
  { id: 'gerant', name: 'Gérant', login: 'gerant', role: 'Gérant', roleId: 'gerant', password: 'gerant-9999', pin: '9999' },
];
