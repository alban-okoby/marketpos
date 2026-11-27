# Requirements Specification: MarketPOS (version 0.1)

[English](cahier-des-charges.md) · [Français](../fr/cahier-des-charges.md)

Status: draft. References: established vendors (EBP Point de Vente CI, Sage 100 Gestion commerciale via AB Soft Work, Odoo POS via local partners) and market research on Smartpos (see `smartpos-veille.md`).

Requirements are ranked by priority: **P1** = MVP, **P2** = phase 2, **P3** = later. Items marked "to be validated" (*à valider*) need confirmation before development.

## 1. Purpose

MarketPOS is point-of-sale and management software for grocery stores and supermarkets: sales, stock, cash-desk closing, mobile money payments, and local tax compliance.

## 2. Scope

- **In scope (MVP)**: cash register, cashiers and permissions, closing, stock, mobile money payments, basic reports.
- **Phase 2**: customers and credit, loyalty, supplier purchasing, SYSCOHADA accounting, full FNE invoicing.
- **Out of scope**: e-commerce, payroll, multi-country, self-checkout.

## 3. Actors

| Actor | Role |
|---|---|
| Cashier | Takes payments, applies discounts within their limit, closes their session |
| Manager | Authorizes sensitive actions, validates closings, views reports |
| Administrator | Configures products, VAT rates, users, and registers |
| Accountant | Views exports and journals |

## 4. Cash register (CA)

| ID | Requirement | Priority | Inspiration |
|---|---|---|---|
| CA-01 | Touchscreen checkout, search by name, internal code, or barcode | P1 | EBP, Smartpos |
| CA-02 | Customer display: each item, its price, the total, and promotions applied before payment | P1 | Smartpos |
| CA-03 | Weighed items with a connected scale, or a logged manual entry if the scale is down | P1 | Lotus Pecas |
| CA-04 | Unknown barcode: search the local catalogue, then offer to create an item record | P1 | Smartpos (unknown product lookup) |
| CA-05 | Split payment: cash, card, mobile money, several methods on one receipt | P1 | Business need |
| CA-06 | Change calculation; refuse an insufficient payment | P1 | Sage |
| CA-07 | Discount per line or per receipt, within the cashier's permission | P1 | EBP |
| CA-08 | Park and recall a receipt | P1 | EBP PRO |
| CA-09 | Returns and credit notes, always linked to an original receipt | P1 | Business need |
| CA-10 | Cancel a line or a receipt, with permission and an audit trail | P1 | Business need |
| CA-11 | Print 80 mm thermal receipts, reprint, open the cash drawer | P1 | Sage |
| CA-12 | Electronic receipt (e-ticket) sent to the customer by SMS or WhatsApp, optional | P2 | Smartpos |
| CA-13 | Continuous ticket numbering, no gaps, per register and per site | P1 | Business need (to be validated with FC-02) |
| CA-14 | Customer identification by phone number, showing loyalty balance | P2 | Smartpos |

## 5. Cashiers and permissions (US)

| ID | Requirement | Priority |
|---|---|---|
| US-01 | Individual login: identifiant and hashed password, with a hashed PIN kept for the manager's authorisations. Minimum password length is a setting. | P1 |
| US-02 | Per-action permissions: sale, discount, return, cancellation, opening, closing | P1 |
| US-03 | One-off authorization with the manager's PIN, with an audit trail | P1 |
| US-04 | Session expires after inactivity | P1 |
| US-05 | Opening float at session start, count at session end | P1 |

## 6. Closing (CL)

| ID | Requirement | Priority |
|---|---|---|
| CL-01 | X report: interim closing, counters not reset | P1 |
| CL-02 | Z report: end-of-day closing, counters reset, locked after validation | P1 |
| CL-03 | Difference between expected and counted cash; justification required above a threshold (to be defined) | P1 |
| CL-04 | A validated Z report cannot be edited. Corrections only through a correcting entry. | P1 |
| CL-05 | Closing report that can be printed and exported | P1 |

## 7. Stock (ST)

| ID | Requirement | Priority |
|---|---|---|
| ST-01 | Item record: name, internal code, multiple barcodes, category, supplier, purchase price, sale price, VAT, unit, reorder threshold | P1 |
| ST-02 | Automatic stock decrement on each sale | P1 |
| ST-03 | Manual stock outputs (breakage, expiry) with a reason | P1 |
| ST-04 | Stock inputs linked to a goods receipt note | P2 |
| ST-05 | Physical inventory by location, variance calculation, validation by the manager | P1 |
| ST-06 | Alerts: threshold reached, expiry date approaching (if recorded) | P1 |
| ST-07 | Stock valuation at weighted average cost (to be validated) | P2 |
| ST-08 | Multi-warehouse and transfers | P3 |

## 8. Mobile money (MM)

| ID | Requirement | Priority |
|---|---|---|
| MM-01 | A single aggregator: Orange Money, MTN MoMo, Moov Money, Wave (choice pending: CinetPay, PayDunya, KkiaPay) | P1 |
| MM-02 | Payment stays "pending" until a signed webhook confirmation is received | P1 |
| MM-03 | Daily reconciliation: amounts collected versus confirmed transactions | P1 |
| MM-04 | A given transaction reference can be collected only once | P1 |
| MM-05 | Alert to the manager if a transaction stays pending beyond a delay (to be defined) | P1 |

## 9. Offline mode and synchronization (OF)

