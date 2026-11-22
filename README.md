# MarketPOS

**English** · [Français](README.fr.md)

Point-of-sale (POS) and store-management software for supermarkets and grocery stores. The first target market is Côte d'Ivoire, with the rest of francophone West Africa to follow.

> **Status: early draft (v0.1).** Nothing has been validated yet with an accountant, the tax authority (DGI), or a store. Open points are marked *"à valider"* (to be validated) in the specifications.

## Features

The current deliverable is a static, single-file prototype of the cashier sales screen:

- Cashier login with PIN
- Catalogue of 200 test items (15 named, 185 generated)
- Shopping cart and cash payment with change calculation
- Printable receipt, using the browser's print dialog
- Customer-facing display in a separate window, synced in real time
- Sequential ticket numbering
- Local sales journal

## Getting started

The prototype has no dependencies, no build step, and no server.

1. Open `prototype/caisse/index.html` in Chrome or Edge.
2. Log in with a test PIN:

   | Role      | PIN  |
   |-----------|------|
   | Cashier 1 | 1111 |
   | Cashier 2 | 2222 |
   | Manager   | 9999 |

To open the customer display, load the same file with the query parameter `?client=1` in a second window.

Data is stored in the browser's `localStorage`. To reset the prototype, clear the site's stored data.

The prototype's interface is in French, as required for the target market.

## Known limitations

- No VAT (TVA) yet; the rate is not specified
- No server or multi-device sync
- No mobile money
- No FNE (electronic invoice) integration
- No scale (balance) integration
- Printing relies on the browser's print dialog
- Offline behavior has not been tested in real conditions

## Documentation

Each document is available in English and in French:

| Document | English | Français |
|----------|---------|----------|
| Requirements specification (v0.1) | [docs/en/cahier-des-charges.md](docs/en/cahier-des-charges.md) | [docs/fr/cahier-des-charges.md](docs/fr/cahier-des-charges.md) |
| Market watch on Smartpos | [docs/en/smartpos-veille.md](docs/en/smartpos-veille.md) | [docs/fr/smartpos-veille.md](docs/fr/smartpos-veille.md) |
| Visual reference | [docs/en/reference-visuelle.md](docs/en/reference-visuelle.md) | [docs/fr/reference-visuelle.md](docs/fr/reference-visuelle.md) |
| Design prompt, v1 | [docs/en/prompt-design-pos.md](docs/en/prompt-design-pos.md) | [docs/fr/prompt-design-pos.md](docs/fr/prompt-design-pos.md) |
| Design prompt, v2 (current) | [docs/en/prompt-design-pos-v2.md](docs/en/prompt-design-pos-v2.md) | [docs/fr/prompt-design-pos-v2.md](docs/fr/prompt-design-pos-v2.md) |

Design prompts stay in French, because the generated interface is in French.

## Repository structure

| Path | Description |
|------|-------------|
| `docs/en/`, `docs/fr/` | Documentation, in English and French (same files in each folder) |
| `docs/references/` | Shared images used by the documentation |
| `prototype/caisse/index.html` | Sales-screen prototype (CSS, JavaScript, and markup in one file) |
| `prototype/marketpos_retail_software/` | Design exports: one folder per screen, with HTML source and screenshot |

## Roadmap

The build order, from section 17 of the requirements specification:

1. Login
2. Sales screen
3. Offline testing
4. Mobile money
5. Z and X cash-desk closings
6. Stock management and reports

Offline synchronization is the main technical risk and is tracked as the `OF-*` requirements.

## Contributing

Feedback is welcome, especially from accountants familiar with Ivorian tax rules, POS vendors, and store operators. Many requirements are still waiting for external confirmation, so domain expertise is the most useful contribution at this stage.

When you change a document, update both the English and the French version in the same change.

## License

Not yet defined.
