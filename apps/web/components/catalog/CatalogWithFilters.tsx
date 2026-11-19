"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/types/product";
import type { CategoryProductsPriceBounds } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import FilterSidebarContent from "./FilterSidebarContent";
import RecommendedProductsCarousel from "./RecommendedProductsCarousel";
import {
  clampPriceRange,
  formatCOP,
  getQuickPriceRanges,
  type FilterState,
  type PriceBounds,
  type SortOption,
} from "@/lib/catalog-filters";

interface CatalogWithFiltersProps {
  products: Product[];
  categoryName?: string | null;
  cmsBaseUrl: string;
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  priceBounds: CategoryProductsPriceBounds;
  availableTags: string[];
}

function resolveImageUrl(
  imageUrl: string | { url?: string | null } | null | undefined,
  cmsBaseUrl: string,
): string | null {
  const raw =
    typeof imageUrl === "string"
      ? imageUrl
      : imageUrl && typeof imageUrl === "object" && "url" in imageUrl
        ? imageUrl.url
        : null;

  if (!raw || typeof raw !== "string") return null;

  const value = raw.trim();
  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${cmsBaseUrl}${value.startsWith("/") ? "" : "/"}${value}`;
}

function parseSort(value: string | null): SortOption {
  switch (value) {
    case "newest":
    case "price-asc":
    case "price-desc":
    case "name-asc":
    case "popular":
      return value;
    default:
      return "popular";
  }
}

function parseNumberParam(value: string | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function parseListParam(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function buildQueryString(params: {
  page?: number;
  sort?: SortOption;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  features?: string[];
}): string {
  const sp = new URLSearchParams();
  const page = params.page && params.page > 1 ? params.page : undefined;
  if (page) sp.set("page", String(page));
  if (params.sort && params.sort !== "popular") sp.set("sort", params.sort);
  if (params.q && params.q.trim()) sp.set("q", params.q.trim());
  if (typeof params.minPrice === "number" && Number.isFinite(params.minPrice)) {
    sp.set("minPrice", String(params.minPrice));
  }
  if (typeof params.maxPrice === "number" && Number.isFinite(params.maxPrice)) {
    sp.set("maxPrice", String(params.maxPrice));
  }
  if (params.tags && params.tags.length > 0) sp.set("tags", params.tags.join(","));
  if (params.features && params.features.length > 0) sp.set("features", params.features.join(","));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    if (start > 2) pages.push("ellipsis");
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  };

  const pages = getPages();

  return (
    <nav className="mt-8 flex items-center justify-center gap-1 sm:gap-2" aria-label="Paginación">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Anterior
      </button>
      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          p === "ellipsis" ? (
            <span key={`e-${idx}`} className="px-2 text-gray-500 select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              disabled={disabled}
              aria-current={p === page ? "page" : undefined}
              className={`min-w-[36px] h-9 rounded-lg border text-sm font-medium transition-colors ${
                p === page
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              } disabled:cursor-not-allowed`}
            >
              {p}
            </button>
          ),
        )}
      </div>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    </nav>
  );
}

export default function CatalogWithFilters({
  products,
  categoryName,
  cmsBaseUrl,
  total,
  totalPages,
  page,
  limit,
  priceBounds,
  availableTags,
}: CatalogWithFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const bounds: PriceBounds = useMemo(
    () => ({
      min: 0,
      max: priceBounds.hasValidPrices ? priceBounds.max : 0,
      hasValidPrices: priceBounds.hasValidPrices,
      allSame: priceBounds.allSame,
    }),
    [priceBounds],
  );
  const quickRanges = useMemo(() => getQuickPriceRanges(bounds), [bounds]);

  const urlSort = parseSort(searchParams.get("sort"));
  const urlQ = (searchParams.get("q") ?? "").trim();
  const urlMin = parseNumberParam(searchParams.get("minPrice"));
  const urlMax = parseNumberParam(searchParams.get("maxPrice"));
  const urlTags = parseListParam(searchParams.get("tags"));
  const urlFeatures = parseListParam(searchParams.get("features"));

  const effectiveMin =
    bounds.hasValidPrices && urlMin != null ? Math.max(0, Math.min(urlMin, bounds.max)) : bounds.hasValidPrices ? 0 : null;
  const effectiveMax =
    bounds.hasValidPrices && urlMax != null ? Math.max(0, Math.min(urlMax, bounds.max)) : bounds.hasValidPrices ? bounds.max : null;
  const clamped = bounds.hasValidPrices && effectiveMin != null && effectiveMax != null
    ? clampPriceRange(effectiveMin, effectiveMax, bounds)
    : { min: effectiveMin, max: effectiveMax };

  const [sliderMin, setSliderMin] = useState<number | null>(clamped.min);
  const [sliderMax, setSliderMax] = useState<number | null>(clamped.max);
  const [searchInput, setSearchInput] = useState(urlQ);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSliderMin(clamped.min);
    setSliderMax(clamped.max);
  }, [clamped.min, clamped.max, bounds.max, bounds.hasValidPrices]);

  useEffect(() => {
    setSearchInput(urlQ);
  }, [urlQ]);

  const sidebarState: FilterState = {
    sort: urlSort,
    priceMin: sliderMin,
    priceMax: sliderMax,
    selectedTags: urlTags,
    selectedFeatures: urlFeatures,
    searchQuery: searchInput,
  };

  const navigateWith = (updates: {
    page?: number;
    sort?: SortOption;
    q?: string;
    minPrice?: number | null;
    maxPrice?: number | null;
    tags?: string[];
    features?: string[];
  }, options?: { resetPage?: boolean }) => {
    const nextPage = options?.resetPage ? 1 : (updates.page ?? page);
    const nextSort = updates.sort ?? urlSort;
    const nextQ = updates.q !== undefined ? updates.q : urlQ;
    const nextMin = updates.minPrice !== undefined ? updates.minPrice : (urlMin ?? null);
    const nextMax = updates.maxPrice !== undefined ? updates.maxPrice : (urlMax ?? null);
    const nextTags = updates.tags ?? urlTags;
    const nextFeatures = updates.features ?? urlFeatures;

    const qs = buildQueryString({
      page: nextPage,
      sort: nextSort,
      q: nextQ || undefined,
      minPrice: nextMin ?? undefined,
      maxPrice: nextMax ?? undefined,
      tags: nextTags,
      features: nextFeatures,
    });
    const href = `${pathname}${qs}`;
    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  };

  const handleSortChange = (sort: SortOption) => {
    navigateWith({ sort, page: 1 }, { resetPage: true });
  };

  const handlePriceMinChange = (value: number) => {
    if (!bounds.hasValidPrices) return;
    const max = sliderMax ?? bounds.max;
    const c = clampPriceRange(value, max, bounds);
    setSliderMin(c.min);
    setSliderMax(c.max);
  };

  const handlePriceMaxChange = (value: number) => {
    if (!bounds.hasValidPrices) return;
    const min = sliderMin ?? 0;
    const c = clampPriceRange(min, value, bounds);
    setSliderMin(c.min);
    setSliderMax(c.max);
  };

  const commitPriceFilter = () => {
    if (!bounds.hasValidPrices) return;
    const min = sliderMin ?? 0;
    const max = sliderMax ?? bounds.max;
    // If full range selected, omit params to keep URL clean
    const isFull = Math.abs(min - 0) < 0.0001 && Math.abs(max - bounds.max) < 0.0001;
    navigateWith(
      { minPrice: isFull ? null : min, maxPrice: isFull ? null : max, page: 1 },
      { resetPage: true },
    );
  };

  const handleQuickRangeSelect = (min: number, max: number) => {
    if (!bounds.hasValidPrices) return;
    const c = clampPriceRange(min, max, bounds);
    setSliderMin(c.min);
    setSliderMax(c.max);
    const isFull = Math.abs(c.min - 0) < 0.0001 && Math.abs(c.max - bounds.max) < 0.0001;
    navigateWith(
      { minPrice: isFull ? null : c.min, maxPrice: isFull ? null : c.max, page: 1 },
      { resetPage: true },
    );
  };

  const handleToggleTag = (tag: string) => {
    const key = tag.toLocaleLowerCase();
    const exists = urlTags.some((t) => t.toLocaleLowerCase() === key);
    const next = exists
      ? urlTags.filter((t) => t.toLocaleLowerCase() !== key)
      : [...urlTags, tag];
    navigateWith({ tags: next, page: 1 }, { resetPage: true });
  };

  const handleToggleFeature = (featureId: string) => {
    const exists = urlFeatures.includes(featureId);
    const next = exists ? urlFeatures.filter((f) => f !== featureId) : [...urlFeatures, featureId];
    navigateWith({ features: next, page: 1 }, { resetPage: true });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      navigateWith({ q: value.trim(), page: 1 }, { resetPage: true });
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const handleClearAll = () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setSearchInput("");
    setSliderMin(bounds.hasValidPrices ? 0 : null);
    setSliderMax(bounds.hasValidPrices ? bounds.max : null);
    navigateWith(
      { sort: "popular", q: "", minPrice: null, maxPrice: null, tags: [], features: [], page: 1 },
      { resetPage: true },
    );
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || (totalPages > 0 && nextPage > totalPages)) return;
    navigateWith({ page: nextPage });
  };

  const sidebarProps = {
    state: sidebarState,
    bounds,
    availableTags,
    quickRanges,
    onSortChange: handleSortChange,
    onPriceMinChange: handlePriceMinChange,
    onPriceMaxChange: handlePriceMaxChange,
    onQuickRangeSelect: handleQuickRangeSelect,
    onToggleTag: handleToggleTag,
    onToggleFeature: handleToggleFeature,
    onClearAll: handleClearAll,
    onPriceCommit: commitPriceFilter,
  };

  const countLabel = `${total} producto${total === 1 ? "" : "s"} encontrado${total === 1 ? "" : "s"}`;

  return (
    <div className="w-full relative">
      {isPending && (
        <div className="absolute inset-0 z-10 bg-white/50 flex items-start justify-center pt-24 pointer-events-none" aria-hidden="true">
          <div className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
            Cargando...
          </div>
        </div>
      )}

      <div className="mb-4 space-y-3 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-700">{countLabel}</p>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Filtrar productos
          </button>
        </div>
        <input
          type="search"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar por nombre o ISBN"
          aria-label="Buscar productos por nombre o ISBN"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="hidden lg:block lg:w-[260px] lg:flex-shrink-0">
          <div className="border-r border-gray-200 pr-6">
            <FilterSidebarContent {...sidebarProps} />
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-6 hidden lg:flex lg:items-center lg:justify-between lg:gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Productos ({total})</h2>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por nombre o ISBN"
              aria-label="Buscar productos por nombre o ISBN"
              className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white py-16 px-6 text-center">
              <p className="text-gray-700 text-base font-medium">
                No encontramos productos con los filtros seleccionados.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Prueba ajustar o limpiar los filtros para ver más resultados.
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                Limpiar todo
              </button>
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${isPending ? "opacity-70" : ""}`}>
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={categoryName ?? product.categoryName}
                    imageSrc={resolveImageUrl(product.imageUrl, cmsBaseUrl)}
                    index={index}
                  />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                disabled={isPending}
              />
              <RecommendedProductsCarousel
                products={products}
                categoryName={categoryName}
                cmsBaseUrl={cmsBaseUrl}
              />
            </>
          )}
        </section>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-[320px] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <span className="text-sm font-medium text-gray-700">{countLabel}</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cerrar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <FilterSidebarContent {...sidebarProps} showClearButton={false} />
            </div>
            <div className="border-t border-gray-200 p-4 flex gap-3">
              <button
                type="button"
                onClick={handleClearAll}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                Limpiar todo
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
