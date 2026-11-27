# Cahier des charges : MarketPOS (version 0.1)

[English](../en/cahier-des-charges.md) · **Français**

Statut : brouillon. Référence : éditeurs établis (EBP Point de Vente CI, Sage 100 Gestion commerciale via AB Soft Work, Odoo POS via partenaires locaux) et veille sur Smartpos (voir `smartpos-veille.md`).

Les exigences sont classées par priorité : **P1** = MVP, **P2** = phase 2, **P3** = plus tard. Les mentions « à valider » demandent une confirmation avant développement.

## 1. Objet

MarketPOS est un logiciel de caisse et de gestion pour épiceries et supermarchés : vente, stock, clôture de caisse, paiement mobile money, et conformité fiscale locale.

## 2. Périmètre

- **Dans le périmètre (MVP)** : caisse, caissiers et droits, clôture, stock, paiement mobile money, rapports de base.
- **Phase 2** : clients et crédit, fidélité, achats fournisseurs, comptabilité SYSCOHADA, facturation FNE complète.
- **Hors périmètre** : e-commerce, paie, multi-pays, caisse en libre-service.

## 3. Acteurs

| Acteur | Rôle |
|---|---|
| Caissier | Encaisse, applique des remises dans sa limite, clôture sa session |
| Gérant | Autorise les actions sensibles, valide les clôtures, consulte les rapports |
| Administrateur | Configure les produits, les taux de TVA, les utilisateurs et les caisses |
| Comptable | Consulte les exports et les journaux |

## 4. Caisse (CA)

| ID | Exigence | Priorité | Inspiration |
|---|---|---|---|
| CA-01 | Encaissement sur écran tactile, recherche par nom, code interne ou code-barres | P1 | EBP, Smartpos |
| CA-02 | Affichage sur écran client : chaque article, son prix, le total, et les promotions appliquées avant paiement | P1 | Smartpos |
| CA-03 | Ventes au poids avec balance connectée, ou saisie manuelle tracée si la balance est en panne | P1 | Lotus Pecas |
| CA-04 | Code-barres inconnu : recherche dans le catalogue local, puis proposition de création de fiche | P1 | Smartpos (recherche de produit inconnu) |
| CA-05 | Paiement mixte : espèces, carte, mobile money, plusieurs modes sur un même ticket | P1 | Métier |
| CA-06 | Calcul du rendu de monnaie, refus d'un paiement insuffisant | P1 | Sage |
| CA-07 | Remise par ligne ou sur le ticket, dans la limite du droit du caissier | P1 | EBP |
| CA-08 | Mise en attente et rappel de ticket | P1 | EBP PRO |
| CA-09 | Retour et avoir, toujours rattaché à un ticket d'origine | P1 | Métier |
| CA-10 | Annulation de ligne ou de ticket avec droit et trace | P1 | Métier |
| CA-11 | Impression ticket thermique 80 mm, réimpression, ouverture du tiroir | P1 | Sage |
| CA-12 | Ticket électronique (e-ticket) envoyé au client par SMS ou WhatsApp, en option | P2 | Smartpos |
| CA-13 | Numérotation continue des tickets, sans trou, par caisse et par site | P1 | Métier (à valider avec FC-02) |
| CA-14 | Identification du client par téléphone, avec affichage du solde de fidélité | P2 | Smartpos |

## 5. Caissiers et droits (US)

| ID | Exigence | Priorité |
|---|---|---|
| US-01 | Connexion individuelle : identifiant et mot de passe haché, avec un code PIN haché conservé pour les autorisations du gérant. La longueur minimale du mot de passe est un réglage. | P1 |
| US-02 | Droits par action : vente, remise, retour, annulation, ouverture, clôture | P1 |
| US-03 | Autorisation ponctuelle par PIN du gérant, avec trace | P1 |
| US-04 | Session expirée après inactivité | P1 |
| US-05 | Fond de caisse à l'ouverture de session, comptage à la fermeture | P1 |

## 6. Clôture (CL)

