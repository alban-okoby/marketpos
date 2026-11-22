---
name: MarketPOS
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
  on-surface-variant: '#3e4947'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#005f26'
  on-tertiary: '#ffffff'
  tertiary-container: '#007a33'
  on-tertiary-container: '#a1ffad'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
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
This design system is engineered specifically for fast-paced retail checkouts, grocers, and supermarkets operating in Côte d'Ivoire and across West Africa. The operating environment demands immediate readability under harsh overhead neon or midday glare, rapid touch acquisition, and zero cognitive friction during high-stress customer rushes.

The design movement combines **Utilitarian Minimalism** with **Industrial Touch Ergonomics**:
- **Utilitarian & Direct:** Zero decorative gradients, ornamental drop shadows, or low-contrast micro-interactions. Every pixel directly serves transaction speed, accuracy, and clear inventory verification.
- **Ergonomic Density:** Interfaces are split into structured tactile zones—actionable touch pads, numeric entry, product grids, and persistent tally registers.
- **Resilient Trust:** Visual feedback is definitive, reassuring operators during network drops, mobile money validations (Wave, Orange Money, MTN MoMo), and end-of-day register reconcilements.

## Colors
The color hierarchy is calibrated for high optical contrast (WCAG AAA for critical indicators) and quick peripheral identification.

### Canvas & Structural Surfaces
- **Light Mode (Default):** Canvas sits on `#F8FAFC`, primary card containers on `#FFFFFF`, structural separators and slot borders on `#E2E8F0`, and primary typography on `#0F172A`. Secondary labels use `#475569`.
- **Dark Mode:** Canvas sits on `#0F172A`, surface cards on `#1E293B`, elevated modals/drawers on `#334155`, structural borders on `#334155`, and primary text on `#F8FAFC`.

### Brand & Interactive Tones
- **Primary Teal (`#0F766E` / `#0D9488`):** Reserved for primary ticket validation, cart completion, active category selections, and system state confirmation.
- **Secondary Teal (`#0D9488`):** Focus states, hover overlays, and secondary action touch targets.

### Status System & Financial Feedback
- **Success / Synced (`#16A34A`):** Transaction cleared, cash balance exact, local terminal synced with backend.
- **Pending / Attention (`#D97706`):** Mobile money authorization pending, thermal paper low, partial payment held.
- **Danger / Discrepancy (`#DC2626`):** Cash drawer mismatch, voided transaction, item deletion, network failure.
- **Offline Mode (`#EA580C` on `#F1F5F9` / `#1E293B`):** Explicit persistent banner and badge indicating local offline caching mode.

## Typography
Inter is used across all levels due to its tall x-height, neutral tone, and exceptional clarity on standard touchscreens and POS hardware displays.

- **Tabular Figures (`tnum`):** All financial amounts, quantities, SKUs, barcode values, and change calculations must enforce CSS `font-variant-numeric: tabular-nums;`. This prevents visual shifting during balance updates and guarantees vertical alignment in running receipts.
- **Hierarchy of Amounts:** The grand total due must dominate the visual field (`headline-total`), readable effortlessly from 1.5 meters away by both the cashier and customer.
- **Keypad & Fast Keys:** Numeric keypad legends are set to `label-keypad` (`24px`, bold) for immediate fingertip targeting.

## Layout & Spacing
The layout follows a split operational model optimized for hardware POS touchscreens (10" to 15.6" tablets/terminals) with adaptive single-column flow for handheld mobile inventory terminals.

### Layout Partitioning (Tablet / Desktop POS)
- **Left Panel (Ticket & Register, 35–40% width):** Fixed viewport containing ongoing cart items, discount toggles, tax breakdowns, and final tender CTA. Remains visible at all times.
- **Right Panel (Catalog & Keypad, 60–65% width):** Dynamic grid displaying quick-pick item tiles, category selectors, or full-width numeric payment calculation keypads.

### Responsive Breakpoints & Reflow
- **Desktop / Terminal POS (≥1024px):** Persistent dual-pane view. 16px gutter spacing, 16px outer margin.
- **Compact Tablet (768px - 1023px):** Dual-pane with collapsible category rail. Gutter reduced to 12px.
- **Handheld Mobile (<768px):** Tab-swapped layout (`Cart [Count]` / `Catalog` / `Pay`). Outer margins reduce to 8px (`margin-mobile`), preserving maximal surface for touch targets.

### Touch Target Density Rules
- Strict minimum target size for minor actions (void, quantity modifier): **44px × 44px**.
- Standard target size for product quick-keys and numpad buttons: **56px × 56px minimum** (optimal: 64px height).
- Primary validation / checkout CTA: **56px to 64px height**, full ticket width.

## Elevation & Depth
This design system rejects heavy blurs, translucent glass effects, and floaty drop shadows. In a checkout terminal, low visual ambiguity is paramount under direct lighting.

