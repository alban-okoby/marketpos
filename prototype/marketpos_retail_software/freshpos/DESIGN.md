---
name: FreshPOS
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#404a38'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707a66'
  outline-variant: '#bfcab3'
  surface-tint: '#2d6c00'
  primary: '#2d6c00'
  on-primary: '#ffffff'
  primary-container: '#5bb81f'
  on-primary-container: '#194200'
  inverse-primary: '#7ddd44'
  secondary: '#2f6c00'
  on-secondary: '#ffffff'
  secondary-container: '#97fb5a'
  on-secondary-container: '#327200'
  tertiary: '#a9267b'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff6fc4'
  on-tertiary-container: '#710050'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#98fb5e'
  primary-fixed-dim: '#7ddd44'
  on-primary-fixed: '#092100'
  on-primary-fixed-variant: '#215100'
  secondary-fixed: '#97fb5a'
  secondary-fixed-dim: '#7dde3f'
  on-secondary-fixed: '#092100'
  on-secondary-fixed-variant: '#215100'
  tertiary-fixed: '#ffd8e9'
  tertiary-fixed-dim: '#ffafd7'
  on-tertiary-fixed: '#3c0029'
  on-tertiary-fixed-variant: '#890062'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-total:
    fontFamily: Inter
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-total-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-keypad:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
  label-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.5rem
  margin: 1rem
  margin-mobile: 0.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style
Ce système de design est conçu pour les points de vente rapides, épiceries et supermarchés nécessitant une lisibilité immédiate et une ergonomie tactile sans friction. Il associe la clarté épurée d'une interface de bureau moderne (inspiration Apple/macOS) à la réactivité d'un terminal de caisse industriel.

- **Minimalisme Utilitaire :** Surfaces blanches et gris très clairs, hiérarchie typographique nette et absence d'ornements superflus. Chaque élément sert la rapidité d'encaissement et la vérification immédiate du panier.
- **Énergie Fraîche & Lisible :** Le vert lumineux (`#5BB81F`) dynamise les actions principales et la validation de commande tout en conservant un contraste élevé et une fatigue visuelle minimale lors des longues journées de caisse.
- **Ergonomie Tactile :** Zones d'interaction généreuses, séparation claire entre le catalogue et le ticket de caisse, et retours visuels francs pour les paiements (espèces, carte, mobile money).

## Colors
La palette privilégie une lisibilité maximale sous éclairage de magasin, avec un fond neutre très clair et un vert vif réservé aux actions de validation et aux états actifs.

### Surfaces & Structure
- **Mode Clair (Par défaut) :** Fond principal `#F8FAFC`, cartes et conteneurs `#FFFFFF`, bordures structurelles `#E2E8F0`, texte principal `#0F172A` et texte secondaire `#475569`.
- **Mode Sombre :** Fond `#0F172A`, surfaces `#1E293B`, modales `#334155`, bordures `#334155` et texte principal `#F8FAFC`.

### Couleurs Principales & Interactives
- **Vert Principal (`#5BB81F`) :** Boutons de validation de commande, catégories actives, indicateurs de sélection et focus des champs.
- **Vert Lumineux (`#65C426`) :** États de survol (hover) et accents secondaires positifs. Pour les textes blancs sur fond vert, l'état actif/pressé utilise `#4CA316` afin de garantir un contraste optimal.

### Statuts & Retours Financiers
- **Succès / Synchronisé (`#16A34A`) :** Transaction validée, caisse équilibrée, terminal synchronisé.
- **En attente (`#D97706`) :** Paiement mobile en cours de validation, papier thermique faible.
- **Erreur / Annulation (`#DC2626`) :** Suppression d'article, annulation de ticket, écart de caisse ou perte réseau.
- **Mode Hors-ligne (`#EA580C`) :** Bannière persistante indiquant le fonctionnement en cache local.

## Typography
La police **Inter** est utilisée sur l'ensemble du système pour sa grande hauteur d'x et sa netteté sur les écrans tactiles et moniteurs de caisse.

- **Chiffres Tabulaires (`tnum`) :** Tous les montants, quantités, codes-barres et rendus de monnaie doivent impérativement appliquer `font-variant-numeric: tabular-nums;` pour éviter tout décalage visuel lors des mises à jour.
- **Hiérarchie du Total :** Le total à payer (`headline-total`) domine l'espace visuel afin d'être lisible à 1,5 mètre par le caissier comme par le client.
- **Pavé Numérique :** Les touches du pavé utilisent `label-keypad` (`24px`, gras) pour une acquisition immédiate au doigt.

## Layout & Spacing
L'interface adopte une grille fluide divisée en deux panneaux opérationnels, optimisée pour les écrans tactiles de caisse (10" à 15.6") et adaptable sur mobile.

### Partitionnement (Tablette / Desktop POS)
- **Panneau Gauche ou Droit (Ticket & Caisse, 35–40% de largeur) :** Vue fixe affichant les articles du panier, les remises, le sous-total et le bouton d'encaissement.
- **Panneau Principal (Catalogue & Pavé Numérique, 60–65% de largeur) :** Grille dynamique de produits, sélecteur de catégories et pavé de saisie rapide.

