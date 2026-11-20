"use client";

import { useRef } from "react";
import type { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";

interface RecommendedProductsCarouselProps {
  products: Product[];
  categoryName?: string | null;
  cmsBaseUrl: string;
  title?: string;
  headerLayout?: "default" | "title-start-line";
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

/**
 * Selección inicial de recomendaciones a partir de productos disponibles.
 * Preparada para reemplazarse por una integración futura con CMS/API.
 */
function getRecommendedProducts(products: Product[], limit = 8): Product[] {
  if (!Array.isArray(products) || products.length === 0) return [];
  // Lógica temporal: tomar productos disponibles (sin inventar datos).
  return products.slice(0, limit);
}

export default function RecommendedProductsCarousel({
  products,
  categoryName,
  cmsBaseUrl,
  title = "También te puede interesar",
  headerLayout = "default",
}: RecommendedProductsCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const recommended = getRecommendedProducts(products, 8);

  if (recommended.length === 0) return null;

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.8, 240);
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const navButtons = (
    <div className="hidden sm:flex items-center gap-2">
      <button
        type="button"
        onClick={() => scrollByAmount("left")}
        aria-label="Ver productos anteriores"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12.5 4.5L7 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => scrollByAmount("right")}
        aria-label="Ver más productos"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M7.5 4.5L13 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );

  return (
    <section
      className={headerLayout === "title-start-line" ? "mt-4 pt-2" : "mt-4 pt-4 border-t border-gray-200"}
      aria-label={title}
    >
      {headerLayout === "title-start-line" ? (
        <div className="mb-4 flex items-center gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 whitespace-nowrap">{title}</h2>
          <div className="h-px flex-1 bg-gray-200" />
          {navButtons}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
          {navButtons}
        </div>
      )}

      <div
        ref={scrollerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {recommended.map((product, index) => (
          <div
            key={product.id}
            className="snap-start shrink-0 w-[72%] min-[420px]:w-[55%] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(20%-19.2px)]"
          >
            <ProductCard
              product={product}
              categoryName={categoryName ?? product.categoryName}
              imageSrc={resolveImageUrl(product.imageUrl, cmsBaseUrl)}
              index={index}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
