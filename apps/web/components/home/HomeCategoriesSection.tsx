import type { Category } from "@/types/category";
import CategoryHighlightCard from "@/components/home/CategoryHighlightCard";

interface HomeCategoriesSectionProps {
  categories: Category[];
  categoriesLoading: boolean;
  cmsUrl: string;
}

export default function HomeCategoriesSection({
  categories,
  categoriesLoading,
  cmsUrl,
}: HomeCategoriesSectionProps) {
  return (
    <section className="mb-8 lg:mb-10">
      <div className="flex gap-4 lg:gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {categoriesLoading ? (
          <>
            <article
              className="flex-shrink-0 w-[220px] sm:w-[250px] lg:w-[280px] aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 snap-start"
            >
              <div className="placeholder-box w-16 h-8 bg-white/20 rounded-lg" />
            </article>
            <article
              className="flex-shrink-0 w-[220px] sm:w-[250px] lg:w-[280px] aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 snap-start"
            >
              <div className="placeholder-box w-16 h-8 bg-white/20 rounded-lg" />
            </article>
            <article
              className="flex-shrink-0 w-[220px] sm:w-[250px] lg:w-[280px] aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 snap-start"
            >
              <div className="placeholder-box w-16 h-8 bg-white/20 rounded-lg" />
            </article>
          </>
        ) : categories.length === 0 ? (
          <article className="flex-shrink-0 w-[220px] sm:w-[250px] lg:w-[280px] rounded-2xl bg-gray-100 flex items-center justify-center snap-start">
            <p className="text-sm opacity-90">No hay categorías destacadas</p>
          </article>
        ) : (
          categories.map((category) => (
            <CategoryHighlightCard
              key={category.id}
              category={category}
              cmsUrl={cmsUrl}
            />
          ))
        )}
      </div>
    </section>
  );
}