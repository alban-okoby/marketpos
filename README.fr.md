[English](README.md) · **Français**

# MarketPOS

Logiciel de caisse (POS) et de gestion pour supermarchés et épiceries.
## Ce que c'est

MarketPOS est une application web progressive (PWA) Angular qui se comporte comme un système d'exploitation de bureau : un écran de verrouillage avec connexion par identifiant et mot de passe, un bureau avec des fenêtres déplaçables, une barre des tâches et un menu Démarrer. Chaque fonction métier est un module, et seuls les modules dont un magasin a besoin sont activés.

<img width="1900" height="868" alt="A0621789-3E3F-4079-AC68-2438F7B66482" src="https://github.com/user-attachments/assets/a5421e24-b520-4675-809e-171d3f2e781f" />

<img width="1900" height="868" alt="61120C0A-F7E8-4E7E-991B-165D5102949B" src="https://github.com/user-attachments/assets/45bf97c5-14bb-4951-aefd-9d91ba7f0756" />


Déjà en place :

- **Écran de verrouillage et session** : identifiant, puis mot de passe ; blocage par compte après plusieurs essais ratés ; transition de déverrouillage.
- **Bureau** : fonds d'écran (fournis ou image personnelle), couleur d'accentuation, thème clair, sombre ou automatique, date et heure, barre des tâches sur n'importe quel bord, masquage automatique.
- **Paramètres** : affichage, barre des tâches, modules (on n'active que ce qu'on utilise, avec les dépendances), avec un champ de recherche.
- **Caisse** : recherche ou scan d'un article, 200 articles de test, panier, paiement en espèces avec rendu, ticket 80 mm, numérotation continue, mise à jour du stock, afficheur client dans sa propre fenêtre.
- **Hors ligne** : chaque vente a un identifiant unique et attend dans une file jusqu'à l'acquittement du serveur. La file est visible dans la fenêtre Synchronisation.
- **Clôtures de caisse** : rapport X (sans remise à zéro), clôture Z protégée par le code PIN du gérant, écart de caisse avec justification, rectifications au lieu de modifications, impression et export CSV.
- **Alertes** : stock négatif, échec de synchronisation, écart de caisse, chacune reste ouverte jusqu'à son acquittement.

Reste à construire : le mobile money, les remises, les ventes en attente, les retours, les écrans de stock et de rapports, un serveur de synchronisation. Le plan complet est dans le cahier des charges.

## Lancer l'application

Prérequis : **Node.js 24** (ou 22.22 et plus).

```bash
cd app
npm install
npm run dev        # serveur de développement sur http://localhost:4250, accessible sur le réseau local
```

| Commande | Ce qu'elle fait |
|----------|-----------------|
| `npm run dev` | Serveur de développement sur le port 4250, sur toutes les interfaces réseau |
| `npm start` | Serveur de développement sur le port par défaut 4200 |
| `npm test` | Tests unitaires (Vitest, via `ng test`) |
| `npm run build` | Build de production dans `app/dist/app/browser` |

Remarques :

- Le service worker (cache hors ligne et mises à jour automatiques) ne fonctionne que dans les **builds de production**. En développement, l'application charge toujours le dernier code.
- Comptes de test (identifiant et mot de passe, plus le PIN utilisé pour les clôtures du gérant) :
  - caissier1 / `caisse-1111`, PIN 1111
  - caissier2 / `caisse-2222`, PIN 2222
  - gerant / `gerant-9999`, PIN 9999

  Les mots de passe et les PIN sont stockés hachés. Les valeurs en clair n'existent que dans les comptes de démonstration (`app/src/app/core/session/demo-users.ts`) et doivent être retirées avant tout usage réel.
- Les réglages et les données sont stockés dans le `localStorage` du navigateur. Pour réinitialiser l'application, effacez les données du site.

## Limites connues

- Pas encore de TVA ; le taux n'est pas précisé (FC-01).
- Pas de serveur de synchronisation : les ventes hors ligne attendent dans la file, et une alerte le signale.
- Espèces uniquement : pas de mobile money, pas de paiement fractionné.
- Pas d'intégration FNE (facture électronique).
- Pas d'intégration de balance.
- L'impression passe par la boîte d'impression du navigateur.
- Le fonctionnement hors ligne n'a pas été testé sur de vrais réseaux.

