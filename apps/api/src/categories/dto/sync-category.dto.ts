/**
 * DTO para la sincronización de una categoría desde Payload CMS.
 * Campos obligatorios: payloadId, name, slug.
 */
export interface SyncCategoryInput {
  payloadId: number;
  name: string;
  slug: string;
  description?: string | null;
}
