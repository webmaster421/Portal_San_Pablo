import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types/category";

interface CategoryHighlightCardProps {
  category: Category;
  cmsUrl: string;
}

export default function CategoryHighlightCard({
  category,
  cmsUrl,
}: CategoryHighlightCardProps) {
  const imageUrl = category.imageUrl
    ? category.imageUrl.startsWith("http")
      ? category.imageUrl
      : `${cmsUrl}${category.imageUrl}`
    : null;

  return (
    <Link
      href={`/categorias/${category.slug}`}
      className="block"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <article
        className="group relative flex-shrink-0 w-[220px] sm:w-[250px] lg:w-[280px] aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer snap-start shadow-sm hover:shadow-xl transition-all duration-500"
        >
          {/* Imagen de fondo */}
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={category.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              width={280}
              height={210}
              unoptimized
            />
          ) : (
            <div
              className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center"
            >
              <span className="text-gray-400 text-sm">Sin imagen</span>
            </div>
          )}

          {/* Degradado inferior para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Contenido */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-4 lg:p-5">
          

            <h3 className="text-white font-semibold text-base lg:text-lg leading-snug line-clamp-2">
              {category.name}
            </h3>

            <div className="flex items-center justify-between ">
              <span className="text-white/80 text-xs font-medium tracking-wide">
                Ver productos
              </span>

              <span className="flex items-center justify-center w-8 h-8 rounded-full border border-white/50 text-white transition-all duration-300 group-hover:bg-white group-hover:text-gray-900 group-hover:border-white group-hover:translate-x-1">
                →
              </span>
            </div>
          </div>
        </article>
    </Link>
  );
}