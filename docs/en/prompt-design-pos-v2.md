# Design Prompt: MarketPOS, version 2 (with visual reference)

[English](prompt-design-pos-v2.md) · [Français](../fr/prompt-design-pos-v2.md)

Version 2, 2026-11-21. Replaces v1 for the cashier station. Attach the image `../references/reference-caisse-grostore.jpg` to the request. Detailed analysis: [reference-visuelle.md](reference-visuelle.md).

> **Note:** the prompt itself stays in French, because the MarketPOS interface is in French. The copy-paste text is in [the French version](../fr/prompt-design-pos-v2.md). This English file summarizes it.

## What the prompt asks for

**Goal.** Design the MarketPOS checkout screen, for grocery stores and supermarkets in Côte d'Ivoire. Reuse the layout and style of the attached reference image (an online grocery checkout screen), with the changes listed below. Do not reuse its name, logo, images, or texts.

**Layout (mandatory), a single screen in three zones:**

1. **Header** (about 64 px high): "MarketPOS" text logo on the left; large central search bar ("Search for an item or scan a code (Ctrl+K)"); on the right, connection status (green dot "Online" or orange "Offline · 3 sales pending"), light/dark theme button, cashier avatar with name.
2. **Left zone** (about 65% of width): a horizontal category row of cards (pastel icon circle, name, item count), first item "All", active card in solid green. Section title "Articles", local search field and green "Search" button. Product card grid: 4 columns on a 1280 px tablet, 5 on a 1920 px screen. Each card: image or initial badge, name on up to 2 lines, bold orange price, gray category. Whole card clickable.
3. **Right zone** (about 35% of width, white, left border): "Current ticket" title; item code input with green "Add" and orange "Clear" buttons; cart lines (thumbnail, name, − quantity + stepper with 44 px targets, line amount, red delete); totals block (subtotal, discount editable on click, **VAT** shown only when a rate is configured, then **TOTAL** at 40 px or more); footer with full-width orange "Cancel sale" and green "Checkout (F9)" buttons. "Checkout" is the most visible action on the screen.

**Colors and style.** Light gray background; cards and right zone white. Green (around #4CAF50): active category, "Add", "Search", "Checkout". Orange (around #F5821F): prices, "Clear", "Cancel sale". Red only for deleting a line. Charcoal text, gray labels. Right-aligned figures, no decimals, space thousands separator, F suffix (for example 12 500 F). Full dark theme with the same hierarchy. Thin 24 px icons.

**Constraints.** Touch targets 44 px minimum, 56 px for "Checkout". WCAG AA contrast. Never use color alone to convey information. One main action visible at a time. No animation that delays input; transitions 150 ms maximum. States to show: empty cart, unknown item (offer to create), offline (alert banner), payment in progress. The cashier must see at least 20 products without scrolling on 1280 × 800.

**Deliverables.** The checkout screen in light and dark, at 1280 × 800 and 1920 × 1080; the cash payment modal (amount received, banknote shortcuts, large change, error if insufficient); the same modal for mobile money with "awaiting confirmation" state; a component page; a token page.

## Notes for maintainers

- In the design tool, attach the reference image and write "reuse the layout of the attached image". Without the image, the tool produces a generic result, as with v1.
- If the result stays generic, ask for targeted corrections by zone (for example, "right zone: move the total to the bottom, enlarge the Checkout button") rather than regenerating everything.
