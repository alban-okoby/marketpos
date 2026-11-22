# Prompt de design : MarketPOS, version 2 (avec référence visuelle)

[English](../en/prompt-design-pos-v2.md) · **Français**

Version 2, 2026-11-21. Remplace la v1 pour le poste caissier. Joindre l'image `../references/reference-caisse-grostore.jpg` à la demande. Analyse détaillée : `reference-visuelle.md`.

---

## PROMPT (à copier)

Conçois l'écran de caisse de **MarketPOS**, un logiciel de caisse pour épiceries et supermarchés en Côte d'Ivoire. Reprends la mise en page et le style de l'image jointe (écran de caisse d'épicerie en ligne), mais applique les changements ci-dessous. Ne reprends ni le nom, ni le logo, ni les images, ni les textes de cette image.

### Mise en page (obligatoire)

Écran unique, en 3 zones :

1. **En-tête** (hauteur environ 64 px) :
   - À gauche : logo « MarketPOS » (texte simple, pas d'image).
   - Au centre : grande barre de recherche, placeholder « Chercher un article ou scanner un code (Ctrl+K) ».
   - À droite : indicateur de connexion (point vert « En ligne » ou orange « Hors ligne · 3 ventes en attente »), bouton thème clair/sombre, avatar du caissier avec son nom.

2. **Zone gauche** (environ 65 % de la largeur) :
   - Bandeau de catégories : une rangée horizontale de cartes. Chaque carte contient une icône dans un cercle pastel, le nom du rayon et le nombre d'articles. Carte active en vert plein. Premier élément : « Tous ».
   - Titre de section « Articles » à gauche, champ de recherche locale et bouton vert « Chercher » à droite.
   - Grille de cartes produit : 4 colonnes sur tablette 1280 px, 5 colonnes sur écran 1920 px. Chaque carte : image ou pastille avec initiale (les photos seront ajoutées plus tard), nom sur 2 lignes maximum, prix en orange en gras, catégorie en gris. Carte blanche, coins arrondis 10 px, ombre légère. Toute la carte est cliquable.

3. **Zone droite** (environ 35 % de la largeur, fond blanc, bordure gauche) : titre « Ticket en cours », puis :
   - Ligne de saisie « Code article » avec bouton vert « Ajouter » et bouton orange « Vider ».
   - Liste des lignes du panier : vignette, nom, stepper − quantité + (boutons 44 px minimum), montant de la ligne à droite, bouton supprimer rouge.
   - Bloc des totaux : Sous-total, Remise (modifiable au clic), **TVA** (affichée seulement si le taux est configuré), puis **TOTAL** en très grand (40 px et plus).
   - Pied de zone : bouton orange « Annuler la vente » et bouton vert « Encaisser (F9) », pleine largeur chacun. « Encaisser » est l'action la plus visible de l'écran.

### Couleurs et style

- Fond général gris très clair ; cartes et zone droite en blanc.
- Vert principal (#4CAF50 environ) : catégorie active, « Ajouter », « Chercher », « Encaisser ».
- Orange (#F5821F environ) : prix, « Vider », « Annuler la vente ».
- Rouge : uniquement la suppression d'une ligne.
- Texte noir charbon, libellés en gris. Chiffres alignés à droite, sans décimales, séparateur de milliers espace, suffixe F. Exemple : 12 500 F.
- Thème sombre complet, même hiérarchie.
- Icônes en trait fin, 24 px.

### Contraintes

- Cibles tactiles 44 px minimum, 56 px pour « Encaisser ».
- Contraste WCAG AA. Aucune information par la couleur seule : toujours un libellé ou une icône en plus.
- Une seule action principale visible à la fois.
- Aucune animation qui retarde la saisie. Transitions 150 ms maximum.
- États à montrer : panier vide (message et invitation à scanner), article inconnu (proposition de création), hors ligne (bandeau d'alerte), encaissement en cours.
- Le caissier doit voir au moins 20 produits sans défilement sur 1280 × 800.

### Livrables

1. L'écran caisse en clair et en sombre, formats 1280 × 800 et 1920 × 1080.
2. La modale d'encaissement en espèces : montant reçu, raccourcis de billets, rendu en grand, erreur si insuffisant.
3. La même modale en mobile money avec état « en attente de confirmation ».
4. Une page de composants : carte catégorie, carte produit, ligne de panier, stepper, bouton principal et secondaire, badge de statut, bandeau d'alerte.
5. Une page de tokens : couleurs, typographie, espacements.

Commence par l'écran caisse en clair. Valide la mise en page avant de produire les autres écrans.

---

## Notes (ne pas coller)

- Dans l'outil, joindre l'image de référence et écrire « reprendre la mise en page de l'image jointe ». Sans image, l'outil produit un résultat générique, comme avec la v1.
- Si le résultat reste générique, demander une correction ciblée par zone (« la zone droite : déplacer le total en bas, agrandir le bouton Encaisser »), plutôt qu'une nouvelle génération complète.
