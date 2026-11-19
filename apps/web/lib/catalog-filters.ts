import type { Product } from "@/types/product";

export type SortOption =
  | "popular"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc";

export type QuickPriceRangeId = "under-30000" | "30000-60000" | "over-60000";

export interface QuickPriceRange {
  id: QuickPriceRangeId;
  label: string;
  min: number;
  max: number;
  disabled: boolean;
}

export interface PriceBounds {
  /** Límite mínimo fijo del selector ($0 COP) */
  min: number;
  /** Límite máximo dinámico: precio más alto de la categoría */
  max: number;
  hasValidPrices: boolean;
  /** Indica si el selector no tiene rango ajustable (p. ej. máximo = 0) */
  allSame: boolean;
}

export interface FilterState {
  sort: SortOption;
  priceMin: number | null;
  priceMax: number | null;
  selectedTags: string[];
  selectedFeatures: string[];
  searchQuery: string;
}

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(value: number): string {
  if (!Number.isFinite(value)) return "";
  return COP_FORMATTER.format(value);
}

export function getValidPrice(product: Product): number | null {
  const price = (product as Product & { price?: unknown }).price;
  if (typeof price !== "number" || !Number.isFinite(price)) {
    return null;
  }
  return price;
}

export function calculatePriceBounds(products: Product[]): PriceBounds {
  const prices = products
    .map(getValidPrice)
    .filter((price): price is number => price !== null);

  if (prices.length === 0) {
    return { min: 0, max: 0, hasValidPrices: false, allSame: false };
  }

  const categoryMax = Math.max(...prices);
  return {
    min: 0,
    max: categoryMax,
    hasValidPrices: true,
    allSame: categoryMax === 0,
  };
}

export function clampPriceRange(
  min: number,
  max: number,
  bounds: PriceBounds,
): { min: number; max: number } {
  if (!bounds.hasValidPrices) return { min, max };
  let nextMin = Number.isFinite(min) ? min : bounds.min;
  let nextMax = Number.isFinite(max) ? max : bounds.max;
  nextMin = Math.min(Math.max(nextMin, bounds.min), bounds.max);
  nextMax = Math.min(Math.max(nextMax, bounds.min), bounds.max);
  if (nextMin > nextMax) {
    const tmp = nextMin;
    nextMin = nextMax;
    nextMax = tmp;
  }
  return { min: nextMin, max: nextMax };
}

export function getQuickPriceRanges(bounds: PriceBounds): QuickPriceRange[] {
  const base: Array<{ id: QuickPriceRangeId; label: string; min: number; max: number }> = [
    { id: "under-30000", label: "Hasta $30.000", min: 0, max: 30000 },
    { id: "30000-60000", label: "$30.000–$60.000", min: 30000, max: 60000 },
    { id: "over-60000", label: "Más de $60.000", min: 60000, max: Number.POSITIVE_INFINITY },
  ];

  if (!bounds.hasValidPrices) {
    return base.map((range) => ({ ...range, disabled: true }));
  }

  return base.map((range) => {
    const effectiveMin = Math.max(range.min, bounds.min);
    const effectiveMax = Math.min(range.max, bounds.max);
    const disabled = effectiveMin > effectiveMax;
    return {
      id: range.id,
      label: range.label,
      min: disabled ? bounds.min : effectiveMin,
      max: disabled ? bounds.max : effectiveMax,
      disabled,
    };
  });
}

export function extractAvailableTags(products: Product[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const product of products) {
    const values = [...(product.tags ?? []), ...(product.keywords ?? [])];
    for (const value of values) {
      if (typeof value !== "string") continue;
      const trimmed = value.trim();
      if (!trimmed) continue;
      const key = trimmed.toLocaleLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(trimmed);
    }
  }

  return result.sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
}

function productHasSelectedTag(product: Product, selectedTags: string[]): boolean {
  if (selectedTags.length === 0) return true;
  const selected = new Set(selectedTags.map((tag) => tag.toLocaleLowerCase()));
  const values = [...(product.tags ?? []), ...(product.keywords ?? [])];
  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim().toLocaleLowerCase();
    if (trimmed && selected.has(trimmed)) return true;
  }
  return false;
}

function productMatchesSelectedFeatures(
  product: Product,
  selectedFeatures: string[],
): boolean {
  if (selectedFeatures.length === 0) return true;
  // OR entre características seleccionadas disponibles
  return selectedFeatures.some((feature) => {
    if (feature === "new") return product.isNew === true;
    return false;
  });
}

function matchesPriceRange(
  product: Product,
  state: FilterState,
  bounds: PriceBounds,
): boolean {
  if (!bounds.hasValidPrices) return true;
  if (state.priceMin === null || state.priceMax === null) return true;
  const price = getValidPrice(product);
  if (price === null) return false;
  return price >= state.priceMin && price <= state.priceMax;
}

export function applyFiltersAndSort(
  products: Product[],
  state: FilterState,
  bounds: PriceBounds,
): Product[] {
  const withIndex = products.map((product, index) => ({ product, index }));
  const query = state.searchQuery.trim().toLocaleLowerCase();

  const filtered = withIndex.filter(({ product }) => {
    if (!matchesPriceRange(product, state, bounds)) return false;
    if (!productHasSelectedTag(product, state.selectedTags)) return false;
    if (!productMatchesSelectedFeatures(product, state.selectedFeatures)) return false;
    if (query) {
      const title = (product.title ?? "").toLocaleLowerCase();
      const isbn = (product.isbn ?? "").toLocaleLowerCase();
      if (!title.includes(query) && !isbn.includes(query)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (state.sort) {
      case "popular":
        return a.index - b.index; // conserva orden original recibido
      case "newest": {
        const da = Date.parse(a.product.createdAt);
        const db = Date.parse(b.product.createdAt);
        const ta = Number.isFinite(da) ? da : 0;
        const tb = Number.isFinite(db) ? db : 0;
        if (tb !== ta) return tb - ta;
        return a.index - b.index;
      }
      case "price-asc": {
        const pa = getValidPrice(a.product);
        const pb = getValidPrice(b.product);
        const va = pa === null ? Number.POSITIVE_INFINITY : pa;
        const vb = pb === null ? Number.POSITIVE_INFINITY : pb;
        if (va !== vb) return va - vb;
        return a.index - b.index;
      }
      case "price-desc": {
        const pa = getValidPrice(a.product);
        const pb = getValidPrice(b.product);
        const va = pa === null ? Number.NEGATIVE_INFINITY : pa;
        const vb = pb === null ? Number.NEGATIVE_INFINITY : pb;
        if (va !== vb) return vb - va;
        return a.index - b.index;
      }
      case "name-asc": {
        const cmp = (a.product.title ?? "").localeCompare(
          b.product.title ?? "",
          "es",
          { sensitivity: "base" },
        );
        if (cmp !== 0) return cmp;
        return a.index - b.index;
      }
      default:
        return a.index - b.index;
    }
  });

  return sorted.map(({ product }) => product);
}

export function createInitialFilterState(bounds: PriceBounds): FilterState {
  return {
    sort: "popular",
    priceMin: bounds.hasValidPrices ? 0 : null,
    priceMax: bounds.hasValidPrices ? bounds.max : null,
    selectedTags: [],
    selectedFeatures: [],
    searchQuery: "",
  };
}