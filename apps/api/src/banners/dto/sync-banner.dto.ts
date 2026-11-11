/**
 * DTO para la sincronización de un banner desde Payload CMS.
 * Campos obligatorios: payloadId, title.
 */
export interface SyncBannerInput {
  payloadId: number;
  title: string;
  imageUrl?: string | null;
  alt?: string | null;
  link?: string | null;
  active?: boolean;
  order?: number;
}
