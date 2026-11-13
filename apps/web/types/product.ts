/**
 * Interfaz para un producto sincronizado desde Payload CMS vía NestJS API.
 * Contrato de respuesta de GET /api/v1/products y GET /api/v1/products/category/:categoryId.
 */
export interface Product {
  id: number;
  payloadId: number;
  title: string;
  slug: string;
  isbn: string;
  author: string;
  price: number;
  imageUrl: string | null;
  categoryName: string | null;
  categoryId: number | null;
  weight: string | null;
  width: number | null;
  height: number | null;
  description: unknown;
  status: string;
  appliesTax: boolean;
  taxValue: string | null;
  appliesShipping: boolean;
  pages: number | null;
  keywords: string[];
  tags: string[];
  isNew: boolean;
  visible: boolean;
  inventory: number;
  createdAt: string;
  updatedAt: string;
}
