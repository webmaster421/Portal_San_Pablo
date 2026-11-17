/**
 * Servicio de banners.
 *
 * Consulta el endpoint público de NestJS para obtener los banners activos
 * ordenados por el campo `order`. No expone credenciales ni secretos.
 */
import type { Banner } from "../types/banner";
import { apiFetch } from "./api-client";

/**
 * Obtiene la lista de banners activos para el carrusel principal.
 *
 * Llama a `GET /api/v1/banners` de la API central de NestJS.
 * Solo devuelve banners con `active = true`, ordenados por `order` ascendente.
 *
 * @param init - Opciones de fetch opcionales (por ejemplo, caché).
 * @returns Arreglo de banners activos.
 * @throws Error si la petición falla o la API responde con error.
 */
export async function getBanners(init?: RequestInit): Promise<Banner[]> {
  return apiFetch<Banner[]>("/api/v1/banners", init);
}
