import type { Category } from "@/types/category";
import type {
  GetProductsByCategoryParams,
  PaginatedCategoryProductsResponse,
  Product,
} from "@/types/product";
import { getCategoryBySlug } from "@/services/category.service";
import { getProductsByCategory, getProductsBySubcategory } from "@/services/product.service";
import { getSubcategories } from "@/services/subcategory.service";
import Link from "next/link";
import { notFound } from "next/navigation";
import CatalogWithFilters from "@/components/catalog/CatalogWithFilters";

type PageParams = { slug: string };
type PageSearchParams = Record<string, string | string[] | undefined>;

function getSingle(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function parseList(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  const arr = Array.isArray(value) ? value : value.split(",");
  return arr.map((v) => v.trim()).filter(Boolean);
}

function hasActiveFilters(params: GetProductsByCategoryParams): boolean {
  return Boolean(
    (params.q && params.q.trim()) ||
      params.minPrice != null ||
      params.maxPrice != null ||
      (params.tags && params.tags.length > 0) ||
      (params.features && params.features.length > 0),
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams> | PageParams;
  searchParams?: Promise<PageSearchParams> | PageSearchParams;
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = (await Promise.resolve(searchParams)) ?? {};
  const { slug } = resolvedParams;

  let category: Category;
  try {
    category = await getCategoryBySlug(slug, { cache: "no-store" });
  } catch {
    notFound();
  }

  const sortRaw = getSingle(resolvedSearchParams.sort);
  const allowedSorts = new Set(["popular", "newest", "price-asc", "price-desc", "name-asc"]);
  const sort = allowedSorts.has(sortRaw ?? "")
    ? (sortRaw as GetProductsByCategoryParams["sort"])
    : "popular";

  const queryParams: GetProductsByCategoryParams = {
    page: parsePositiveInt(getSingle(resolvedSearchParams.page), 1),
    limit: 12,
    sort,
    q: getSingle(resolvedSearchParams.q)?.trim() || undefined,
    minPrice: parseOptionalNumber(getSingle(resolvedSearchParams.minPrice)),
    maxPrice: parseOptionalNumber(getSingle(resolvedSearchParams.maxPrice)),
    tags: parseList(resolvedSearchParams.tags),
    features: parseList(resolvedSearchParams.features),
  };

  let catalogData: PaginatedCategoryProductsResponse;
  try {
    catalogData = await getProductsByCategory(category.id, queryParams, {
      cache: "no-store",
    });
  } catch {
    catalogData = {
      products: [],
      total: 0,
      totalPages: 0,
      page: queryParams.page ?? 1,
      limit: 12,
      meta: {
        priceBounds: { min: 0, max: 0, hasValidPrices: false, allSame: false },
        availableTags: [],
      },
    };
  }

  // "También te puede interesar": en la categoría principal, mostrar productos
  // de las subcategorías enlazadas a esta categoría (incluyendo todas las subcategorías).
  let recommendedProducts: Product[] = [];
  try {
    const linkedSubcategories = await getSubcategories(
      { categoryId: category.id },
      { cache: "no-store" },
    );
    if (linkedSubcategories.length > 0) {
      const results = await Promise.allSettled(
        linkedSubcategories.map((sub) =>
          getProductsBySubcategory(
            sub.id,
            { page: 1, limit: 8 },
            { cache: "no-store" },
          ),
        ),
      );

      const productLists = results
        .filter(
          (result): result is PromiseFulfilledResult<PaginatedCategoryProductsResponse> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value.products ?? []);

      // Mezcla round-robin para incluir productos de todas las subcategorías enlazadas.
      const seen = new Set<number>();
      let addedInRound = true;
      let index = 0;
      while (recommendedProducts.length < 12 && addedInRound) {
        addedInRound = false;
        for (const list of productLists) {
          const product = list[index];
          if (!product) continue;
          addedInRound = true;
          if (seen.has(product.id)) continue;
          seen.add(product.id);
          recommendedProducts.push(product);
          if (recommendedProducts.length >= 12) break;
        }
        index += 1;
      }
    }
  } catch {
    recommendedProducts = [];
  }

  const cmsBaseUrl =
    process.env.NEXT_PUBLIC_CMS_URL ?? process.env.CMS_URL ?? "";

  const filtersActive = hasActiveFilters(queryParams) || (queryParams.sort && queryParams.sort !== "popular");
  const noProductsInCategory =
    catalogData.total === 0 && !filtersActive && catalogData.meta.availableTags.length === 0 && !catalogData.meta.priceBounds.hasValidPrices;

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
      </header>

      <main className="w-full max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
        {noProductsInCategory ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No hay productos disponibles en esta categoría.
            </p>
          </div>
        ) : (
          <CatalogWithFilters
            products={catalogData.products}
            categoryName={category.name}
            cmsBaseUrl={cmsBaseUrl}
            total={catalogData.total}
            totalPages={catalogData.totalPages}
            page={catalogData.page}
            limit={catalogData.limit}
            priceBounds={catalogData.meta.priceBounds}
            availableTags={catalogData.meta.availableTags}
            recommendedProducts={recommendedProducts}
          />
        )}
      </main>
    </div>
  );
}
