import { IconName } from '../../shared/icon/icon.component';

export type AppId =
  | 'caisse'
  | 'cloture'
  | 'tarifs'
  | 'stock'
  | 'entrepots'
  | 'achats'
  | 'clients'
  | 'mobile-money'
  | 'tresorerie'
  | 'fiscalite'
  | 'comptabilite'
  | 'rapports'
  | 'documents'
  | 'utilisateurs'
  | 'rh'
  | 'livraison'
  | 'eshop'
  | 'peripheriques'
  | 'synchronisation'
  | 'sauvegarde'
  | 'alertes'
  | 'parametres';

export type ModuleCategory = 'ventes' | 'stock' | 'finance' | 'clients' | 'achats' | 'analyse' | 'rh' | 'outils' | 'administration';

export interface ModuleCategoryDefinition {
  readonly id: ModuleCategory;
  readonly label: string;
}

/** Order in which categories appear in Paramètres and in the start menu. */
export const MODULE_CATEGORIES: readonly ModuleCategoryDefinition[] = [
  { id: 'ventes', label: 'Ventes' },
  { id: 'stock', label: 'Stock' },
  { id: 'achats', label: 'Achats' },
  { id: 'clients', label: 'Clients' },
  { id: 'finance', label: 'Finance et fiscalité' },
  { id: 'analyse', label: 'Analyse' },
  { id: 'rh', label: 'Ressources humaines' },
  { id: 'outils', label: 'Outils' },
  { id: 'administration', label: 'Administration' },
];

export interface AppDefinition {
  readonly id: AppId;
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
  readonly category: ModuleCategory;
  /** Phase in the specification: 1 = MVP, 2 = later, 3 = future. */
  readonly phase: 1 | 2 | 3;
  /**
   * Modules this one needs. Enabling a module enables these first; disabling one also disables the modules that need it.
   */
  readonly requires: readonly AppId[];
  /** Requirement IDs from docs/en/cahier-des-charges.md covered by this module. */
  readonly requirements: readonly string[];
  /**
   * `outside` marks a module that the specification excludes today (section 2), so it needs a decision before it is built.
   */
  readonly scope: 'in' | 'outside';
  /** Core modules are always enabled and cannot be turned off. */
  readonly core?: boolean;
  /** Default window size in pixels. */
  readonly size: { readonly width: number; readonly height: number };
}

const WINDOW = { width: 900, height: 600 };