## Documentation

Chaque document existe en anglais et en français :

| Document | Anglais | Français |
|----------|---------|----------|
| Cahier des charges (v0.1) | [docs/en/cahier-des-charges.md](docs/en/cahier-des-charges.md) | [docs/fr/cahier-des-charges.md](docs/fr/cahier-des-charges.md) |
| Veille sur Smartpos | [docs/en/smartpos-veille.md](docs/en/smartpos-veille.md) | [docs/fr/smartpos-veille.md](docs/fr/smartpos-veille.md) |
| Référence visuelle | [docs/en/reference-visuelle.md](docs/en/reference-visuelle.md) | [docs/fr/reference-visuelle.md](docs/fr/reference-visuelle.md) |
| Prompt de design, v1 | [docs/en/prompt-design-pos.md](docs/en/prompt-design-pos.md) | [docs/fr/prompt-design-pos.md](docs/fr/prompt-design-pos.md) |
| Prompt de design, v2 (actuel) | [docs/en/prompt-design-pos-v2.md](docs/en/prompt-design-pos-v2.md) | [docs/fr/prompt-design-pos-v2.md](docs/fr/prompt-design-pos-v2.md) |

Les prompts de design restent en français, car l'interface générée est en français.

## Structure du dépôt

| Chemin | Description |
|--------|-------------|
| `app/` | Application Angular 22 (PWA) |
| `app/src/app/core/` | Services : session, gestionnaire de fenêtres, modules, thème, barre des tâches, fond d'écran, alertes, horloge |
| `app/src/app/shell/` | Écran de verrouillage, bureau, fenêtres, barre des tâches, menu Démarrer |
| `app/src/app/apps/` | Modules : `caisse`, `cloture` (clôtures de caisse), `synchronisation`, `alertes`, `settings` (paramètres) |
| `app/public/` | Ressources statiques : fonds d'écran, icônes couleur (Fluent Emoji), manifeste et icônes PWA |
| `docs/en/`, `docs/fr/` | Documentation, en anglais et en français (mêmes fichiers dans chaque dossier) |
| `docs/references/` | Images partagées utilisées par la documentation |
| `prototype/caisse/index.html` | Prototype initial de l'écran de vente (un seul fichier) |
| `prototype/marketpos_retail_software/` | Exports de maquettes : un dossier par écran |

## Tests

Lancez `npm test` dans `app/` avant chaque modification. La suite couvre les règles de dépendances des modules, le gestionnaire de fenêtres, la session, le thème, la couleur d'accentuation, le fond d'écran, les réglages de la barre des tâches, la caisse (catalogue, panier, ventes, règles de paiement), la file hors ligne (acquittement, doublons, fonctionnement hors ligne) et les clôtures (justification, remise à zéro de la période, rectifications).

## Crédits

Les images 3D de l'application (icônes et photos d'articles par défaut) viennent de [Fluent Emoji](https://github.com/microsoft/fluentui-emoji), de Microsoft, packagées par [@lobehub/fluent-emoji-3d](https://www.npmjs.com/package/@lobehub/fluent-emoji-3d), toutes deux sous licence MIT (voir `app/public/icons/3d/LICENSE`).

## Feuille de route

Ordre de construction, tiré de la section 17 du cahier des charges :

1. Connexion : fait
2. Écran de vente : fait (espèces uniquement)
3. Fonctionnement hors ligne : les ventes sont mises en file avec des identifiants uniques ; le serveur reste à construire
4. Mobile money : en attente du choix de l'agrégateur de paiement (MM-01)
5. Clôtures X et Z : faites ; le seuil d'écart de caisse reste à définir (CL-03)
6. Stock, puis rapports : à faire

La synchronisation hors ligne est le principal risque technique ; elle est suivie par les exigences `OF-*`.

## Contribuer

Les retours sont bienvenus, surtout ceux d'experts-comptables connaissant la fiscalité ivoirienne, d'éditeurs de caisse et de gérants de magasin. Beaucoup d'exigences attendent encore une confirmation extérieure, donc l'expertise métier est la contribution la plus utile à ce stade.

Avant de proposer une modification, lancez `npm test` et `npm run build` dans `app/`. Quand vous modifiez un document, mettez à jour sa version anglaise et sa version française dans la même modification.

## Licence

Pas encore définie.
