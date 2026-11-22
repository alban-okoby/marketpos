# Prompt de design : MarketPOS (caisse épicerie / supermarché)

[English](../en/prompt-design-pos.md) · **Français**

Version 1, 2026-11-21. À coller dans l'outil de design IA (Figma AI, Galileo, Uizard, v0, Lovable, ou équivalent). Le prompt est en français, avec les textes d'interface en français.

---

## PROMPT (à copier)

Tu es un designer produit senior spécialisé dans les logiciels de caisse (POS) pour le commerce de détail en Afrique de l'Ouest. Conçois une maquette complète, cliquable et cohérente pour **MarketPOS**, un logiciel de caisse pour épiceries et supermarchés en Côte d'Ivoire.

### 1. Contexte et utilisateurs

- **Caissier** : utilise la caisse 8 heures par jour, debout, sous pression quand la file grandit. Peu de temps pour lire. Doit encaisser sans réfléchir. Niveau d'aisance numérique variable.
- **Gérant** : valide les clôtures, autorise les actions sensibles, consulte les ventes du jour. Travaille parfois depuis un bureau, parfois au poste de caisse.
- Le réseau est instable. Le logiciel doit toujours fonctionner, et l'interface doit indiquer clairement si des ventes attendent une synchronisation.
- Environnement : lumière forte possible, écrans tactiles 10 à 15 pouces, parfois un poste de bureau.
- Monnaie : FCFA, sans décimales. Langue : français, ton simple et direct, phrases courtes, verbes à l'impératif pour les actions.

### 2. Surfaces à concevoir

Trois surfaces, chacune en thème clair et sombre :

**A. Poste caissier (priorité absolue)**, tablette 1280 × 800 et écran 1920 × 1080 :
- Barre de recherche avec focus automatique, qui accepte un code-barres scanné (Entrée automatique).
- Grille de produits à droite ou à gauche, avec photo optionnelle, nom, prix, catégorie. Cliquable au doigt.
- Panneau panier : lignes avec quantité (boutons − et +), montant par ligne, total en très grand, remise, bouton d'encaissement très visible.
- Raccourcis clavier affichés discrètement : F9 encaisser, Échap annuler.
- Indicateur de connexion et de synchronisation en permanence (en ligne, hors ligne, X ventes en attente).

**B. Modale d'encaissement** :
- Total à payer, montant reçu avec pavé numérique, raccourcis de billets (500, 1 000, 2 000, 5 000, 10 000, 20 000 F), « Montant exact ».
- Rendu de monnaie affiché en grand. Message d'erreur clair si le montant reçu est insuffisant.
- Choix du mode de paiement : espèces, mobile money (Orange Money, MTN MoMo, Moov Money, Wave), carte. Un seul mode visible à la fois, les autres en onglets.
- État « en attente de confirmation » pour le mobile money, avec action pour relancer ou annuler.

**C. Écran client** (second écran, orienté vers le client, sans contrôle) :
- Liste des articles scannés, prix, promotions visibles avant paiement.
- Total très grand. Message d'accueil ou de remerciement.
- Très lisible à 1 mètre, contraste élevé, aucun bouton.

**D. Espace gérant** (version bureau ou tablette) :
- Tableau de bord du jour : chiffre d'affaires, nombre de tickets, panier moyen, ventes par mode de paiement, ventes par caissier.
- Clôture de caisse : état X (intermédiaire) et état Z (journalière), comptage des espèces par coupure, calcul de l'écart, justification obligatoire au-delà d'un seuil.
- Liste des alertes : stock bas, transaction mobile money en attente, écart de caisse, ventes hors ligne non synchronisées.
- Gestion des caissiers et des droits (remise, annulation, retour, ouverture de caisse).

**E. Connexion** : écran simple, saisie d'un identifiant puis d'un code PIN à 4 chiffres, avec pavé numérique géant. Pas de mot de passe long au poste de caisse.

**F. Ticket imprimé** : format thermique 80 mm, noir et blanc, en-tête de la boutique, lignes, total, mode de paiement, rendu, numéro de ticket, date, caissier, pied de page. Sans images.

### 3. Parcours à rendre cliquables

1. Connexion caissier → poste de vente.
2. Scanner un article inconnu → proposition de créer la fiche.
3. Ajouter 3 articles, changer une quantité, retirer un article.
4. Encaisser en espèces avec montant insuffisant (erreur), puis montant correct → ticket imprimé → retour à une vente vide.
5. Encaisser en mobile money → état d'attente → confirmation.
6. Passer hors ligne → bandeau d'alerte → vente enregistrée localement → compteur de synchronisation.
7. Gérant : tableau de bord → clôture Z → écart de caisse → justification → validation.

### 4. Contraintes de design

