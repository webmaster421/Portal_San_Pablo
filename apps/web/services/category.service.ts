/**
 * Servicio de categorías.
 *
 * Consulta el endpoint público de NestJS para obtener las categorías
 * activas y destacadas para el Home, ordenadas por el campo `order`.
 * No expone credenciales ni secretos.
 */
import type { Category } from "../types/category";
import { apiFetch } from "./api-client";

/**
 * Obtiene la lista de categorías activas y destacadas para el carrusel principal del Home.
 *
 * Llama a `GET /api/v1/categories` de la API central de NestJS.
 * Solo devuelve categorías con `active = true` y `featured = true`, ordenadas por `order` ascendente.
 *
 * @returns Arreglo de categorías activas y destacadas.
 * @throws Error si la petición falla o la API responde con error.
 */
export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/v1/categories");
}