| ID | Requirement | Priority |
|---|---|---|
| OF-01 | The register keeps selling without network, printing the receipt immediately | P1 |
| OF-02 | Offline sales are stored locally, then synchronized when the network returns | P1 |
| OF-03 | Each operation has a unique identifier, to prevent duplicates during synchronization | P1 |
| OF-04 | Queue visible to the manager (number of pending operations) | P1 |
| OF-05 | Stock conflict: the sale is accepted, stock goes negative, and an alert is raised | P1 |
| OF-06 | No validated sale is ever deleted by synchronization | P1 |

Success criterion: after a 2-hour network outage and 50 sales, all sales are present once the network returns, with no duplicates.

## 10. Tax compliance (FC)

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FC-01 | VAT rate per item. Standard Ivorian rate to be confirmed. | P1 | To be validated (chartered accountant) |
| FC-02 | Standardized electronic invoicing (FNE): transmission of each relevant invoice to the DGI, error handling, recovery mode | P1 | To be validated (DGI) |
| FC-03 | SYSCOHADA chart of accounts, export of sales, purchase, and cash entries | P2 | To be validated |
| FC-04 | Sales journal by VAT rate | P1 | To be validated |
| FC-05 | Archiving of receipts and invoices for the legal retention period | P1 | To be validated |

## 11. Reports (RP)

| ID | Requirement | Priority |
|---|---|---|
| RP-01 | Sales for the day, week, and month, by register, cashier, and payment method | P1 |
| RP-02 | Margin per item and per category | P2 |
| RP-03 | Best-selling and worst-selling items | P1 |
| RP-04 | Critical stock, stock-outs, stock value | P1 |
| RP-05 | Export to Excel and PDF | P1 |

## 12. Customers and loyalty (CF), phase 2

| ID | Requirement | Priority |
|---|---|---|
| CF-01 | Customer record: name, phone, optional loyalty card | P2 |
| CF-02 | Loyalty points and promotions per item, amount, or period | P2 |
| CF-03 | Customer consent recorded for data use (to be validated against Ivorian law) | P2 |
| CF-04 | Credit sales (tab) with a limit per customer and payment tracking | P2 |

## 13. Purchasing (AC), phase 2

| ID | Requirement | Priority |
|---|---|---|
| AC-01 | Supplier purchase order, partial or full receipt | P2 |
| AC-02 | Difference between ordered and received quantities, flagged | P2 |
| AC-03 | Purchase price history per supplier | P2 |

## 14. Non-functional requirements (NF)

| ID | Requirement | Priority |
|---|---|---|
| NF-01 | Scan one item in under 300 ms, with a catalogue of 20,000 items | P1 |
| NF-02 | Keep working during a power cut (UPS) and with local storage | P1 |
| NF-03 | Automatic daily backup, monthly restore test | P1 |
| NF-04 | Audit log of sensitive actions: discount, cancellation, return, closing, price change | P1 |
| NF-05 | French-language interface, amounts in FCFA without decimals | P1 |
| NF-06 | Updates without data loss, with rollback possible | P1 |
| NF-07 | Personal data protection compliant with Ivorian law (ARTCI, to be validated) | P1 |
| NF-08 | Reference hardware: mini-PC or tablet, customer display, scanner, 80 mm printer, cash drawer | P1 |

## 15. Reference hardware

- Checkout station: mini-PC (box format) or touch tablet, with cashier screen.
- Secondary customer display.
- Barcode scanner.
- 80 mm thermal printer with cash drawer.
- Connected scale (optional, P1).
- UPS (uninterruptible power supply).

## 16. Acceptance criteria

| Scenario | Expected result |
|---|---|
| Sale of 10 items, split payment cash and mobile money | Receipt printed, stock decremented, both methods recorded, customer display up to date |
| Unknown barcode | Offer to create an item record, no blocking of the register |
| 2-hour network outage, 50 sales | All sales present after reconnection, no duplicates |
| Discount above the cashier's permission | Refused, then accepted after the manager's PIN, with an audit trail |
| Z report with a 5,000 FCFA difference | Justification required, difference visible in the report |
| Edit a validated Z report | Refused; correction through a correcting entry only |
| Mobile money pending with no webhook | Receipt not validated, alert to the manager |

## 17. Build order

1. **Cashier login** (US-01, US-04).
2. **Sales screen** (CA-01, CA-02, CA-05, CA-06, CA-11): prototype delivered in `prototype/caisse/`.
3. **Offline test of the sales screen** (OF-01, OF-02, OF-03). Main risk, to be validated before adding anything else.
4. **Mobile money** (MM-01 to MM-04).
5. **X and Z closings** (CL-01 to CL-04).
6. **Stock** (ST-02 to ST-05), then **reports** (RP-01, RP-03, RP-04).

The prototype only covers step 2, in cash, without VAT, without a server, and without FNE.

## 18. Points to validate before development

1. FNE: terms, format, transmission, recovery mode (DGI).
2. VAT: rates applicable to food products, exemptions.
3. Tolerated cash-desk difference threshold.
4. Stock valuation method.
5. Ivorian legislation on data protection and consent.
6. Choice of mobile money aggregator, fees, and confirmation delays.
7. Vendor answers (EBP CI, AB Soft Work, Veone) to questions to ask them: FNE versions, mobile money, prices, grocery or supermarket customer references.
8. Smartpos: deployment outside France and Spain, technical stack, and offline mode (see `smartpos-veille.md`). Not enough public information; must be requested directly.
