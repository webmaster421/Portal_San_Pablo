"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

type ProductCardProduct = Product & {
  previousPrice?: number | null;
  originalPrice?: number | null;
  discountPercent?: number | null;
  rating?: number | null;
  reviewsCount?: number | null;
  reviewCount?: number | null;
  subcategory?: string | null;
  gender?: string | null;
  backgroundColor?: string | null;
  imageBackgroundColor?: string | null;
};

interface ProductCardProps {
  product: ProductCardProduct;
  categoryName?: string | null;
  subcategory?: string | null;
  imageSrc?: string | null;
  backgroundColor?: string | null;
  index?: number;
  onAddToCart?: (product: Product) => void;
  onWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL ?? "";

function resolveImageUrl(
  imageUrl: string | { url?: string | null } | null | undefined,
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

  return `${cmsUrl}${value.startsWith("/") ? "" : "/"}${value}`;
}

function formatPrice(price: number) {
  return `$${Math.round(price).toLocaleString("en-US")}`;
}

export default function ProductCard({
  product,
  categoryName,
  subcategory,
  imageSrc,
  backgroundColor,
  index,
  onAddToCart,
  onWishlist,
  onQuickView,
  onBuyNow,
}: ProductCardProps) {
  void backgroundColor;
  void index;
  void onWishlist;
  void onQuickView;
  void onBuyNow;

  const displaySubcategory =
    subcategory ??
    product.subcategory ??
    product.gender ??
    categoryName ??
    product.categoryName ??
    "";

  const resolvedImageSrc =
    imageSrc ??
    resolveImageUrl(
      product.imageUrl as unknown as string | { url?: string | null } | null,
    );

  return (
    <article className="group flex flex-col overflow-visible rounded-xl border border-gray-100 bg-white shadow-xs">
      <div className="relative aspect-square w-full rounded-t-xl border-b border-gray-100 bg-white">
        {resolvedImageSrc ? (
          <div className="h-full w-full p-4">
            <div className="relative h-full w-full">
              <Image
                src={resolvedImageSrc}
                alt={product.title}
                fill
                unoptimized
                className="object-contain transition-transform duration-300 group-hover:-rotate-2 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-sm text-gray-400">
            Sin imagen
          </div>
        )}

        <button
          type="button"
          aria-label="Añadir al carrito"
          onClick={() => onAddToCart?.(product)}
          className="absolute -bottom-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-400 shadow-md transition-colors hover:text-gray-800"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M3 3h2l.9 4.5M7 13h10l2.2-6.5H5.9M7 13L5.9 7.5M7 13l-1.2 5h12.4M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-3.5 pt-4">
        <Link href={`/productos/${product.slug}`} className="block">
          <h3 className="line-clamp-1 text-xs font-semibold text-slate-700 sm:text-sm">
            {product.title}
          </h3>
        </Link>

        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs font-normal text-gray-400">
            {displaySubcategory}
          </span>
          <span className="text-xs font-semibold text-slate-600 sm:text-sm">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </article>
  );
}
