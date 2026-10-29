import Image from "next/image";
import Link from "next/link";

import {
  formatCopPrice,
  getProductCategoryName,
  getProductImageUrl,
  type CmsProduct,
} from "../../lib/cms";

type ProductCardProps = {
  product: CmsProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getProductImageUrl(product.image);
  const imageAlt =
    product.image && typeof product.image === "object" && product.image.alt
      ? product.image.alt
      : product.title;

  const categoryName = getProductCategoryName(product.category);
  const dimensions =
    product.dimensions?.width && product.dimensions?.height
      ? `${product.dimensions.width} × ${product.dimensions.height} cm`
      : null;

  return (
    <Link
      href={`/productos/${product.slug}`}
     className="group flex h-full flex-col overflow-hidden rounded-lg border border-transparent bg-white transition-colors hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
    >
      {/* Contenedor de portada: altura fija y compacta */}
      <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-52 lg:h-56">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-contain p-3 transition-transform duration-300 "
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <span className="text-xs text-gray-400">Sin portada</span>
          </div>
        )}

        {product.isNew ? (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Nuevo
          </span>
        ) : null}
      </div>

      {/* Datos del producto */}
      <div className="flex flex-1 flex-col gap-0.5 p-2.5 sm:p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 group-hover:text-gray-700">
          {product.title}
        </h3>

        {product.author ? (
          <p className="truncate text-xs text-gray-500">{product.author}</p>
        ) : null}

        {categoryName || dimensions ? (
          <p className="truncate text-[11px] text-gray-400">
            {[categoryName, dimensions].filter(Boolean).join(" · ")}
          </p>
        ) : null}

        <p className="mt-auto pt-1.5 text-sm font-bold text-gray-900">
          {formatCopPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}