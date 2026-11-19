import type { Subcategory } from "../types/subcategory";
import { apiFetch } from "./api-client";

export interface GetSubcategoriesParams {
  categoryId?: number;
  showOnHome?: boolean;
}

export async function getSubcategories(
  params: GetSubcategoriesParams = {},
  init?: RequestInit,
): Promise<Subcategory[]> {
  const searchParams = new URLSearchParams();

  if (typeof params.categoryId === "number" && Number.isFinite(params.categoryId)) {
    searchParams.set("categoryId", String(params.categoryId));
  }

  if (typeof params.showOnHome === "boolean") {
    searchParams.set("showOnHome", String(params.showOnHome));
  }

  const query = searchParams.toString();
  return apiFetch<Subcategory[]>(`/api/v1/subcategories${query ? `?${query}` : ""}`, init);
}

export async function getSubcategoryBySlug(
  slug: string,
  init?: RequestInit,
): Promise<Subcategory | null> {
  return apiFetch<Subcategory | null>(`/api/v1/subcategories/slug/${slug}`, init);
}
