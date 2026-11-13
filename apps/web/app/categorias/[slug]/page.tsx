import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { getCategoryBySlug } from "@/services/category.service";
import { getProductsByCategory } from "@/services/product.service";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";

const cmsUrl =
  process.env.NEXT_PUBLIC_CMS_URL ?? process.env.CMS_URL ?? "";

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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Obtener la categoría por slug
  let category: Category;
  try {
    category = await getCategoryBySlug(slug);
  } catch {
    notFound();
  }

  // Obtener los productos de la categoría
  let products: Product[] = [];
  try {
    products = await getProductsByCategory(category.id);
  } catch {
    products = [];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link
          href="/"
          className="text-gray-600 hover:text-purple-600 font-medium"
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No hay productos disponibles en esta categoría.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Productos ({products.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={category.name}
                  imageSrc={resolveImageUrl(product.imageUrl)}
                  index={index}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
