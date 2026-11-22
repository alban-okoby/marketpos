/** An article on sale. Amounts are in FCFA without decimals. */
export interface Product {
  readonly code: string;
  readonly name: string;
  readonly price: number;
  readonly category: string;
  readonly stock: number;
}

type Seed = readonly [code: string, name: string, price: number, category: string];

/**
 * Named test articles, with indicative prices (not from a wholesaler). Same data as the prototype.
 */
export const SEED_PRODUCTS: readonly Seed[] = [
  ['6100000000001', 'Eau minérale 1,5 L', 500, 'Boissons'],
  ['6100000000002', "Jus d'orange 1 L", 1200, 'Boissons'],
  ['6100000000003', 'Sucre 1 kg', 800, 'Épicerie'],
  ['6100000000004', 'Huile végétale 1 L', 1500, 'Épicerie'],
  ['6100000000005', 'Riz parfumé 5 kg', 4500, 'Épicerie'],
  ['6100000000006', 'Lait en poudre 400 g', 2200, 'Laitier'],
  ['6100000000007', 'Pain de mie', 900, 'Boulangerie'],
  ['6100000000008', 'Savon de Marseille', 350, 'Hygiène'],
  ['6100000000009', 'Pâtes 500 g', 600, 'Épicerie'],
  ['6100000000010', 'Tomate concentrée 400 g', 500, 'Épicerie'],
  ['6100000000011', 'Bière 65 cl', 800, 'Boissons'],
  ['6100000000012', 'Savon liquide 1 L', 1800, 'Hygiène'],
  ['6100000000013', 'Biscuits 200 g', 350, 'Épicerie'],
  ['6100000000014', 'Yaourt nature', 250, 'Laitier'],
  ['6100000000015', 'Papier toilette x4', 1000, 'Hygiène'],
];

export const TEST_CATALOGUE_SIZE = 200;
const SEED_STOCK = 20;
const GENERATED_STOCK = 10;
const GENERATED_CATEGORIES = ['Épicerie', 'Boissons', 'Hygiène', 'Laitier'] as const;

/** Builds the test catalogue: the named articles, then generated ones up to TEST_CATALOGUE_SIZE. */
export function buildTestCatalogue(): Product[] {
  const seeded = SEED_PRODUCTS.map(([code, name, price, category]) => ({ code, name, price, category, stock: SEED_STOCK }));
  const generated: Product[] = [];
  for (let i = SEED_PRODUCTS.length + 1; i <= TEST_CATALOGUE_SIZE; i++) {
    const number = String(i).padStart(3, '0');
    generated.push({
      code: '6100000' + number.padStart(6, '0'),
      name: `Article test ${number}`,
      price: 100 * ((i % 25) + 1),
      category: GENERATED_CATEGORIES[i % GENERATED_CATEGORIES.length],
      stock: GENERATED_STOCK,
    });
  }
  return [...seeded, ...generated];
}

/** Categories in the order they first appear in the catalogue. */
export function categoriesOf(products: readonly Product[]): string[] {
  return [...new Set(products.map((product) => product.category))];
}

/** Matches a search on the name or the code, ignoring case and accents. */
export function matchesSearch(product: Product, term: string): boolean {
  const needle = normalize(term);
  if (!needle) {
    return true;
  }
  return normalize(product.name).includes(needle) || product.code.includes(needle);
}

/** Formats an amount in FCFA, such as "12 500 F". */
export function formatFcfa(amount: number): string {
  return `${Math.round(amount).toLocaleString('fr-FR').replace(/[  ]/g, ' ')} F`;
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Checks a stored catalogue before using it. Returns null when the data is not a valid catalogue. */
export function parseCatalogue(raw: unknown): Product[] | null {
  if (!Array.isArray(raw)) {
    return null;
  }
  const valid = raw.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.code === 'string' &&
      typeof item.name === 'string' &&
      typeof item.price === 'number' &&
      typeof item.category === 'string' &&
      typeof item.stock === 'number',
  );
  return valid ? (raw as Product[]) : null;
}
