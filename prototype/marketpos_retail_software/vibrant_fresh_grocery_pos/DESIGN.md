---
name: Vibrant Fresh Grocery POS
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4a3b'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e7b69'
  outline-variant: '#becab6'
  surface-tint: '#006e11'
  primary: '#006e11'
  on-primary: '#ffffff'
  primary-container: '#34a835'
  on-primary-container: '#003404'
  inverse-primary: '#6cdf64'
  secondary: '#9a4600'
  on-secondary: '#ffffff'
  secondary-container: '#fd7700'
  on-secondary-container: '#5a2600'
  tertiary: '#565e71'
  on-tertiary: '#ffffff'
  tertiary-container: '#8b93a8'
  on-tertiary-container: '#242c3d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#88fc7d'
  primary-fixed-dim: '#6cdf64'
  on-primary-fixed: '#002202'
  on-primary-fixed-variant: '#00530a'
  secondary-fixed: '#ffdbc9'
  secondary-fixed-dim: '#ffb68c'
  on-secondary-fixed: '#321200'
  on-secondary-fixed-variant: '#753400'
  tertiary-fixed: '#dbe2f9'
  tertiary-fixed-dim: '#bfc6dc'
  on-tertiary-fixed: '#141b2c'
  on-tertiary-fixed-variant: '#3f4759'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

This design system delivers a high-efficiency, crisp, and tactile retail Point of Sale (POS) and inventory experience for fresh groceries, organics, and specialty food markets. The aesthetic merges **Modern Corporate utility** with **tactile retail warmth**, optimizing for rapid scanning, error-free input, and visual comfort during long cashier shifts.

### Visual Mood & Tone
- **Crisp & Energizing:** Driven by vibrant leaf-green accents that evoke fresh harvest, organic quality, and operational health.
- **Fast-Paced Utility:** High contrast between interactive actions, data density, and clear touch/click targets.
- **Approachable Minimalism:** Clean, light surfaces with soft ambient depth that prevent screen fatigue under retail lighting.

## Colors

The palette centers on the exact vibrant fresh leaf green (`#34a835`) sampled from the Grostore POS interface (found on the active category cards, "Categories" badge, and the primary "Place Order" confirmation button).

- **Primary (`#34a835`):** The signature fresh grocery lime-green. Reserved for primary operational actions ("Place Order", "Add Item", active category states, verified status indicators). Solid fills always use `#ffffff` for text and icons to guarantee maximum legibility.
- **Secondary (`#ff7800`):** Energetic citrus orange used for high-urgency transactional actions, cancellation ("Cancel Order"), discounts, and secondary price callouts.
- **Tertiary (`#101828`):** Deep charcoal navy for core typography, active dark buttons ("Search"), line item totals, and dense data labels.
- **Neutral (`#64748b`):** Muted slate used for placeholder text, disabled states, borders, and subtle table gridlines.
- **Canvas & Surface:** Built on an ultra-light gray backdrop (`#f4f5f8`) with pure white (`#ffffff`) modular cards, isolating POS panels from item grids cleanly.

## Typography

The typography leverages **Plus Jakarta Sans** across all levels. Its balanced geometric proportions and friendly apertures provide instant readability across handheld scanners, POS touchscreens, and desktop administrative views.

- **Headlines:** Clean and bold for category headers, total tallies, and modal titles.
- **Body:** Calibrated between 11px and 15px to handle product names, SKU descriptions, and dense register line items without truncation.
- **Labels & Numbers:** Numbers use tabular figures wherever price calculations, quantities, and receipt tallies occur to ensure vertical decimal alignment.

## Layout & Spacing

The layout is built for high-throughput dual-pane retail workflows:
- **Primary Stage (Left/Main, 65-70% width):** Houses global search, horizontal category carousels, and responsive multi-column product card grids.
- **Terminal Panel (Right, 30-35% width):** Fixed-width billing and receipt panel that remains pinned for instantaneous order tallying and rapid settlement.

### Responsive Behavior
- **Desktop / Wide POS (>= 1280px):** Two-pane layout with 4-5 product columns in the catalog grid; 16px (`gutter`) separation between cards.
- **Tablet / Touch Register (768px - 1024px):** Product grid reduces to 2-3 columns; billing section collapses into a persistent bottom sheet or slide-over drawer accessible via quick tap.
- **Mobile Handheld (<= 767px):** Single-column stacked mode with sticky top search, horizontal scrolling category pills, and floating checkout bar.

## Elevation & Depth

This system avoids heavy drop shadows, relying instead on clean tonal layers, soft borders, and diffuse ambient depth:

- **Canvas Base:** `#f4f5f8` provides a low-strain foundation.
- **Card Tier (Level 1):** Solid `#ffffff` with a subtle hairline outline (`rgba(15, 23, 42, 0.06)`) and a diffused lift (`0 2px 8px rgba(15, 23, 42, 0.04)`).
- **Active / Selected State (Level 2):** Primary green fill (`#34a835`) elevated with a soft tinted glow (`0 4px 14px rgba(52, 168, 53, 0.28)`), used for selected categories and checkout triggers.
- **Modal & Popover Tier (Level 3):** Clean float (`0 12px 32px rgba(15, 23, 42, 0.12)`) with a crisp boundary outline.

## Shapes

The interface adopts a **Rounded (Level 2)** shape strategy. 
- Interactive buttons, form inputs, and product tiles use `0.5rem` (8px) corner radii.
- Outer panels and category cards utilize `rounded-lg` (16px) to maintain a soft, friendly, modern grocery feel.
- Category icon badge circles and quantity adjustment buttons use full rounded circles (`9999px`) to emphasize tap accessibility.

## Components

### Buttons
- **Primary ("Place Order", "Add Item"):** Solid `#34a835` background, pure `#ffffff` text and icons, `font-weight: 600`, with standard height `44px` on desktop and `48px` on touch interfaces. Hover transitions to `#2e952f`.
- **Secondary / Destructive ("Cancel Order"):** Solid `#ff7800` background, pure `#ffffff` text, providing immediate, unmistakable visual contrast against the green primary.
- **Dark Action ("Search"):** Solid `#101828` background with `#ffffff` text and crisp icon alignment.
- **Quantity Adjusters (`-` / `+`):** Compact bordered or low-tint pills (`border: 1px solid #e2e8f0`) supporting quick tap increments.

### Category Cards & Badges
- **Inactive Category Tile:** White card with a centered circular pastel emblem tint, subtle border, gray subtext ("25 Items"), and dark body title.
- **Active Category Tile:** Solid `#34a835` container, `#ffffff` title, `#e8f7e8` item count label, and a white translucent icon badge (`rgba(255, 255, 255, 0.2)`).
- **Tag Badges ("Categories", "Brands"):** Small rounded tags (`roundedness: 1`) with high contrast: solid green badge with crisp white typography, or neutral outlined pills.

### Product Tiles
- Clean grid modules displaying crisp photography, bold primary item names (`13px, weight: 600`), and a dual price layout (sale price in `#ff7800` alongside crossed-out or original slate totals).

### Inputs & Barcode Fields
- Clean `#ffffff` input fields featuring a leading magnifying or barcode scan icon, framed with a light slate border (`#e2e8f0`). Focus states activate a 2px `#34a835` ring with zero shadow noise.

### Billing List & Cart
- High-density rows containing thumbnail avatars, multi-line truncated product titles, numeric stepper inputs, price columns right-aligned with tabular figures, and a light red icon button for item deletion.