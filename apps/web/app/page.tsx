import {
  filterProductsByQuery,
  getCategories,
  getProducts,
  type CmsCategory,
  type CmsProduct,
} from "@/lib/cms";

import { ProductGrid } from "@/components/products/ProductGrid";
import { Header } from "@/components/layout/Header";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q } = await searchParams;
  const consulta = q?.trim() ?? "";

  let categories: CmsCategory[] = [];
  let categoriesError = false;
  let products: CmsProduct[] = [];
  let productsError = false;

  try {
    categories = await getCategories();
  } catch (error) {
    console.error("No se pudieron cargar las categorías desde el CMS:", error);
    categoriesError = true;
  }

  try {
    const todos = await getProducts();
    products = filterProductsByQuery(todos, consulta);
  } catch (error) {
    console.error("No se pudieron cargar los productos desde el CMS:", error);
    productsError = true;
  }

  return (
    <>
      <Header />
      <main className="px-4 pt-4 pb-8 md:px-6 md:pt-6">
        <section className={consulta ? "" : "mt-6"}>
          {consulta ? (
            <div className="mb-4">
              <h1 className="text-lg font-semibold text-sky-950">
                Resultados para &laquo;&nbsp;{consulta}&nbsp;&raquo;
              </h1>
              <p className="text-sm text-sky-800/70">
                {products.length === 1
                  ? "1 producto encontrado"
                  : `${products.length} productos encontrados`}
              </p>
            </div>
          ) : null}

          {productsError ? (
            <p>
              No se pudieron cargar los productos. Comprueba que el CMS esté
              disponible en http://localhost:3001.
            </p>
          ) : products.length === 0 ? (
            <p className="rounded-lg border border-dashed border-sky-200 bg-sky-50 p-8 text-center text-sm text-sky-800/70">
              {consulta
                ? "No encontramos productos con ese término."
                : "Todavía no hay productos publicados disponibles."}
            </p>
          ) : (
            <ProductGrid products={products} />
          )}
        </section>
      </main>
    </>
  );
}
