# Référence visuelle : écran de caisse (style cible)

[English](../en/reference-visuelle.md) · **Français**

Image de référence : `../references/reference-caisse-grostore.jpg`. C'est une maquette de kit d'épicerie en ligne, avec un nom de marque et des données factices (« Popped Rice Special Chocolate », prix répétés). **On reprend la mise en page et le style, pas la marque, les images ni les textes.** Le nom reste MarketPOS.

## 1. Structure de l'écran (de haut en bas, de gauche à droite)

| Zone | Contenu | Remarque pour MarketPOS |
|---|---|---|
| En-tête | Logo à gauche, grande barre de recherche au centre (raccourci Ctrl+K), icônes à droite (grille, thème clair/sombre, notifications, avatar) | Garder la barre de recherche centrale. Icônes : thème, notifications, avatar du caissier. |
| Bandeau de filtres | Deux boutons segmentés (Catégories, Marques), flèches de défilement | Pour MarketPOS : « Catégories » seulement, plus un champ « Rayon ». |
| Rangée de catégories | Cartes horizontales : icône dans un cercle coloré, nom, nombre d'articles. La catégorie active est en vert plein. | Très bon pattern pour un caissier : un toucher pour filtrer. |
| Titre de section + recherche locale | « New Grocery Products » à gauche, champ de recherche et bouton vert « Search » à droite | Titre : « Articles » ou « Produits du rayon ». |
| Grille produits (4 colonnes sur bureau) | Cartes blanches, image à gauche ou en haut, nom sur deux lignes, prix | Passer à 4 colonnes sur tablette 1280 px, 5 sur écran 1920 px. |
| Panneau droit « Billing Section » | Recherche par code article + bouton vert « Add Item » + bouton orange « Clear Cart » | Reprendre tel quel. Ajouter un bouton « Client » à côté. |
| Lignes du panier | Vignette, nom, stepper − 2 + , prix unitaire, bouton supprimer rouge | Les colonnes QTY, Price et Delete sont claires. Garder la lisibilité. |
| Totaux | Sous-total, remise produit, remise supplémentaire, remise coupon, **Total** en gras | Pour MarketPOS : sous-total, remise, TVA (à valider), **Total** en gras et plus grand. |
| Pied | Bouton orange « Cancel Order » et bouton vert « Place Order », pleine largeur chacun | Remplacer par « Annuler la vente » (orange) et « Encaisser » (vert). |

## 2. Style

- **Fond** : gris très clair (#F4F5F7 environ), la zone de contenu est blanche.
- **Cartes** : blanches, coins arrondis (environ 10 px), ombre très légère, pas de bordure forte.
- **Couleur principale** : vert (environ #4CAF50 à #56A846). Utilisée pour la catégorie active, les boutons d'action positive et les boutons de recherche.
- **Couleur d'alerte et d'action secondaire** : orange (environ #F5821F). Utilisée pour les prix, les boutons d'annulation et le bouton « Clear Cart ».
- **Rouge** : réservé à la suppression (icône corbeille).
- **Texte** : noir charbon pour les titres, gris pour les libellés secondaires, prix en orange.
- **Typographie** : sans-serif géométrique, poids moyen pour les noms, gras pour les totaux.
- **Icônes** : trait fin, dans des cercles pastel pour les catégories.
- **Thème sombre** : disponible (icône lune en haut à droite). À garder pour MarketPOS.

## 3. Ce qu'il faut améliorer pour MarketPOS (absent de la référence)

1. **Gros totaux** : le total doit être plus grand que sur la référence, lisible à distance (40 px et plus).
2. **Bouton Encaisser** : en plus de la couleur verte, afficher « F9 » et le montant. Il doit être le plus visible de l'écran.
3. **Statut de synchronisation** : ajouter un indicateur en permanence (en ligne ou hors ligne, nombre de ventes en attente). Absent de la référence.
4. **Taille des cibles** : les boutons « − 2 + » de la référence sont petits. Pour un écran tactile de caisse, 44 px minimum.
5. **Écran client** : la référence n'en a pas. À garder séparé.
6. **Montants** : espace comme séparateur de milliers, sans décimales, en FCFA. La référence utilise « $ ».
7. **Données** : pas de remises produit ou coupon dans le MVP. Garder seulement « Remise » sur le ticket, pour éviter la surcharge.

## 4. Ce qu'on ne reprend pas

- Le nom « Grostore », le logo et l'avatar.
- Les images de fruits et de produits (licence inconnue, et il faudra des photos réelles de produits).
- Les textes factices et les prix répétés.
- Les boutons « Brands » et les flèches de défilement de catégories, qui ne servent pas au caissier.