| ID | Exigence | Priorité |
|---|---|---|
| CL-01 | État X : clôture intermédiaire, compteurs non remis à zéro | P1 |
| CL-02 | État Z : clôture journalière, compteurs remis à zéro, figée après validation | P1 |
| CL-03 | Écart entre théorique et compté, justification obligatoire au-delà d'un seuil (à définir) | P1 |
| CL-04 | Une clôture Z validée ne peut pas être modifiée. Correction par écriture de rectification uniquement. | P1 |
| CL-05 | Rapport de clôture imprimable et exportable | P1 |

## 7. Stock (ST)

| ID | Exigence | Priorité |
|---|---|---|
| ST-01 | Fiche article : nom, code interne, codes-barres multiples, catégorie, fournisseur, prix d'achat, prix de vente, TVA, unité, seuil d'alerte | P1 |
| ST-02 | Décrément automatique à chaque vente | P1 |
| ST-03 | Sorties manuelles (casse, péremption) avec motif | P1 |
| ST-04 | Entrées liées à un bon de réception | P2 |
| ST-05 | Inventaire physique par emplacement, calcul des écarts, validation par le gérant | P1 |
| ST-06 | Alertes : seuil atteint, date de péremption proche (si renseignée) | P1 |
| ST-07 | Valorisation du stock au coût moyen pondéré (à valider) | P2 |
| ST-08 | Multi-entrepôts et transferts | P3 |

## 8. Mobile money (MM)

| ID | Exigence | Priorité |
|---|---|---|
| MM-01 | Un agrégateur unique : Orange Money, MTN MoMo, Moov Money, Wave (choix à faire : CinetPay, PayDunya, KkiaPay) | P1 |
| MM-02 | Paiement « en attente » tant que la confirmation (webhook signé) n'est pas reçue | P1 |
| MM-03 | Rapprochement quotidien : montant encaissé face aux transactions confirmées | P1 |
| MM-04 | Une même référence de transaction ne peut être encaissée qu'une fois | P1 |
| MM-05 | Alerte au gérant si une transaction reste en attente au-delà d'un délai (à définir) | P1 |

## 9. Hors ligne et synchronisation (OF)

| ID | Exigence | Priorité |
|---|---|---|
| OF-01 | La caisse continue de vendre sans réseau, avec impression immédiate du ticket | P1 |
| OF-02 | Les ventes hors ligne sont stockées localement, puis synchronisées au retour du réseau | P1 |
| OF-03 | Chaque opération a un identifiant unique, pour éviter les doublons à la synchronisation | P1 |
| OF-04 | File d'attente visible par le gérant (nombre d'opérations en attente) | P1 |
| OF-05 | Conflit de stock : la vente est acceptée, le stock devient négatif, et une alerte est créée | P1 |
| OF-06 | Aucune vente validée n'est jamais supprimée par la synchronisation | P1 |

Critère de réussite : 2 heures de coupure réseau et 50 ventes, puis toutes les ventes présentes après retour, sans doublon.

## 10. Conformité fiscale (FC)

| ID | Exigence | Priorité | Statut |
|---|---|---|---|
| FC-01 | Taux de TVA par article. Taux normal ivoirien à confirmer. | P1 | À valider (expert-comptable) |
| FC-02 | Facturation électronique normalisée (FNE) : transmission à la DGI de chaque facture concernée, gestion des erreurs, mode de reprise | P1 | À valider (DGI) |
| FC-03 | Plan comptable SYSCOHADA, export des écritures de vente, d'achat et de trésorerie | P2 | À valider |
| FC-04 | Journal des ventes par taux de TVA | P1 | À valider |
| FC-05 | Archivage des tickets et factures pendant la durée légale | P1 | À valider |

## 11. Rapports (RP)

| ID | Exigence | Priorité |
|---|---|---|
| RP-01 | Ventes du jour, de la semaine, du mois, par caisse, caissier et mode de paiement | P1 |
| RP-02 | Marge par article et par catégorie | P2 |
| RP-03 | Articles les plus et les moins vendus | P1 |
| RP-04 | Stock critique, ruptures, valeur du stock | P1 |
| RP-05 | Export Excel et PDF | P1 |

## 12. Clients et fidélité (CF), phase 2

