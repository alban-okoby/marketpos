# Veille : Smartpos (caisse maison de Carrefour)

[English](../en/smartpos-veille.md) · **Français**

Dernière mise à jour : 2026-11-17. Sources principalement de 2021-2022 : le déploiement actuel n'est pas confirmé.

## 1. Ce qu'on sait (sourcé)

| Élément | Détail | Source |
|---|---|---|
| Nature | Système de caisse développé en interne par Carrefour, nommé « Smartpos » ou « Smart PoS » | [lineaires.com](https://www.lineaires.com/la-distribution/smartpos-le-nouveau-systeme-de-caisses-de-carrefour), [Twitter Carrefour News](https://twitter.com/news_carrefour/status/1387416219003801605) |
| Périmètre visé | 67 000 points de vente dans le monde, à terme | Lineaires, photo du salon |
| Mode de développement | Interne, sur la base du système d'encaissement existant. « Inner sourcing » mobilisant des développeurs de plusieurs pays. | Lineaires |
| Open source | Affirmé par une source (« développée en Open Source »), non mentionné par Lineaires | à confirmer |
| Matériel | « Light hardware » de la taille d'une box internet (mini-PC). Une partie du système tourne dans le cloud. | Lineaires |
| Affichage client | Écran client qui montre chaque article scanné et indique en temps réel si la promotion est appliquée | Lineaires, Horizons |
| Promotions | Application des promotions en magasin et fidélité en temps réel | Horizons (non accessible au moment de la recherche) |
| Produits inconnus | Si un code-barres n'est pas reconnu, interrogation de la base du groupe (Data Lake) pour retrouver le produit et son prix | Lineaires |
| Client sans carte | Identification possible du client sans carte de fidélité, avec affichage des points | Horizons (via recherche) |
| Ticket dématérialisé | Ticket électronique à la demande (e-ticket) | Twitter Carrefour News |
| Fidélité et consentement | Parcours d'inscription au programme fidélité, collecte du consentement pour les données, alimentation de Carrefour Links | Lineaires |
| Données | Relié au Data Lake du groupe (près de 8 milliards de données) | Lineaires |
| Déploiement | Premier test prévu en France en 2022, dans quelques magasins pilotes. Une version préliminaire tourne en Espagne (source secondaire). | Lineaires, sources secondaires |
| Omnicanal | Présenté comme un outil qui relie le parcours en magasin au e-commerce (commandes en ligne réglées en caisse). | Sources secondaires |

## 2. Ce qu'on ne sait pas

- Le déploiement réel : combien de caisses sont équipées aujourd'hui, et dans quels pays.
- La liste exacte des fonctions (remises, retours, annulations, clôtures, balance, espèces, carte).
- Les modes de paiement pris en charge, et l'intégration des terminaux.
- La stack technique (langage, base de données, mode hors ligne).
- Le comportement en cas de coupure réseau.
- La conformité fiscale : Smartpos est conçu pour la France et l'Espagne, pas pour la fiscalité ivoirienne (FNE, SYSCOHADA).
- Le coût, et si Carrefour compte le commercialiser à d'autres enseignes.

## 3. Ce que montre la photo du salon (Lineaires, 2021)

- Un écran tactile caissier avec un pavé numérique, une liste d'articles, un bouton « Catalogue », et un total en bas.
- Un écran client, plus petit, qui affiche « 0,00 € » et une image de promotion.
- Un lecteur de codes-barres.
- Un mini-PC noir posé sous l'écran, sans boîtier de caisse traditionnel.
- Un panier garni devant le matériel, pour montrer le parcours client.
- Le bandeau indique « In-house omnichannel check-out system prototype · 67,000 points of sale worldwide ».

Ce prototype montre une architecture légère : un poste central, un écran caissier, un écran client, un scanner. Pas de tiroir visible sur la photo.

## 4. Ce qu'on peut en tirer pour MarketPOS

1. **Écran client** : afficher chaque article et le prix, et les promotions appliquées avant paiement. Un bon argument commercial pour une épicerie.
2. **Architecture légère** : un mini-PC par caisse, écrans et scanner en périphériques. Réduit le coût matériel.
3. **Référentiel produits central** : une base partagée qui répond aux codes inconnus. Pour une épicerie, cela peut être le catalogue de l'éditeur ou du grossiste.
4. **Fidélité intégrée au parcours de caisse**, avec consentement client enregistré. Adapter aux exigences de protection des données en Côte d'Ivoire (à valider).
5. **Ticket électronique** : utile pour réduire le papier, mais en Côte d'Ivoire le ticket papier et la facture FNE restent à confirmer.
6. **Omnicanal** : pour une épicerie, le plus accessible est la commande par téléphone ou WhatsApp réglée en caisse. Le reste (click & collect, e-commerce) plus tard.

## 5. Ce qu'il ne faut pas copier

- Le modèle « Data Lake du groupe » : une épicerie n'a pas ce volume ni cette infrastructure.
- Le cloud obligatoire : la caisse doit fonctionner hors ligne, et Smartpos ne documente pas ce point.
- Les technologies de scan & go par smartphone et les caisses sans caissier : elles demandent un investissement et une adoption que le marché ivoirien n'a pas encore.

## 6. Questions ouvertes à creuser

1. Smartpos est-il déjà déployé hors de France et d'Espagne (Afrique, Moyen-Orient) ? Carrefour est présent en Afrique via des franchises ou partenaires.
2. Quelle est la stack technique ? Les sources mentionnent du « open source » sans précision.
3. Comment fonctionne le mode hors ligne ?
4. Quelle intégration avec un terminal de paiement mobile money ?

Ces questions ne peuvent pas être résolues avec des sources publiques. Elles relèvent d'une demande directe à Carrefour, ou d'un entretien avec un ancien intégrateur du projet.
