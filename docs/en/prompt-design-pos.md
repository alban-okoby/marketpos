# Design Prompt: MarketPOS (grocery store / supermarket checkout)

[English](prompt-design-pos.md) · [Français](../fr/prompt-design-pos.md)

Version 1, 2026-11-21. Paste into an AI design tool (Figma AI, Galileo, Uizard, v0, Lovable, or similar).

> **Note:** the prompt itself stays in French, because the MarketPOS interface is in French and the design tool must generate French UI text. The copy-paste text is in [the French version](../fr/prompt-design-pos.md). This English file only describes its structure.

## What the prompt asks for

**Role and context.** A senior product designer specialized in retail point-of-sale (POS) software in West Africa, designing a complete, clickable, and consistent mockup of MarketPOS for grocery stores and supermarkets in Côte d'Ivoire.

**Users.**
- Cashier: uses the register 8 hours a day, standing, under pressure when the queue grows. Little time to read. Must take payments without thinking. Varying digital literacy.
- Manager: validates closings, authorizes sensitive actions, checks the day's sales. Sometimes works from an office, sometimes at the checkout.
- The network is unstable. The software must always work, and the interface must clearly show when sales are waiting to sync.
- Environment: strong light possible, 10 to 15 inch touchscreens, sometimes a desktop station.
- Currency: FCFA, no decimals. Language: French, simple and direct tone, short sentences, imperative verbs for actions.

**Surfaces to design** (each in light and dark theme):
- **A. Cashier station** (top priority): 1280 × 800 tablet and 1920 × 1080 screen. Search bar with autofocus that accepts scanned barcodes. Product grid, cart panel with quantity controls, very large total, discount, highly visible checkout button. Keyboard shortcuts shown discreetly (F9 checkout, Esc cancel). Permanent connection and sync indicator.
- **B. Payment modal**: amount received with numeric keypad, banknote shortcuts (500 to 20,000 F), "exact amount". Change shown in large text. Clear error if the amount is insufficient. Payment method choice: cash, mobile money (Orange Money, MTN MoMo, Moov Money, Wave), card. "Awaiting confirmation" state for mobile money.
- **C. Customer display** (second screen, facing the customer, no controls): scanned items, prices, promotions visible before payment. Very large total. Very readable at 1 meter.
- **D. Manager space** (desktop or tablet): daily dashboard, X and Z closings with cash count by denomination and variance calculation, alert list, cashier and permission management.
- **E. Login**: PIN entry with a giant numeric keypad. No long passwords at the checkout.
- **F. Printed receipt**: 80 mm thermal, black and white, no images.

**Design constraints.** Touch targets at least 44 px (56 px for main actions). One main action per screen. WCAG AA contrast. Never convey information by color alone. Right-aligned figures, space as thousands separator (for example 12 500 F). Every screen shows empty, loading, error, success, and offline states. The cashier station shows at least 20 products without scrolling on a 1280 × 800 tablet. No animation slower than 150 ms. No third-party brand styles.

**Design system to produce.** Tokens (colors, typography, spacing), components (buttons, inputs, numeric keypad, product card, cart line, status badge, alert banner, modal, tabs, table, sync indicator, quantity stepper), 24 px line icons. Proposed accent: teal green (#0F766E), to be validated.

**Deliverables.** Five surfaces in light and dark, in tablet and desktop formats; a clickable prototype of the key journeys; a component page with all states; a token page; developer specs (dimensions, margins, states, keyboard and scanner behavior); the list of French UI texts for review.

## Notes for maintainers

- Keep the prompt and references in this repository, so the prompt can be reused for each version.
- Check every generated mockup against the [requirements specification](cahier-des-charges.md), especially the CA, US, CL, and MM IDs.
- Mockups are hypotheses: validate them with real cashiers in store before developing.
