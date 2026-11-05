/**
 * DTO para la creación de un producto.
 * No incluye id, createdAt ni updatedAt: son gestionados por Prisma.
 * payloadId es obligatorio porque la columna en PostgreSQL es NOT NULL
 * (definida así en el modelo Product de Prisma, etapa 1). Se asigna al
 * sincronizar desde Payload CMS.
 */
export interface CreateProductDto {
  payloadId: number;
  title: string;
  slug: string;
  isbn: string;
  author: string;
  price: number;
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
