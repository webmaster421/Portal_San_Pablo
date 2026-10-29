export type CmsCategory = {
  id: number | string;
  name: string;
  slug: string;
  description?: string | null;
};

type CmsCategoriesResponse = {
  docs?: CmsCategory[];
};

function getCmsUrl(): string {
  return process.env.CMS_URL || "http://localhost:3001";
}

export async function getCategories(): Promise<CmsCategory[]> {
  const cmsUrl = getCmsUrl();

  const response = await fetch(`${cmsUrl}/api/categories?limit=10`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`El CMS respondió con HTTP ${response.status}`);
  }

  const data = (await response.json()) as CmsCategoriesResponse;

  return data.docs ?? [];
}

// --- Tipos de productos (reflejan la colección Products del CMS) ---

export type CmsProductImage = {
  id: number | string;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  alt?: string | null;
};

export type CmsProductCategory = {
  id: number | string;
  name: string;
  slug: string;
};

export type CmsProductDimensions = {
  width?: number | null;
  height?: number | null;
};

export type CmsProduct = {
  id: number | string;
  title: string;
  slug: string;
  author?: string | null;
  isbn?: string | null;
  price: number;
  image?: CmsProductImage | number | string | null;
  category?: CmsProductCategory | number | string | null;
  dimensions?: CmsProductDimensions | null;
  description?: unknown;
  status?: string | null;
  weight?: number | null;
  pages?: number | null;
  keywords?: string[] | null;
  tags?: string[] | null;
  isNew?: boolean | null;
  visible?: boolean | null;
  inventory?: number | null;
};

type CmsProductsResponse = {
  docs?: CmsProduct[];
};

function buildProductsUrl(slug?: string): string {
  const cmsUrl = getCmsUrl();
  const params = new URLSearchParams();
  params.set("limit", "50");
  params.set("depth", "1");
  params.set("where[status][equals]", "published");

  if (slug) {
    params.set("where[slug][equals]", slug);
    params.set("limit", "1");
  }

  return `${cmsUrl}/api/products?${params.toString()}`;
}

async function fetchProducts(url: string): Promise<CmsProduct[]> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`El CMS respondió con HTTP ${response.status}`);
  }

  const data = (await response.json()) as CmsProductsResponse;

  return data.docs ?? [];
}

export async function getProducts(): Promise<CmsProduct[]> {
  const products = await fetchProducts(buildProductsUrl());

  // Oculta los productos marcados como no visibles (por defecto: visibles).
  return products.filter((product) => product.visible !== false);
}

export async function getProductBySlug(slug: string): Promise<CmsProduct | null> {
  const products = await fetchProducts(buildProductsUrl(slug));

  const product = products[0] ?? null;

  if (product && product.visible === false) {
    return null;
  }

  return product;
}

// Resuelve la URL ABSOLUTA de la imagen de un producto.
// Payload puede devolver:
//   - un objeto Media populado con `url` relativa o absoluta
//   - un ID numérico (relación no poblada, sin URL disponible)
// next/image necesita un origen absoluto, por eso se antepone el CMS_URL.
export function getProductImageUrl(image: CmsProduct["image"]): string | null {
  if (!image) return null;
  if (typeof image === "object" && typeof image.url === "string" && image.url) {
    if (image.url.startsWith("http://") || image.url.startsWith("https://")) {
      return image.url;
    }
    return `${getCmsUrl()}${image.url}`;
  }
  return null;
}

// Normaliza la relación de categoría a objeto con nombre, si Payload la devolvió poblada.
export function getProductCategoryName(
  category: CmsProduct["category"],
): string | null {
  if (category && typeof category === "object" && typeof category.name === "string") {
    return category.name;
  }
  return null;
}

export function formatCopPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}



/**
 * Filtra productos por un termino de busqueda.
 *
 * Busca en titulo, autor, ISBN, slug y palabras clave. Es intencionadamente
 * simple: reutiliza los datos que ya devuelve `getProducts()` en el servidor,
 * sin duplicar la consulta al CMS ni abrirla al navegador.
 */
export function filterProductsByQuery(
  products: CmsProduct[],
  query: string | null | undefined,
): CmsProduct[] {
  const termino = query?.trim().toLowerCase();
  if (!termino) {
    return products;
  }

  return products.filter((product) => {
    const keywords = Array.isArray(product.keywords) ? product.keywords : [];

    const campos = [
      product.title,
      product.author,
      product.isbn,
      product.slug,
      ...keywords,
    ];

    return campos.some((campo) =>
      typeof campo === "string" && campo.toLowerCase().includes(termino),
    );
  });
}