/**
 * Interfaz para una categoría sincronizada desde Payload CMS vía NestJS API.
 * Contrato de respuesta de GET /api/v1/categories.
 */
export interface Category {
  id: number;
  payloadId: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  active: boolean;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
