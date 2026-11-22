export interface DemoUser {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  /**
   * DEMO ONLY. Plain-text PIN copied from the prototype (see README).
   * Requirement US-01 requires a hashed PIN before any real use.
   */
  readonly pin: string;
}

export const DEMO_USERS: readonly DemoUser[] = [
  { id: 'caissier1', name: 'Caissier 1', role: 'Caissier', pin: '1111' },
  { id: 'caissier2', name: 'Caissier 2', role: 'Caissier', pin: '2222' },
  { id: 'gerant', name: 'Gérant', role: 'Gérant', pin: '9999' },
];
