import type {
  GetProductsByCategoryParams,
  PaginatedCategoryProductsResponse,
  Product,
} from "../types/product";
import { apiFetch } from "./api-client";

/**
 * Obtiene todos los productos publicados y visibles para el catálogo público.
 *
 * Llama a `GET /api/v1/products` de la API central de NestJS.
 */
export async function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/api/v1/products");
}

/**
 * Obtiene un producto por su slug.
 *
 * Llama a `GET /api/v1/products/slug/:slug` de la API central de NestJS.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return apiFetch<Product | null>(`/api/v1/products/slug/${slug}`);
}

function buildProductsQuery(params: GetProductsByCategoryParams = {}): string {
  const searchParams = new URLSearchParams();
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 12;
  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));

  if (params.sort) searchParams.set("sort", params.sort);
  if (params.q && params.q.trim()) searchParams.set("q", params.q.trim());
  if (typeof params.minPrice === "number" && Number.isFinite(params.minPrice)) {
    searchParams.set("minPrice", String(params.minPrice));
  }
  if (typeof params.maxPrice === "number" && Number.isFinite(params.maxPrice)) {
    searchParams.set("maxPrice", String(params.maxPrice));
  }
  if (params.tags && params.tags.length > 0) {
    searchParams.set("tags", params.tags.join(","));
  }
  if (params.features && params.features.length > 0) {
    searchParams.set("features", params.features.join(","));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

/**
 * Obtiene productos publicados y visibles de una categoría con paginación y filtros.
 *
 * Llama a `GET /api/v1/products/category/:categoryId` de la API central de NestJS.
 */
export async function getProductsByCategory(
  categoryId: number,
  params: GetProductsByCategoryParams = {},
  init?: RequestInit,
): Promise<PaginatedCategoryProductsResponse> {
  const query = buildProductsQuery(params);
  return apiFetch<PaginatedCategoryProductsResponse>(
    `/api/v1/products/category/${categoryId}${query}`,
    init,
  );
}

/**
 * Obtiene productos publicados y visibles de una subcategoría con paginación y filtros.
 *
 * Llama a `GET /api/v1/products/subcategory/:subcategoryId` de la API central de NestJS.
 */
export async function getProductsBySubcategory(
  subcategoryId: number,
  params: GetProductsByCategoryParams = {},
  init?: RequestInit,
): Promise<PaginatedCategoryProductsResponse> {
  const query = buildProductsQuery(params);
  return apiFetch<PaginatedCategoryProductsResponse>(
    `/api/v1/products/subcategory/${subcategoryId}${query}`,
    init,
  );
}
