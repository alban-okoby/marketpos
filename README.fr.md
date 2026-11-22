[English](README.md) · **Français**

# MarketPOS

Logiciel de caisse (POS) et de gestion de magasin pour supermarchés et épiceries. Le premier marché visé est la Côte d'Ivoire, puis le reste de l'Afrique de l'Ouest francophone.

> **Statut : brouillon précoce (version 0.1).** Rien n'est encore validé avec un expert-comptable, la DGI ni un magasin. Les points ouverts sont marqués « à valider » dans les spécifications.

## Fonctionnalités

Le livrable actuel est un prototype statique, en un seul fichier, de l'écran de vente du caissier :

- Connexion du caissier par code PIN
- Catalogue de 200 articles de test (15 nommés, 185 générés)
- Panier et paiement en espèces avec calcul du rendu de monnaie
- Ticket imprimable, via la boîte d'impression du navigateur
- Écran client dans une fenêtre séparée, synchronisé en temps réel
- Numérotation continue des tickets
- Journal local des ventes

## Application

L'application est dans `app/` : une application web Angular et l'application fonctionne hors ligne une fois installée.

Prérequis : Node.js 24 (ou 22.22+). Ensuite :

```bash
cd app
npm install
npm run dev        # serveur de développement sur http://localhost:4250
npm test           # tests unitaires
npm run build      # build de production dans app/dist/app/browser
```

L'application n'est pas encore reliée au moteur de vente. Chaque fenêtre présente pour l'instant sa fonction et les exigences qu'elle couvre.

## Démarrage rapide (prototype)

Le prototype n'a aucune dépendance, aucune étape de compilation et aucun serveur.

1. Ouvrir `prototype/caisse/index.html` dans Chrome ou Edge.
2. Se connecter avec un PIN de test :

   | Rôle       | PIN  |
   |------------|------|
   | Caissier 1 | 1111 |
   | Caissier 2 | 2222 |
   | Gérant     | 9999 |

Pour ouvrir l'écran client, charger le même fichier avec le paramètre `?client=1` dans une seconde fenêtre.

Les données sont stockées dans le `localStorage` du navigateur. Pour réinitialiser le prototype, vider les données du site.

## Limites connues

- Pas encore de TVA ; le taux n'est pas précisé
- Pas de serveur ni de synchronisation entre postes
- Pas de mobile money
- Pas d'intégration FNE (facturation électronique)
- Pas d'intégration de balance
- Impression via la boîte d'impression du navigateur
- Le fonctionnement hors ligne n'a pas été testé en conditions réelles

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
| `docs/en/`, `docs/fr/` | Documentation, en anglais et en français (mêmes fichiers dans chaque dossier) |
| `docs/references/` | Images partagées utilisées par la documentation |
| `app/` | PWA Angular 22 : écran de verrouillage, bureau, fenêtres, barre des tâches, menu Démarrer |
| `prototype/caisse/index.html` | Prototype de l'écran de vente (CSS, JavaScript et balisage dans un seul fichier) |
| `prototype/marketpos_retail_software/` | Exports de maquettes : un dossier par écran, avec source HTML et capture |

## Crédits

Les icônes en couleur de l'application viennent de [Fluent Emoji](https://github.com/microsoft/fluentui-emoji), de Microsoft, sous licence MIT (voir `app/public/icons/fluent/LICENSE`).

## Feuille de route

L'ordre de construction, tiré de la section 17 du cahier des charges :

1. Connexion
2. Écran de vente
3. Test hors ligne
4. Mobile money
5. Clôtures de caisse X et Z
6. Gestion du stock et rapports

La synchronisation hors ligne est le principal risque technique ; elle est suivie par les exigences `OF-*`.

## Contribuer

Les retours sont bienvenus, surtout ceux d'experts-comptables connaissant la fiscalité ivoirienne, d'éditeurs de caisse et de gérants de magasin. Beaucoup d'exigences attendent encore une confirmation extérieure, donc l'expertise métier est la contribution la plus utile à ce stade.

Quand vous modifiez un document, mettez à jour sa version anglaise et sa version française dans la même modification.

## Licence

Pas encore définie.
