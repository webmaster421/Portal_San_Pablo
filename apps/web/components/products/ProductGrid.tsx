
import type { CmsProduct } from "../../lib/cms";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: CmsProduct[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <p className="text-gray-500">
          No hay productos publicados disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 justify-items-center gap-x-2 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {products.map((product) => (
        <div key={product.id} className="w-full max-w-[275px]">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