export const APPS: readonly AppDefinition[] = [
  {
    id: 'caisse',
    title: 'Caisse',
    description: 'Encaissement, panier et paiement',
    icon: 'register',
    category: 'ventes',
    phase: 1,
    requires: [],
    requirements: ['CA-01', 'CA-02', 'CA-05', 'CA-06', 'CA-11'],
    scope: 'in',
    size: { width: 1100, height: 680 },
  },
  {
    id: 'cloture',
    title: 'Clôture de caisse',
    description: 'Rapports X et Z, écarts de caisse',
    icon: 'receipt',
    category: 'ventes',
    phase: 1,
    requires: ['caisse'],
    requirements: ['CL-01', 'CL-02', 'CL-03', 'CL-04', 'CL-05'],
    scope: 'in',
    size: { width: 820, height: 600 },
  },
  {
    id: 'tarifs',
    title: 'Tarifs et promotions',
    description: 'Prix, remises, promotions et étiquettes',
    icon: 'label',
    category: 'ventes',
    phase: 1,
    requires: [],
    requirements: ['CA-04', 'CA-07', 'CA-13'],
    scope: 'in',
    size: WINDOW,
  },
  {
    id: 'stock',
    title: 'Stock',
    description: 'Articles, entrées et sorties, inventaire',
    icon: 'box',
    category: 'stock',
    phase: 1,
    requires: [],
    requirements: ['ST-01', 'ST-02', 'ST-03', 'ST-05'],
    scope: 'in',
    size: { width: 960, height: 620 },
  },
  {
    id: 'entrepots',
    title: 'Entrepôts',
    description: 'Plusieurs entrepôts et transferts',
    icon: 'building',
    category: 'stock',
    phase: 3,
    requires: ['stock'],
    requirements: ['ST-08'],
    scope: 'in',
    size: WINDOW,
  },
  {
    id: 'achats',
    title: 'Achats et fournisseurs',
    description: 'Commandes, réceptions et prix d\'achat',
    icon: 'shopping-bags',
    category: 'achats',
    phase: 2,
    requires: ['stock'],
    requirements: ['AC-01', 'AC-02', 'AC-03', 'ST-04'],
    scope: 'in',
    size: WINDOW,
  },
  {
    id: 'clients',
    title: 'Clients et fidélité',
    description: 'Fiches clients, points, crédit',
    icon: 'users',
    category: 'clients',
    phase: 2,
    requires: ['caisse'],
    requirements: ['CF-01', 'CF-02', 'CF-04', 'CA-14'],
    scope: 'in',
    size: { width: 880, height: 600 },
  },
  {
    id: 'mobile-money',
    title: 'Mobile money',
    description: 'Orange Money, MTN MoMo, Moov Money, Wave',
    icon: 'card',
    category: 'finance',
    phase: 1,
    requires: ['caisse'],
    requirements: ['MM-01', 'MM-02', 'MM-04'],
    scope: 'in',
    size: WINDOW,
  },
  {
    id: 'tresorerie',
    title: 'Trésorerie',
    description: 'Encaissements, rapprochement et flux de caisse',
    icon: 'money',
    category: 'finance',
    phase: 1,
    requires: ['caisse'],
    requirements: ['MM-03', 'CL-03'],
    scope: 'in',
    size: WINDOW,
  },
  {
    id: 'fiscalite',
    title: 'Fiscalité',
    description: 'TVA par taux, FNE, archivage légal',
    icon: 'bank',
    category: 'finance',
    phase: 1,
    requires: ['caisse'],
    requirements: ['FC-01', 'FC-02', 'FC-04', 'FC-05'],
    scope: 'in',
    size: WINDOW,
  },
  {
    id: 'comptabilite',
    title: 'Comptabilité',
    description: 'Plan comptable SYSCOHADA, journaux, exports',
    icon: 'abacus',
    category: 'finance',
    phase: 2,
    requires: ['fiscalite'],
    requirements: ['FC-03'],
    scope: 'in',
    size: WINDOW,
  },
  {
    id: 'rapports',
    title: 'Rapports',
    description: 'Ventes, meilleurs articles, valeur du stock',
    icon: 'chart',
    category: 'analyse',
    phase: 1,
    requires: [],
    requirements: ['RP-01', 'RP-03', 'RP-04', 'RP-05'],
    scope: 'in',
    size: { width: 960, height: 620 },
  },
  {
    id: 'documents',
    title: 'Documents et exports',
    description: 'Export Excel et PDF, modèles d\'impression',
    icon: 'scroll',
    category: 'analyse',
    phase: 2,
    requires: [],
    requirements: ['RP-05', 'FC-05'],
    scope: 'in',
    size: WINDOW,
  },
  {
    id: 'rh',
    title: 'Ressources humaines',
    description: 'Employés et présences. La paie est hors périmètre actuel.',
    icon: 'briefcase',
    category: 'rh',
    phase: 3,
    requires: ['utilisateurs'],
    requirements: [],
    scope: 'outside',
    size: WINDOW,
  },
  {
    id: 'livraison',
    title: 'Livraison',
    description: 'Commandes à livrer et tournées',
    icon: 'truck',
    category: 'ventes',
    phase: 3,
    requires: ['caisse'],
    requirements: [],
    scope: 'outside',
    size: WINDOW,
  },
  {
    id: 'eshop',
    title: 'Boutique en ligne',
    description: 'Vente en ligne et click & collect',
    icon: 'laptop',
    category: 'ventes',
    phase: 3,
    requires: ['stock'],
    requirements: [],
    scope: 'outside',
    size: WINDOW,
  },
  {
    id: 'utilisateurs',
    title: 'Utilisateurs et droits',
    description: 'Caissiers, gérants, permissions et sessions',
    icon: 'key',
    category: 'administration',
    phase: 1,
    requires: [],
    requirements: ['US-01', 'US-02', 'US-03', 'US-04', 'US-05'],
    scope: 'in',
    size: WINDOW,
  },
  {
    id: 'peripheriques',
    title: 'Périphériques',
    description: 'Imprimante, tiroir, balance, écran client',
    icon: 'printer',
    category: 'outils',
    phase: 1,
    requires: [],
    requirements: ['CA-03', 'CA-11', 'NF-08'],
    scope: 'in',
    size: WINDOW,
  },
  {
    id: 'synchronisation',
    title: 'Synchronisation',
    description: 'Ventes hors ligne et file d\'attente',
    icon: 'cloud',
    category: 'outils',
    phase: 1,
    requires: [],
    requirements: ['OF-01', 'OF-02', 'OF-03', 'OF-04', 'OF-05', 'OF-06'],
    scope: 'in',
    size: WINDOW,
  },
  {
    id: 'sauvegarde',
    title: 'Sauvegarde',
    description: 'Sauvegardes automatiques et restauration',
    icon: 'backup',
    category: 'outils',
    phase: 1,
    requires: [],
    requirements: ['NF-03', 'NF-04', 'NF-06'],
    scope: 'in',
    size: WINDOW,
  },
  {
    id: 'alertes',
    title: 'Alertes',
    description: 'Stock bas, paiements en attente, écarts',
    icon: 'bell',
    category: 'outils',
    phase: 1,
    requires: [],
    requirements: ['ST-06', 'MM-05', 'OF-04'],
    scope: 'in',
    size: WINDOW,
  },
  {
    id: 'parametres',
    title: 'Paramètres',
    description: 'Affichage, barre des tâches, modules',
    icon: 'settings',
    category: 'administration',
    phase: 1,
    requires: [],
    requirements: ['NF-05'],
    scope: 'in',
    core: true,
    size: { width: 820, height: 580 },
  },
];

export function getAppDefinition(appId: AppId): AppDefinition {
  const app = APPS.find((candidate) => candidate.id === appId);
  if (!app) {
    throw new Error(`Unknown app: ${appId}`);
  }
  return app;
}