- **Cibles tactiles** : 44 px minimum, idéalement 56 px pour les actions principales. Espacement suffisant pour éviter les erreurs de frappe.
- **Hiérarchie** : une seule action principale par écran. L'encaissement est toujours l'action la plus visible du poste caissier.
- **Contraste** : texte au minimum WCAG AA (4,5:1). Ne jamais transmettre une information uniquement par la couleur : ajouter une icône ou un libellé (par exemple, hors ligne = icône + texte).
- **Chiffres** : alignés à droite, séparateur de milliers espace, pas de décimales en FCFA. Exemple : 12 500 F.
- **États** : vide, chargement, erreur, succès, hors ligne. Chaque écran doit montrer ces états.
- **Densité** : le poste caissier doit afficher au moins 20 produits sans défilement sur une tablette 1280 × 800.
- **Pas de surcharge** : pas d'animation qui retarde la saisie. Transitions de 150 ms maximum.
- **Pas de marque tierce** : aucun logo ou style d'enseigne existante (Carrefour, Prosuma, King Cash, Shopify, Square…). Le nom MarketPOS et une identité neutre.

### 5. Système de design à produire

- **Tokens** : couleurs (fond, carte, texte, texte discret, accent, succès, avertissement, danger, bordure), en clair et en sombre. Accent proposé : vert sarcelle (#0F766E), à valider.
- **Typographie** : une famille lisible à l'écran (système ou Inter), trois tailles pour les titres, une taille courante de 16 px minimum, une taille d'affichage pour les totaux (40 px et plus).
- **Espacement** : échelle de 4 px.
- **Composants** : bouton (primaire, secondaire, danger, désactivé), champ de saisie, champ montant, pavé numérique, carte produit, ligne de panier, badge de statut, bandeau d'alerte, modale, onglet, tableau, indicateur de synchronisation, stepper de quantité.
- **Icônes** : trait simple, 24 px, cohérentes. Pas d'icônes ambiguës pour les actions critiques.

### 6. Livrables attendus

1. Un fichier avec les cinq surfaces, en clair et en sombre, en formats tablette et bureau.
2. Un prototype cliquable des parcours de la section 3.
3. Une page de composants avec tous les états.
4. Une page de tokens (couleurs, typographie, espacements).
5. Une annexe de spécifications pour les développeurs : dimensions, marges, états, comportement au clavier et au scanner.
6. Une liste des textes de l'interface, en français, pour relecture.

### 7. Ce qu'il ne faut pas faire

- Ne pas copier un design existant identifiable.
- Ne pas ajouter de fonctions absentes de la liste (pas de paie, pas de comptabilité, pas d'e-commerce).
- Ne pas utiliser de menus déroulants pour les actions fréquentes du caissier.
- Ne pas afficher de données fictives qui ressemblent à de vraies informations personnelles.

Commence par le poste caissier, valide-le, puis produis les autres surfaces dans l'ordre : modale d'encaissement, écran client, connexion, gérant, ticket.

---

## Notes pour l'utilisateur (ne pas coller)

### Où trouver des références en ligne

**Figma Community** (figma.com/community) : chercher « POS », « point of sale », « retail », « grocery » ; filtrer par gratuit. Les résultats trouvés lors de la veille sont surtout restaurant :
- Mpos (Gumroad, pay-what-you-want) : kit POS orienté restauration.
- Superstore Figma UI Kit (Contra, gratuit) : kit e-commerce avec parcours de paiement, pas de caisse.
- Imapos (Gumroad, environ 41 $) et Kopag (Gumroad, à partir de 150 $) : kits POS généraux, payants.
- Groccer Store (TemplateMonster) : kit d'application d'épicerie, prix à vérifier.

**Dribbble** (collections à parcourir pour l'inspiration, pas à copier) :
- dribbble.com/by_you/collections/6276885-POS-Point-of-Sale
- dribbble.com/JohnMugi/collections/6055699-POS-UI-UX-Inspiration
- dribbble.com/locksley/collections/6348654-POS-system
- dribbble.com/danielblom/collections/5680675-POS
- Chercher les tags « grocery pos », « supermarket », « cashier dashboard », « self checkout ».
- Exemples repérés : « Pos Concept For Grocery Store », « PosFood - Admin Cashier Dashboard », « Retail POS on Square Register ». Vérifier la licence de chaque œuvre avant réutilisation.

**Documentation d'éditeurs** (références de patterns, pas de copie visuelle) :
- Shopify POS UI : shopify.dev/docs/api/pos-ui-extensions (composants et règles d'ergonomie en caisse).
- Shopify, blog « pos-ui » : principes d'ergonomie pour le personnel de caisse.

**Mobbin** (mobbin.com) : bibliothèque de parcours réels, surtout mobile et en ligne. Utile pour le paiement mobile et les états d'attente, peu pour la caisse physique. Accès limité en gratuit.

**Logiciels de référence à regarder en démo** : EBP Point de Vente (ebp.ci), Sage 100 Caisse via un revendeur, Odoo POS (démo publique sur odoo.com). Regarder les écrans caissier et gérant, sans reprendre leur identité visuelle.

### Conseils d'usage

- Garder le prompt et les références dans ce dépôt, pour pouvoir le réutiliser à chaque version.
- Vérifier chaque maquette produite contre le cahier des charges (`cahier-des-charges.md`), surtout les identifiants CA, US, CL et MM.
- Les maquettes sont des hypothèses : les valider avec de vrais caissiers en magasin avant de développer.
