# Market Watch: Smartpos (Carrefour's in-house POS)

[English](smartpos-veille.md) · [Français](../fr/smartpos-veille.md)

Last updated: 2026-11-17. Sources are mainly from 2021-2022: the current deployment is not confirmed.

## 1. What we know (sourced)

| Element | Detail | Source |
|---|---|---|
| Nature | Point-of-sale system developed in-house by Carrefour, named "Smartpos" or "Smart PoS" | [lineaires.com](https://www.lineaires.com/la-distribution/smartpos-le-nouveau-systeme-de-caisses-de-carrefour), [Twitter Carrefour News](https://twitter.com/news_carrefour/status/1387416219003801605) |
| Intended scope | 67,000 points of sale worldwide, eventually | Lineaires, trade show photo |
| Development model | In-house, based on the existing checkout system. "Inner sourcing" involving developers from several countries. | Lineaires |
| Open source | Claimed by one source ("developed as Open Source"), not mentioned by Lineaires | to be confirmed |
| Hardware | "Light hardware" the size of an internet box (mini-PC). Part of the system runs in the cloud. | Lineaires |
| Customer display | Customer screen that shows each scanned item and indicates in real time whether the promotion is applied | Lineaires, Horizons |
| Promotions | Promotions and loyalty applied in store in real time | Horizons (not accessible at the time of research) |
| Unknown products | If a barcode is not recognized, the group database (Data Lake) is queried to find the product and its price | Lineaires |
| Customer without card | Customer can be identified without a loyalty card, with points displayed | Horizons (via search) |
| Digital receipt | Electronic receipt on request (e-ticket) | Twitter Carrefour News |
| Loyalty and consent | Loyalty program sign-up flow, data consent collection, feeds Carrefour Links | Lineaires |
| Data | Connected to the group's Data Lake (close to 8 billion data points) | Lineaires |
| Deployment | First test planned in France in 2022, in a few pilot stores. A preliminary version runs in Spain (secondary source). | Lineaires, secondary sources |
| Omnichannel | Presented as a tool linking in-store journey and e-commerce (online orders paid at checkout). | Secondary sources |

## 2. What we don't know

- The actual deployment: how many registers are equipped today, and in which countries.
- The exact list of functions (discounts, returns, cancellations, closings, scale, cash, card).
- Supported payment methods, and integration with payment terminals.
- The technical stack (language, database, offline mode).
- Behavior during a network outage.
- Tax compliance: Smartpos is designed for France and Spain, not for Ivorian tax rules (FNE, SYSCOHADA).
- The cost, and whether Carrefour plans to sell it to other retailers.

## 3. What the trade show photo shows (Lineaires, 2021)

- A cashier touchscreen with a numeric keypad, a list of items, a "Catalogue" button, and a total at the bottom.
- A smaller customer screen showing "0,00 €" and a promotion image.
- A barcode scanner.
- A black mini-PC placed under the screen, with no traditional checkout unit.
- A full shopping basket in front of the hardware, to illustrate the customer journey.
- The banner reads "In-house omnichannel check-out system prototype · 67,000 points of sale worldwide".

This prototype shows a lightweight architecture: one central unit, a cashier screen, a customer screen, a scanner. No drawer is visible in the photo.

## 4. What MarketPOS can take from it

1. **Customer display**: show each item and its price, and the promotions applied before payment. A strong sales argument for a grocery store.
2. **Lightweight architecture**: one mini-PC per register, with screens and scanner as peripherals. Reduces hardware cost.
3. **Central product repository**: a shared database that answers unknown codes. For a grocery store, this could be the catalogue of the vendor or wholesaler.
4. **Loyalty built into the checkout flow**, with recorded customer consent. To be adapted to Ivorian data protection requirements (to be validated).
5. **Electronic receipt**: useful to reduce paper, but in Côte d'Ivoire the paper receipt and the FNE invoice still need to be confirmed.
6. **Omnichannel**: for a grocery store, the most accessible option is a phone or WhatsApp order paid at checkout. The rest (click & collect, e-commerce) later.

## 5. What not to copy

- The "group Data Lake" model: a grocery store does not have that volume or that infrastructure.
- Mandatory cloud: the register must work offline, and Smartpos does not document this point.
- Smartphone scan-and-go technology and cashierless stores: they require an investment and adoption that the Ivorian market does not have yet.

## 6. Open questions to investigate

1. Is Smartpos already deployed outside France and Spain (Africa, Middle East)? Carrefour is present in Africa through franchises or partners.
2. What is the technical stack? Sources mention "open source" without detail.
3. How does the offline mode work?
4. Which integration with a mobile money payment terminal?

These questions cannot be answered with public sources. They require a direct request to Carrefour, or an interview with a former integrator of the project.
