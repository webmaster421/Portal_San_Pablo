import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  formatCopPrice,
  getProductBySlug,
  getProductCategoryName,
  getProductImageUrl,
  type CmsProduct,
} from "../../../lib/cms";

export const dynamic = "force-dynamic";

function extractPlainText(lexical: unknown): string {
  if (!lexical || typeof lexical !== "object") return "";

  const node = lexical as {
    root?: {
      children?: Array<{
        children?: Array<{ text?: string }>;
      }>;
    };
  };

  const paragraphs = node.root?.children ?? [];

  return paragraphs
    .map((paragraph) =>
      (paragraph.children ?? []).map((child) => child.text ?? "").join(""),
    )
    .filter((text) => text.trim().length > 0)
    .join("\n\n");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getProductBySlug(slug);

    if (!product) {
      return { title: "Producto no encontrado — Portal San Pablo" };
    }

    return {
      title: `${product.title} — Portal San Pablo`,
      description: product.author ? `por ${product.author}` : undefined,
    };
  } catch {
    return { title: "Producto no encontrado — Portal San Pablo" };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product: CmsProduct | null = null;

  try {
    product = await getProductBySlug(slug);
  } catch {
    product = null;
  }

  if (!product) {
    notFound();
  }

  const imageUrl = getProductImageUrl(product.image);
  const imageAlt =
    product.image && typeof product.image === "object" && product.image.alt
      ? product.image.alt
      : product.title;

  const categoryName = getProductCategoryName(product.category);
  const descriptionText = extractPlainText(product.description);

  const dimensions =
    product.dimensions?.width && product.dimensions?.height
      ? `${product.dimensions.width} × ${product.dimensions.height} cm`
      : null;

  return (
    <main className="px-4 py-6 md:px-6">
      <Link
        href="/"
        className="text-sm text-blue-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
      >
        ← Volver al inicio
      </Link>

      <article className="mt-4 grid gap-6 sm:grid-cols-2">
        <div className="flex h-80 items-center justify-center overflow-hidden rounded-lg bg-gray-100 sm:h-96">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={480}
              height={480}
              className="h-full w-full object-contain p-4"
              priority
            />
          ) : (
            <span className="text-sm text-gray-400">Sin portada</span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>

          {product.author ? (
            <p className="text-sm text-gray-500">{product.author}</p>
          ) : null}

          {categoryName ? (
            <p className="text-sm text-gray-400">{categoryName}</p>
          ) : null}

          <p className="text-2xl font-bold text-gray-900">
            {formatCopPrice(product.price)}
          </p>

          {dimensions ? (
            <p className="text-sm text-gray-500">Dimensiones: {dimensions}</p>
          ) : null}

          {product.weight ? (
            <p className="text-sm text-gray-500">Peso: {product.weight} kg</p>
          ) : null}

          {descriptionText ? (
            <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {descriptionText}
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-400">
              Este producto no tiene descripción.
            </p>
          )}
        </div>
      </article>
    </main>
  );
}