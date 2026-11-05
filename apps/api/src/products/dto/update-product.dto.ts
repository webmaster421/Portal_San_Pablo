/**
 * DTO para la actualización de un producto.
 * Todos los campos son opcionales (actualización parcial).
 * Excluye intencionadamente: id, payloadId, createdAt, updatedAt.
 * Estos campos internos no deben modificarse mediante asignación indiscriminada.
 */
export interface UpdateProductDto {
  title?: string;
  slug?: string;
  isbn?: string;
  author?: string;
  price?: number;
  imageUrl?: string | null;
  categoryName?: string | null;
  weight?: number | null;
  width?: number | null;
  height?: number | null;
  description?: unknown;
  status?: "draft" | "published";
  appliesTax?: boolean;
  taxValue?: number | null;
  appliesShipping?: boolean;
  pages?: number | null;
  keywords?: string[];
  tags?: string[];
  isNew?: boolean;
  visible?: boolean;
  inventory?: number;
}
