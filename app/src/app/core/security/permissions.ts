export const ROLES = ['caissier', 'gerant', 'administrateur', 'comptable'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  caissier: 'Caissier',
  gerant: 'Gérant',
  administrateur: 'Administrateur',
  comptable: 'Comptable',
};

/** Actions the application checks. Each one is enforced where it happens. */
export const ACTIONS = ['vendre', 'cloture-x', 'cloture-z', 'rectification', 'exporter', 'modules', 'parametres', 'stock'] as const;
export type Action = (typeof ACTIONS)[number];

export const ACTION_LABELS: Record<Action, string> = {
  vendre: 'Encaisser une vente',
  'cloture-x': 'Imprimer le rapport X',
  'cloture-z': 'Valider une clôture Z',
  rectification: 'Ajouter une rectification',
  exporter: 'Exporter les rapports',
  modules: 'Activer ou désactiver les modules',
  parametres: 'Modifier les paramètres et les droits',
  stock: 'Gérer les articles, sorties et inventaire',
};

export type PermissionMatrix = Readonly<Record<Role, readonly Action[]>>;

/** Starting rights (US-02). The manager always keeps "parametres", so the settings can never be locked out. */
export const DEFAULT_PERMISSIONS: PermissionMatrix = {
  caissier: ['vendre', 'cloture-x'],
  gerant: ['vendre', 'cloture-x', 'cloture-z', 'rectification', 'exporter', 'modules', 'parametres', 'stock'],
  administrateur: ['exporter', 'modules', 'parametres', 'stock'],
  comptable: ['exporter'],
};

/** Roles that must keep the settings permission. */
export const LOCKED_OUT_GUARD: readonly Role[] = ['gerant', 'administrateur'];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

export function isAction(value: unknown): value is Action {
  return typeof value === 'string' && (ACTIONS as readonly string[]).includes(value);
}

/** Saved rights, checked. A role with no usable saved list gets its default rights. */
export function parsePermissions(raw: unknown): PermissionMatrix {
  const value = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const result = {} as Record<Role, readonly Action[]>;
  for (const role of ROLES) {
    const saved = value[role];
    result[role] = Array.isArray(saved) ? saved.filter(isAction) : DEFAULT_PERMISSIONS[role];
  }
  for (const role of LOCKED_OUT_GUARD) {
    if (!result[role].includes('parametres')) {
      result[role] = [...result[role], 'parametres'];
    }
  }
  return result;
}

export function roleCan(matrix: PermissionMatrix, role: Role, action: Action): boolean {
  return matrix[role].includes(action);
}
