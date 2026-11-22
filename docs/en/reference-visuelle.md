# Visual Reference: Checkout Screen (target style)

[English](reference-visuelle.md) · [Français](../fr/reference-visuelle.md)

Reference image: `../references/reference-caisse-grostore.jpg`. It is a mockup of an online grocery kit, with a brand name and placeholder data ("Popped Rice Special Chocolate", repeated prices). **We take the layout and style, not the brand, images, or texts.** The name stays MarketPOS.

## 1. Screen structure (top to bottom, left to right)

| Zone | Content | Note for MarketPOS |
|---|---|---|
| Header | Logo on the left, large search bar in the center (Ctrl+K shortcut), icons on the right (grid, light/dark theme, notifications, avatar) | Keep the central search bar. Icons: theme, notifications, cashier avatar. |
| Filter bar | Two segmented buttons (Categories, Brands), scroll arrows | For MarketPOS: "Categories" only, plus a "Department" field. |
| Category row | Horizontal cards: icon in a colored circle, name, item count. Active category in solid green. | Very good pattern for a cashier: one tap to filter. |
| Section title + local search | "New Grocery Products" on the left, search field and green "Search" button on the right | Title: "Articles" or "Produits du rayon". |
| Product grid (4 columns on desktop) | White cards, image on the left or top, name on two lines, price | Switch to 4 columns on a 1280 px tablet, 5 on a 1920 px screen. |
| Right panel "Billing Section" | Item code search + green "Add Item" button + orange "Clear Cart" button | Reuse as is. Add a "Customer" button next to it. |
| Cart lines | Thumbnail, name, − 2 + stepper, unit price, red delete button | The QTY, Price, and Delete columns are clear. Keep them readable. |
| Totals | Subtotal, product discount, additional discount, coupon discount, **Total** in bold | For MarketPOS: subtotal, discount, VAT (to be validated), **Total** in bold and larger. |
| Footer | Orange "Cancel Order" and green "Place Order" buttons, full width each | Replace with "Annuler la vente" (orange) and "Encaisser" (green). |

## 2. Style

- **Background**: very light gray (around #F4F5F7); the content area is white.
- **Cards**: white, rounded corners (around 10 px), very light shadow, no strong border.
- **Primary color**: green (around #4CAF50 to #56A846). Used for the active category, positive action buttons, and search buttons.
- **Alert and secondary action color**: orange (around #F5821F). Used for prices, cancel buttons, and the "Clear Cart" button.
- **Red**: reserved for deletion (trash icon).
- **Text**: charcoal black for titles, gray for secondary labels, prices in orange.
- **Typography**: geometric sans-serif, medium weight for names, bold for totals.
- **Icons**: thin line style, inside pastel circles for categories.
- **Dark theme**: available (moon icon at the top right). To keep for MarketPOS.

## 3. What must be improved for MarketPOS (absent from the reference)

1. **Large totals**: the total must be bigger than in the reference, readable from a distance (40 px and up).
2. **Checkout button**: in addition to the green color, show "F9" and the amount. It must be the most visible element on the screen.
3. **Sync status**: a permanent indicator (online or offline, number of pending sales). Absent from the reference.
4. **Touch target size**: the "− 2 +" buttons in the reference are small. For a checkout touchscreen, 44 px minimum.
5. **Customer display**: the reference has none. Keep it separate.
6. **Amounts**: space as thousands separator, no decimals, in FCFA. The reference uses "$".
7. **Data**: no product or coupon discounts in the MVP. Keep only "Discount" on the receipt, to avoid overload.

## 4. What we do not take

- The name "Grostore", the logo, and the avatar.
- The fruit and product images (unknown license, and real product photos will be needed).
- The placeholder texts and repeated prices.
- The "Brands" button and the category scroll arrows, which do not help the cashier.
