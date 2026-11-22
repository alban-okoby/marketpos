import { IconName } from '../../shared/icon/icon.component';

export type AppId = 'caisse' | 'cloture' | 'stock' | 'rapports' | 'clients' | 'parametres';

export interface AppDefinition {
  readonly id: AppId;
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
  /** Phase in the specification: 1 = MVP, 2 = later. */
  readonly phase: 1 | 2;
  /** Requirement IDs from docs/en/cahier-des-charges.md covered by this app. */
  readonly requirements: readonly string[];
  /** Default window size in pixels. */
  readonly size: { readonly width: number; readonly height: number };
}

export const APPS: readonly AppDefinition[] = [
  {
    id: 'caisse',
    title: 'Caisse',
    description: 'Encaissement, panier et paiement',
    icon: 'register',
    phase: 1,
    requirements: ['CA-01', 'CA-02', 'CA-05', 'CA-06', 'CA-11'],
    size: { width: 1100, height: 680 },
  },
  {
    id: 'cloture',
    title: 'Clôture de caisse',
    description: 'Rapports X et Z, écarts de caisse',
    icon: 'receipt',
    phase: 1,
    requirements: ['CL-01', 'CL-02', 'CL-03', 'CL-04', 'CL-05'],
    size: { width: 820, height: 600 },
  },
  {
    id: 'stock',
    title: 'Stock',
    description: 'Articles, entrées et sorties, inventaire',
    icon: 'box',
    phase: 1,
    requirements: ['ST-01', 'ST-02', 'ST-03', 'ST-05'],
    size: { width: 960, height: 620 },
  },
  {
    id: 'rapports',
    title: 'Rapports',
    description: 'Ventes, meilleurs articles, valeur du stock',
    icon: 'chart',
    phase: 1,
    requirements: ['RP-01', 'RP-03', 'RP-04', 'RP-05'],
    size: { width: 960, height: 620 },
  },
  {
    id: 'clients',
    title: 'Clients',
    description: 'Fiches clients, fidélité et crédit',
    icon: 'users',
    phase: 2,
    requirements: ['CF-01', 'CF-02', 'CF-04'],
    size: { width: 880, height: 600 },
  },
  {
    id: 'parametres',
    title: 'Paramètres',
    description: 'Utilisateurs, droits, TVA et caisses',
    icon: 'settings',
    phase: 1,
    requirements: ['US-02', 'FC-01', 'NF-05'],
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