### Points de Rupture
- **Desktop / Terminal POS (≥1024px) :** Double panneau permanent, gouttières de `16px` (`gutter`) et marges externes de `16px` (`margin`).
- **Tablette Compacte (768px – 1023px) :** Double panneau avec rail de catégories repliable, gouttières réduites à `12px`.
- **Mobile (<768px) :** Navigation par onglets (`Panier` / `Catalogue` / `Payer`) avec marges réduites à `8px` (`margin-mobile`).

### Densité Tactile
- Taille minimale des cibles secondaires : **44px × 44px**.
- Tuiles produits et touches du pavé numérique : **56px × 56px minimum** (64px recommandé).
- Bouton principal d'encaissement : **56px à 64px de hauteur** sur toute la largeur du panneau ticket.

## Elevation & Depth
Ce système de design privilégie la clarté immédiate par **niveaux tonaux** et **bordures nettes**, dans un esprit Apple/macOS épuré, sans ombres portées lourdes ni effets de flou excessifs.

- **Niveau 0 (Fond de toile) :** `#F8FAFC` (Clair) / `#0F172A` (Sombre).
- **Niveau 1 (Cartes, tuiles produits, panneau ticket) :** `#FFFFFF` (Clair) / `#1E293B` (Sombre) avec une bordure fine `1px solid #E2E8F0` (`#334155` en sombre).
- **Niveau 2 (Élément actif / sélectionné) :** Bordure `2px solid #5BB81F` accompagnée d'une teinte de surface très légère (`#5BB81F` à 5–8% d'opacité).
- **Niveau 3 (Modales et tiroirs d'encaissement) :** Fond `#FFFFFF` / `#1E293B`, bordure `1px solid #CBD5E1` et ombre d'ancrage discrète (`0 4px 12px rgba(15, 23, 42, 0.10)`).

## Shapes
Un rayon d'arrondi doux et contenu (`0.25rem` / `4px` de base, niveau `1`) est appliqué à l'ensemble des composants.

- **Justification :** Les boutons trop arrondis réduisent la surface utile dans les angles sur les écrans tactiles. Un arrondi modéré conserve l'esthétique moderne tout en maximisant la zone de frappe.
- **Application :**
  - Boutons, champs de saisie et tuiles catalogue : `0.25rem` (`4px`).
  - Cartes conteneurs et modales : `0.5rem` (`8px`).
  - Badges de statut et pilules de synchronisation : `0.25rem` (`4px`) avec un espacement interne généreux.

## Components

### Boutons
- **Bouton Principal (Encaisser / Valider) :** Hauteur minimale `56px` (jusqu'à `64px`). Fond `#5BB81F`, texte `#FFFFFF` en gras `18px`, pleine largeur du panier. État actif `#4CA316`.
- **Boutons Secondaires :** Hauteur `48px–56px`. Fond `#F1F5F9`, bordure `1px solid #CBD5E1`, texte `#0F172A`.
- **Action Destructive (Annuler / Vider) :** Hauteur minimale `48px`. Fond `#FEE2E2`, bordure `1px solid #FCA5A5`, texte `#DC2626`, avec confirmation modale pour le vidage de panier.

### Pavé Numérique (Numpad)
- **Grille :** 3×4 ou 4×4 touches, hauteur minimale `56px` (`64px` idéal).
- **Style :** Surface `#FFFFFF`, bordure `1px solid #E2E8F0`, bordure active `#5BB81F`, chiffres tabulaires `24px` gras.
- **Coupures Rapides :** Boutons de montants prédéfinis sous le pavé (`48px` de hauteur) pour un encaissement espèces en un toucher.

### Tuiles Catalogue
- **Dimensions :** Ratio carré ou 4:3, largeur min `96px`, hauteur min `84px`.
- **Structure :** Prix affiché en chiffres tabulaires gras (`14px`), libellé produit sur 2 lignes max (`13px`). Bordure `1px solid #E2E8F0` passant à `#5BB81F` lors du toucher.

### Lignes du Panier
- **Architecture :** Hauteur minimale `52px` par ligne. Sélecteur de quantité (`-` / `+`) avec cibles de `36px` minimum, nom de l'article, prix unitaire et total aligné à droite.
- **Ligne Sélectionnée :** Barre latérale gauche de `4px solid #5BB81F`.

### Champs de Saisie & Code-Barres
- **Hauteur :** `48px` minimum.
- **Style :** Fond `#FFFFFF`, bordure `1.5px solid #CBD5E1`, focus `2px solid #5BB81F`. Bouton d'effacement rapide (`✕`) d'au moins `44px` de large.

### Cases à Cocher & Boutons Radio
- **Zone Tactile :** `44px × 44px` avec un marqueur visuel de `22px × 22px`. État coché `#5BB81F` avec icône blanche nette.

### Bannières & Badges de Statut
- **Indicateur Hors-ligne / Synchronisé :** Pilule fixe dans l'en-tête. Hors-ligne : fond `#EA580C`, texte `#FFFFFF`. Synchronisé : texte `#16A34A` sur fond `#DCFCE7`.