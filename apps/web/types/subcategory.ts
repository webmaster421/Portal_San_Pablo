export interface Subcategory {
  id: number;
  payloadId: number;
  name: string;
  slug: string;
  description: string | null;
  published: boolean;
  showOnHome: boolean;
  order: number;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}