Visual depth is expressed through **Tonal Tiers** and **Crisp Borders**:
- **Layer 0 (Base Canvas):** `#F8FAFC` (Light) / `#0F172A` (Dark).
- **Layer 1 (Cards, Item Cells, Register Pad):** `#FFFFFF` (Light) / `#1E293B` (Dark) with a 1px solid border of `#E2E8F0` / `#334155`.
- **Layer 2 (Active Item / Selected Row):** 2px inset or solid boundary using Primary Teal (`#0F766E`), accompanied by a 5% primary color surface tint.
- **Layer 3 (Modals, Overlays, Cash Pay Sheets):** High contrast background `#FFFFFF` / `#1E293B`, framed by a distinct 1px border (`#CBD5E1` / `#475569`) and a tight grounding shadow (`0 4px 12px rgba(15, 23, 42, 0.12)`).
- **Touch Depress Feedback:** Interactive cells translate downward 1px with an immediate darker border tint (`#0F766E` active state) for immediate tactile confirmation upon finger contact.

## Shapes
A soft, restrained corner radius (`0.25rem` / `4px` baseline) is applied throughout the system. 

- **Rationale:** Highly rounded or pill-shaped buttons reduce usable touch hitboxes at the corners—a critical drawback on resistive or budget capacitive POS screens. Compact radii preserve maximum square area for rapid, imprecise finger taps.
- **Modifiers:**
  - Standard buttons, input fields, and catalog tiles: `rounded` (`4px`).
  - Container modals, ticket summary cards: `rounded-lg` (`8px`).
  - Status badges, operational pill indicators (e.g., "Online", "Wave"): `rounded` (`4px`) with bold internal padding rather than full pill rounding to keep typography grounded.

## Components

### Buttons
- **Primary Checkout Button:** Minimum height 56px (up to 64px on main POS screen). Background `#0F766E`, text `#FFFFFF`, bold `18px`, full width of the cart panel. Active state shifts to `#115E59`.
- **Secondary Utility Buttons:** Height 48px–56px. Background `#F1F5F9`, border 1px `#CBD5E1`, text `#0F172A`. In dark mode: background `#334155`, border 1px `#475569`, text `#F8FAFC`.
- **Destructive (Void / Cancel):** Minimum 48px height. Background `#FEE2E2`, border 1px `#FCA5A5`, text `#DC2626`. Must trigger explicit modal confirmation for cart-clearing actions.

### Numeric Keypad (Numpad)
- **Cell Dimensions:** Grid of 3x4 or 4x4 keys, each key minimum 56px height (64px preferred).
- **Styling:** Surface `#FFFFFF` (Dark: `#1E293B`), border 1px `#E2E8F0` (Dark: `#334155`), active border `#0F766E`. Text size `24px` bold tabular numerals.
- **Quick Denominations:** Quick cash buttons below the numpad (`500 F`, `1 000 F`, `2 000 F`, `5 000 F`, `10 000 F CFA`) sized at 48px height for rapid one-tap tender entry.

### Catalog Tiles (Quick-Pick Grid)
- **Dimensions:** Square or 4:3 aspect ratio, min width 96px, min height 84px.
- **Structure:** Price pinned at top or bottom in bold tabular text (`14px` bold), item label truncated to 2 lines (`13px`). High-contrast border `1px solid #E2E8F0`. Tap state triggers immediate teal perimeter highlight.

### Cart Item List
- **Row Architecture:** Height 52px minimum per line item to enable effortless deletion and quantity editing.
- **Columns:** Quantity pill (with `+` and `-` touch buttons, min 36px each), item name, unit price, total price right-aligned in tabular font.
- **Selected Row:** Left edge accented with a 4px solid `#0F766E` stripe.

### Inputs & Barcode Fields
- **Height:** 48px minimum.
- **Style:** Background `#FFFFFF` (Dark: `#0F172A`), border 1.5px solid `#CBD5E1` (Dark: `#475569`), focus border 2px solid `#0F766E`.
- **Integrated Actions:** Inline clear button (`✕`) at least 44px wide to clear erroneous manual barcode entries instantly.

### Checkboxes & Radio Selectors
- **Hit Area:** 44px × 44px touch bounding box, with a visible 22px × 22px visual mark.
- **Styling:** Border 2px solid `#475569`, checked state `#0F766E` with sharp white tick icon.

### Status Banners & Badges
- **Offline / Sync Indicator:** Fixed header pill. Offline: `#EA580C` background, `#FFFFFF` text with caution icon. Synced: `#16A34A` text on `#DCFCE7` background.
- **Payment Method Badges:** Specific color markers for regional payments (Orange Money, MTN MoMo, Wave, Cash) using clear high-contrast badge containers to avoid cashier error.