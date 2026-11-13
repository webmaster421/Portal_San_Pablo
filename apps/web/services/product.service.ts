/**
 * Servicio de productos.
 *
 * Consulta los endpoints públicos de NestJS para obtener productos
 * del catálogo, filtrados por categoría o por slug.
 * No expone credenciales ni secretos.
 */
import type { Product } from "../types/product";
import { apiFetch } from "./api-client";

/**
 * Obtiene todos los productos publicados y visibles para el catálogo público.
 *
 * Llama a `GET /api/v1/products` de la API central de NestJS.
 *
 * @returns Arreglo de productos publicados y visibles.
 * @throws Error si la petición falla o la API responde con error.
 */
export async function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/api/v1/products");
}

/**
 * Obtiene un producto por su slug.
 *
 * Llama a `GET /api/v1/products/slug/:slug` de la API central de NestJS.
 *
 * @param slug - Slug amigable del producto.
 * @returns El producto encontrado o null si no existe.
 * @throws Error si la petición falla o la API responde con error.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return apiFetch<Product | null>(`/api/v1/products/slug/${slug}`);
}

/**
 * Obtiene los productos publicados y visibles de una categoría específica.
 *
 * Llama a `GET /api/v1/products/category/:categoryId` de la API central de NestJS.
 *
 * @param categoryId - ID interno de PostgreSQL de la categoría.
 * @returns Arreglo de productos de la categoría, ordenados por fecha de creación descendente.
 * @throws Error si la petición falla o la API responde con error.
 */
export async function getProductsByCategory(
  categoryId: number,
): Promise<Product[]> {
  return apiFetch<Product[]>(
    `/api/v1/products/category/${categoryId}`,
  );
}
