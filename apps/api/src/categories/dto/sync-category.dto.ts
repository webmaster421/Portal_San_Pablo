/**
 * DTO para la sincronización de una categoría desde Payload CMS.
 * Campos obligatorios: payloadId, name, slug.
 */
export interface SyncCategoryInput {
  payloadId: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
  active?: boolean;
  order?: number;
  featured?: boolean;
}
