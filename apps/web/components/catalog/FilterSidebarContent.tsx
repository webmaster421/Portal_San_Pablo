"use client";

import { useId, type ChangeEvent } from "react";
import type { FilterState, PriceBounds, QuickPriceRange, SortOption } from "@/lib/catalog-filters";
import { formatCOP } from "@/lib/catalog-filters";

interface FeatureOption {
  id: string;
  label: string;
  available: boolean;
  note?: string;
}

const FEATURE_OPTIONS: FeatureOption[] = [
  { id: "new", label: "Novedades", available: true },
  { id: "bestsellers", label: "Más vendidos", available: false, note: "No disponible: falta información de ventas." },
  { id: "recommended", label: "Recomendados", available: false, note: "No disponible: falta un campo equivalente." },
  { id: "offers", label: "Ofertas", available: false, note: "No disponible: falta información de descuentos." },
];

interface FilterSidebarContentProps {
  state: FilterState;
  bounds: PriceBounds;
  availableTags: string[];
  quickRanges: QuickPriceRange[];
  onSortChange: (sort: SortOption) => void;
  onPriceMinChange: (value: number) => void;
  onPriceMaxChange: (value: number) => void;
  onQuickRangeSelect: (min: number, max: number) => void;
  onToggleTag: (tag: string) => void;
  onToggleFeature: (featureId: string) => void;
  onClearAll: () => void;
  showClearButton?: boolean;
}

export default function FilterSidebarContent({
  state,
  bounds,
  availableTags,
  quickRanges,
  onSortChange,
  onPriceMinChange,
  onPriceMaxChange,
  onQuickRangeSelect,
  onToggleTag,
  onToggleFeature,
  onClearAll,
  showClearButton = true,
}: FilterSidebarContentProps) {
  const uid = useId();
  const sortId = `${uid}-catalog-sort`;
  const minRangeId = `${uid}-price-min-range`;
  const maxRangeId = `${uid}-price-max-range`;

  const priceDisabled = !bounds.hasValidPrices;
  const sliderDisabled = priceDisabled || bounds.allSame;

  const handleMinRange = (e: ChangeEvent<HTMLInputElement>) => {
    if (priceDisabled) return;
    const value = Number(e.target.value);
    if (!Number.isFinite(value)) return;
    const currentMax = state.priceMax ?? bounds.max;
    onPriceMinChange(Math.min(value, currentMax));
  };

  const handleMaxRange = (e: ChangeEvent<HTMLInputElement>) => {
    if (priceDisabled) return;
    const value = Number(e.target.value);
    if (!Number.isFinite(value)) return;
    const currentMin = state.priceMin ?? bounds.min;
    onPriceMaxChange(Math.max(value, currentMin));
  };

  const currentMin = state.priceMin ?? (bounds.hasValidPrices ? 0 : 0);
  const currentMax = state.priceMax ?? (bounds.hasValidPrices ? bounds.max : 0);
  const rangeDenom = bounds.max > 0 ? bounds.max : 1;
  const minPercent = Math.min(100, Math.max(0, (currentMin / rangeDenom) * 100));
  const maxPercent = Math.min(100, Math.max(0, (currentMax / rangeDenom) * 100));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Filtrar productos</h2>
        {showClearButton && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <section className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Ordenar por</h3>
        <label className="sr-only" htmlFor={sortId}>Ordenar por</label>
        <select
          id={sortId}
          value={state.sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="popular">Popular</option>
          <option value="newest">Más recientes</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="name-asc">Nombre: A-Z</option>
        </select>
      </section>

      <section className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Precio</h3>
        {priceDisabled ? (
          <p className="text-sm text-gray-500">No hay precios válidos disponibles para filtrar.</p>
        ) : (
          <div className="space-y-4">
            <div className="pt-1">
              <div className="relative h-6">
                <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-200" />
                <div
                  className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-900"
                  style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                />
                <label className="sr-only" htmlFor={minRangeId}>Precio mínimo</label>
                <input
                  id={minRangeId}
                  type="range"
                  min={0}
                  max={bounds.max}
                  step={bounds.allSame ? 1 : "any"}
                  value={currentMin}
                  onChange={handleMinRange}
                  disabled={sliderDisabled}
                  aria-label="Precio mínimo"
                  className="absolute inset-0 h-6 w-full cursor-pointer appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ zIndex: currentMin >= bounds.max ? 5 : 3 }}
                />
                <label className="sr-only" htmlFor={maxRangeId}>Precio máximo</label>
                <input
                  id={maxRangeId}
                  type="range"
                  min={0}
                  max={bounds.max}
                  step={bounds.allSame ? 1 : "any"}
                  value={currentMax}
                  onChange={handleMaxRange}
                  disabled={sliderDisabled}
                  aria-label="Precio máximo"
                  className="absolute inset-0 h-6 w-full cursor-pointer appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ zIndex: 4 }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-900">
              <span>{formatCOP(currentMin)}</span>
              <span>{formatCOP(currentMax)}</span>
            </div>
            {bounds.allSame && (
              <p className="text-xs text-gray-500">El rango de precios no es ajustable para esta categoría.</p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {quickRanges.map((range) => {
                const isActive =
                  !range.disabled &&
                  state.priceMin !== null &&
                  state.priceMax !== null &&
                  Math.abs(state.priceMin - range.min) < 0.0001 &&
                  Math.abs(state.priceMax - range.max) < 0.0001;
                return (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => !range.disabled && onQuickRangeSelect(range.min, range.max)}
                    disabled={range.disabled}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      range.disabled
                        ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                        : isActive
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-300 text-gray-700 bg-white hover:border-gray-400"
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Temas y etiquetas</h3>
        {availableTags.length === 0 ? (
          <p className="text-sm text-gray-500">No hay etiquetas disponibles</p>
        ) : (
          <div className="space-y-2">
            {availableTags.map((tag) => {
              const checked = state.selectedTags.some(
                (t) => t.toLocaleLowerCase() === tag.toLocaleLowerCase(),
              );
              return (
                <label key={tag} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleTag(tag)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                  />
                  <span className={checked ? "font-medium text-gray-900" : ""}>{tag}</span>
                </label>
              );
            })}
          </div>
        )}
      </section>

      
    </div>
  );
}