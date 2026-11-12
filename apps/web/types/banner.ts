/**
 * Interfaz para un banner sincronizado desde Payload CMS vía NestJS API.
 * Contrato de respuesta de GET /api/v1/banners.
 */
export interface Banner {
  id: number;
  payloadId: number;
  title: string;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  alt: string | null;
  link: string | null;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
