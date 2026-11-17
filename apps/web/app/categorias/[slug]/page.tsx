import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { getCategoryBySlug } from "@/services/category.service";
import { getProductsByCategory } from "@/services/product.service";
import Link from "next/link";
import { notFound } from "next/navigation";
import CatalogWithFilters from "@/components/catalog/CatalogWithFilters";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Obtener la categoría por slug (NestJS)
  let category: Category;
  try {
    category = await getCategoryBySlug(slug);
  } catch {
    notFound();
  }

  // Obtener los productos de la categoría (NestJS)
  let products: Product[] = [];
  try {
    products = await getProductsByCategory(category.id);
  } catch {
    products = [];
  }

  const cmsBaseUrl =
    process.env.NEXT_PUBLIC_CMS_URL ?? process.env.CMS_URL ?? "";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link
          href="/"
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Volver al inicio
        </Link>
      </nav>

      <header className="bg-white border-b border-gray-200 px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 mt-1">{category.description}</p>
        )}
      </header>

      <main className="w-full max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No hay productos disponibles en esta categoría.
            </p>
          </div>
        ) : (
          <CatalogWithFilters
            products={products}
            categoryName={category.name}
            cmsBaseUrl={cmsBaseUrl}
          />
        )}
      </main>
    </div>
  );
}