| ID | Exigence | Priorité |
|---|---|---|
| CF-01 | Fiche client : nom, téléphone, carte de fidélité facultative | P2 |
| CF-02 | Points de fidélité et promotions par article, montant ou période | P2 |
| CF-03 | Consentement client enregistré pour l'usage des données (à valider avec la législation ivoirienne) | P2 |
| CF-04 | Vente à crédit (ardoise) avec plafond par client et suivi des règlements | P2 |

## 13. Achats (AC), phase 2

| ID | Exigence | Priorité |
|---|---|---|
| AC-01 | Bon de commande fournisseur, réception partielle ou totale | P2 |
| AC-02 | Écart entre commande et réception, signalé | P2 |
| AC-03 | Historique des prix d'achat par fournisseur | P2 |

## 14. Exigences non fonctionnelles (NF)

| ID | Exigence | Priorité |
|---|---|---|
| NF-01 | Encaissement d'un article en moins de 300 ms, avec 20 000 articles au catalogue | P1 |
| NF-02 | Fonctionnement pendant une coupure de courant (onduleur) et sauvegarde locale | P1 |
| NF-03 | Sauvegarde automatique quotidienne, test de restauration mensuel | P1 |
| NF-04 | Journal des actions sensibles : remise, annulation, retour, clôture, modification de prix | P1 |
| NF-05 | Interface en français, montants en FCFA sans décimales | P1 |
| NF-06 | Mise à jour sans perte de données, retour arrière possible | P1 |
| NF-07 | Protection des données personnelles conforme à la législation ivoirienne (ARTCI, à valider) | P1 |
| NF-08 | Matériel de référence : mini-PC ou tablette, écran client, scanner, imprimante 80 mm, tiroir | P1 |

## 15. Matériel de référence

- Poste caisse : mini-PC (type box) ou tablette tactile, avec écran caissier.
- Écran client secondaire.
- Lecteur de codes-barres.
- Imprimante thermique 80 mm avec tiroir-caisse.
- Balance connectée (P1 optionnel).
- Onduleur.

## 16. Critères d'acceptation

| Scénario | Résultat attendu |
|---|---|
| Vente de 10 articles, paiement mixte espèces et mobile money | Ticket imprimé, stock décrémenté, deux modes enregistrés, écran client à jour |
| Code-barres inconnu | Proposition de création de fiche, aucun blocage de la caisse |
| Coupure réseau de 2 h, 50 ventes | Toutes les ventes après retour, aucun doublon |
| Remise supérieure au droit | Refus, puis acceptation après PIN gérant, avec trace |
| Clôture Z avec écart de 5 000 FCFA | Justification obligatoire, écart visible dans le rapport |
| Modification d'une clôture Z validée | Refus, correction par écriture de rectification uniquement |
| Mobile money en attente sans webhook | Ticket non validé, alerte au gérant |

## 17. Ordre de construction

1. **Connexion caissier** (US-01, US-04).
2. **Écran de vente** (CA-01, CA-02, CA-05, CA-06, CA-11) : prototype livré dans `prototype/caisse/`.
3. **Test hors ligne sur l'écran de vente** (OF-01, OF-02, OF-03). Risque principal, à valider avant d'ajouter le reste.
4. **Mobile money** (MM-01 à MM-04).
5. **Clôture X et Z** (CL-01 à CL-04).
6. **Stock** (ST-02 à ST-05), puis **rapports** (RP-01, RP-03, RP-04).

Le prototype ne couvre que l'étape 2, en espèces, sans TVA, sans serveur et sans FNE.

## 18. Points à valider avant développement

1. FNE : modalités, format, transmission, mode de reprise (DGI).
2. TVA : taux applicables aux produits alimentaires, exonérations.
3. Seuil d'écart de caisse toléré.
4. Valorisation du stock.
5. Législation ivoirienne sur la protection des données et le consentement.
6. Choix de l'agrégateur mobile money, frais et délais de confirmation.
7. Réponses des éditeurs (EBP CI, AB Soft Work, Veone) aux questions à leur poser : versions FNE, mobile money, prix, références clients en épicerie ou supermarché.
8. Smartpos : déploiement hors France et Espagne, stack technique et mode hors ligne (voir `smartpos-veille.md`). Aucune information publique suffisante, à demander directement.
