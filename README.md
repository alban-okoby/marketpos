# MarketPOS

**English** · [Français](README.fr.md)

Point-of-sale (POS) and store-management software for supermarkets and grocery stores. The first target market is Côte d'Ivoire, with the rest of francophone West Africa to follow.

> **Status: early draft (v0.1).** Nothing has been validated yet with an accountant, the tax authority (DGI), or a store. Open points are marked *"à valider"* (to be validated) in the specifications.

## What it is

MarketPOS is an Angular progressive web app (PWA) that behaves like a desktop operating system: a lock screen with PIN login, a desktop with draggable windows, a taskbar and a start menu. Each business function is a module, and only the modules a shop needs are switched on.

Implemented so far:

- **Lock screen and session**: user choice, PIN entry (keyboard or touch), unlock transition.
- **Desktop**: wallpapers (built-in or your own image), accent colour, light, dark or automatic theme, date and time, taskbar at any screen edge, auto-hide.
- **Settings**: display, taskbar, modules (switch on what you need, with dependencies), with a search field.
- **Cashier**: search or scan an article, 200 test articles, cart, cash payment with change, 80 mm receipt, continuous numbering, stock updates, customer display in its own window.
- **Offline**: every sale has a unique id and waits in a queue until the server acknowledges it. The queue is shown in the Synchronisation window.
- **Cash closings**: X report (no reset), Z closing protected by the manager's PIN, cash gap with justification, rectifications instead of edits, printing and CSV export.
- **Alerts**: negative stock, failed synchronisation, cash gap, each open until acknowledged.

Still to build: mobile money, discounts, held sales, returns, stock and reports screens, a synchronisation server. The full plan is in the requirements specification.

## Running the application

Requirements: **Node.js 24** (or 22.22 and later).

```bash
cd app
npm install
npm run dev        # development server on http://localhost:4250, reachable on the local network
```

| Command | What it does |
|---------|--------------|
| `npm run dev` | Development server on port 4250, listening on all network interfaces |
| `npm start` | Development server on the default port 4200 |
| `npm test` | Unit tests (Vitest, through `ng test`) |
| `npm run build` | Production build in `app/dist/app/browser` |

Notes:

- The service worker (offline cache and automatic updates) runs only in **production builds**. In development, the app always loads the latest code.
- Demo PINs for testing: caissier1 = 1111, caissier2 = 2222, gérant = 9999. They are stored in plain text and must be replaced by hashed PINs before any real use.
- Settings and data are stored in the browser's `localStorage`. To reset the application, clear the site's stored data.

## Prototype (reference)

`prototype/caisse/index.html` is the original single-file sales-screen prototype. It needs no build and no server: open it in Chrome or Edge. It remains the reference for the sales logic that the Angular cashier screen reproduces.

Test PINs: caissier1 = 1111, caissier2 = 2222, gérant = 9999. Open `index.html?client=1` in a second window for the customer display.

## Known limitations

- No VAT (TVA) yet; the rate is not specified (FC-01).
- No synchronisation server: offline sales wait in the queue and an alert says so.
- Cash only: no mobile money, no split payment.
- No FNE (electronic invoice) integration.
- No scale (balance) integration.
- Printing relies on the browser's print dialog.
- Offline behaviour has not been tested on real networks.
- Demo PINs are in plain text.

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
| `app/` | Angular 22 PWA: the application |
| `app/src/app/core/` | Services: session, window manager, modules, theme, taskbar, wallpaper, alerts, clock |
| `app/src/app/shell/` | Lock screen, desktop, windows, taskbar, start menu |
| `app/src/app/apps/` | Modules: `caisse` (cashier), `cloture` (cash closings), `synchronisation`, `alertes`, `settings` |
| `app/public/` | Static assets: wallpapers, colour icons (Fluent Emoji), PWA manifest and icons |
| `docs/en/`, `docs/fr/` | Documentation, in English and French (same files in each folder) |
| `docs/references/` | Shared images used by the documentation |
| `prototype/caisse/index.html` | Original sales-screen prototype (single file) |
| `prototype/marketpos_retail_software/` | Design exports: one folder per screen |

## Testing

Run `npm test` in `app/` before each change. The suite covers the module dependency rules, the window manager, the session, the theme, the accent colour, the wallpaper, the taskbar settings, the cashier (catalogue, cart, sales, payment rules), the offline queue (acknowledgement, duplicates, offline behaviour) and the cash closings (justification, period reset, rectifications).

## Credits

Colour icons in the application come from [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) by Microsoft, licensed under the MIT License (see `app/public/icons/fluent/LICENSE`).

## Roadmap

Build order, from section 17 of the requirements specification:

1. Login: done
2. Sales screen: done (cash only)
3. Offline operation: sales are queued locally with unique ids; the server side is still to be built
4. Mobile money: waiting for the choice of payment aggregator (MM-01)
5. X and Z cash closings: done; the cash-gap threshold is still to be defined (CL-03)
6. Stock, then reports: to do

Offline synchronisation is the main technical risk and is tracked as the `OF-*` requirements.

## Contributing

Feedback is welcome, especially from accountants familiar with Ivorian tax rules, POS vendors, and store operators. Many requirements are still waiting for external confirmation, so domain expertise is the most useful contribution at this stage.

Before proposing a change, run `npm test` and `npm run build` in `app/`. When you change a document, update both the English and the French version in the same change.

## License

Not yet defined.
