/**
 * DTO para la sincronización de una subcategoría desde Payload CMS.
 */
export interface SyncSubcategoryInput {
  payloadId: number;
  name: string;
  slug: string;
  description?: string | null;
  published?: boolean;
  showOnHome?: boolean;
  order?: number;
  categoryPayloadId?: number | null;
}
