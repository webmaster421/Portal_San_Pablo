"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import FilterSidebarContent from "./FilterSidebarContent";
import {
  applyFiltersAndSort,
  calculatePriceBounds,
  clampPriceRange,
  createInitialFilterState,
  extractAvailableTags,
  getQuickPriceRanges,
  type FilterState,
  type SortOption,
} from "@/lib/catalog-filters";

interface CatalogWithFiltersProps {
  products: Product[];
  categoryName?: string | null;
  cmsBaseUrl: string;
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

export default function CatalogWithFilters({
  products,
  categoryName,
  cmsBaseUrl,
}: CatalogWithFiltersProps) {
  const bounds = useMemo(() => calculatePriceBounds(products), [products]);
  const availableTags = useMemo(() => extractAvailableTags(products), [products]);
  const quickRanges = useMemo(() => getQuickPriceRanges(bounds), [bounds]);

  const [state, setState] = useState<FilterState>(() =>
    createInitialFilterState(bounds),
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const nextBounds = calculatePriceBounds(products);
    const nextAvailableTags = extractAvailableTags(products);
    const availableTagKeys = new Set(
      nextAvailableTags.map((tag) => tag.toLocaleLowerCase()),
    );

    setState((prev) => {
      let nextPriceMin = prev.priceMin;
      let nextPriceMax = prev.priceMax;

      if (!nextBounds.hasValidPrices) {
        nextPriceMin = null;
        nextPriceMax = null;
      } else {
        const prevMin = prev.priceMin ?? 0;
        const prevMax = prev.priceMax ?? nextBounds.max;
        const clamped = clampPriceRange(prevMin, prevMax, nextBounds);
        nextPriceMin = clamped.min;
        nextPriceMax = clamped.max;
      }

      const nextSelectedTags = prev.selectedTags.filter((tag) =>
        availableTagKeys.has(tag.toLocaleLowerCase()),
      );

      if (
        prev.priceMin === nextPriceMin &&
        prev.priceMax === nextPriceMax &&
        prev.selectedTags.length === nextSelectedTags.length &&
        prev.selectedTags.every(
          (tag, index) => tag === nextSelectedTags[index],
        )
      ) {
        return prev;
      }

      return {
        ...prev,
        priceMin: nextPriceMin,
        priceMax: nextPriceMax,
        selectedTags: nextSelectedTags,
      };
    });
  }, [products]);

  const filteredProducts = useMemo(
    () => applyFiltersAndSort(products, state, bounds),
    [products, state, bounds],
  );

  const updateState = (updater: (prev: FilterState) => FilterState) => {
    setState((prev) => updater(prev));
  };

  const handleSortChange = (sort: SortOption) => {
    updateState((prev) => ({ ...prev, sort }));
  };

  const handlePriceMinChange = (value: number) => {
    updateState((prev) => {
      if (!bounds.hasValidPrices) return prev;
      const max = prev.priceMax ?? bounds.max;
      const clamped = clampPriceRange(value, max, bounds);
      return { ...prev, priceMin: clamped.min, priceMax: clamped.max };
    });
  };

  const handlePriceMaxChange = (value: number) => {
    updateState((prev) => {
      if (!bounds.hasValidPrices) return prev;
      const min = prev.priceMin ?? bounds.min;
      const clamped = clampPriceRange(min, value, bounds);
      return { ...prev, priceMin: clamped.min, priceMax: clamped.max };
    });
  };

  const handleQuickRangeSelect = (min: number, max: number) => {
    updateState((prev) => {
      if (!bounds.hasValidPrices) return prev;
      const clamped = clampPriceRange(min, max, bounds);
      return { ...prev, priceMin: clamped.min, priceMax: clamped.max };
    });
  };

  const handleToggleTag = (tag: string) => {
    updateState((prev) => {
      const key = tag.toLocaleLowerCase();
      const exists = prev.selectedTags.some((t) => t.toLocaleLowerCase() === key);
      return {
        ...prev,
        selectedTags: exists
          ? prev.selectedTags.filter((t) => t.toLocaleLowerCase() !== key)
          : [...prev.selectedTags, tag],
      };
    });
  };

  const handleToggleFeature = (featureId: string) => {
    updateState((prev) => {
      const exists = prev.selectedFeatures.includes(featureId);
      return {
        ...prev,
        selectedFeatures: exists
          ? prev.selectedFeatures.filter((f) => f !== featureId)
          : [...prev.selectedFeatures, featureId],
      };
    });
  };

  const handleClearAll = () => {
    setState(createInitialFilterState(bounds));
  };

  const sidebarProps = {
    state,
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
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-4 lg:hidden">
        <p className="text-sm text-gray-700">
          {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"} encontrado{filteredProducts.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          Filtrar productos
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="hidden lg:block lg:w-[260px] lg:flex-shrink-0">
          <div className="border-r border-gray-200 pr-6">
            <FilterSidebarContent {...sidebarProps} />
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-6 hidden items-center justify-between lg:flex">
            <h2 className="text-lg font-semibold text-gray-900">
              Productos ({filteredProducts.length})
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={categoryName ?? product.categoryName}
                  imageSrc={resolveImageUrl(product.imageUrl, cmsBaseUrl)}
                  index={index}
                />
              ))}
            </div>
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
              <span className="text-sm font-medium text-gray-700">
                {filteredProducts.length} resultado{filteredProducts.length === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cerrar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <FilterSidebarContent {...sidebarProps} showClearButton={true} />
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