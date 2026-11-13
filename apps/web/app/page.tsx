"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NavigationItem } from "@/types/navigation";
import { friends } from "@/data/mock";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import {
  Placeholder,
  IconInbox,
  IconLesson,
  IconTask,
  IconGroup,
  IconCart,
} from "@/components/ui";
import { getCategories } from "@/services/category.service";
import type { Category } from "@/types/category";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";

interface Banner {
  id: number;
  title: string;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  alt: string | null;
  link: string | null;
  active: boolean;
  order: number;
}

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

export default function DashboardPage() {
  const navItems: NavigationItem[] = [
    
    { name: "Inicio", icon: <IconInbox />, active: false },
    { name: "Autores", icon: <IconLesson />, active: false },
    { name: "Novedades", icon: <IconTask />, active: false },
    { name: "Promociones", icon: <IconGroup />, active: false },
  ];


  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const goToCart = () => {
    router.push("/cart");
  };

  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setBannersLoading(false);
      return;
    }

    fetch(`${apiUrl}/api/v1/banners`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status} cargando banners`);
        }
        return res.json();
      })
      .then((data: Banner[]) => {
        setBanners(data);
        setBannersLoading(false);
      })
      .catch(() => {
        setBanners([]);
        setBannersLoading(false);
      });
  }, []);

  useEffect(() => {
    getCategories()
      .then((data: Category[]) => {
        setCategories(data);
        setCategoriesLoading(false);
      })
      .catch(() => {
        setCategories([]);
        setCategoriesLoading(false);
      });
  }, []);

  const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL ?? "";

  const renderBannerImage = (banner: Banner) => {
    const imageUrl = banner.imageUrl
      ? banner.imageUrl.startsWith("http")
        ? banner.imageUrl
        : `${cmsUrl}${banner.imageUrl}`
      : null;
    const mobileImageUrl = banner.mobileImageUrl
      ? banner.mobileImageUrl.startsWith("http")
        ? banner.mobileImageUrl
        : `${cmsUrl}${banner.mobileImageUrl}`
      : null;

    if (!imageUrl && !mobileImageUrl) {
      return (
        <div className="w-full h-full bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-white/70 text-sm">{banner.title}</span>
        </div>
      );
    }

    return (
      <picture>
        {mobileImageUrl && (
          <source
            media="(max-width: 768px)"
            srcSet={mobileImageUrl}
          />
        )}
        <Image
          src={imageUrl ?? mobileImageUrl ?? ""}
          alt={banner.alt ?? banner.title}
          className="w-full h-full object-cover rounded-xl"
          loading="lazy"
          width={1200}
          height={600}
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
        />
      </picture>
    );
  };

  const renderCategoryCard = (category: Category) => {
    const imageUrl = category.imageUrl
      ? category.imageUrl.startsWith("http")
        ? category.imageUrl
        : `${cmsUrl}${category.imageUrl}`
      : null;

    return (
      <Link
        key={category.id}
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
  };

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden lg:overflow-y-hidden">
      {/* Overlay móvil para el drawer lateral */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm ${sidebarOpen ? "block" : "hidden"} lg:hidden`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navItems={navItems}
        friends={friends}
      />

      {/* ============================
         COLUMNA CENTRAL - ÁREA PRINCIPAL
         Desktop: entre ambos sidebars | Móvil: ancho completo
      ============================ */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-0 lg:h-[100vh] lg:overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Contenido scrollable central */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 lg:space-y-8">
          {/* Banner Hero - Carrusel Swiper (banners dinámicos desde la API) */}
          <section className="relative rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white mb-6 lg:mb-8 overflow-hidden h-[200px] lg:h-[320px]">
            <Swiper
              modules={[Pagination, Autoplay]}
              slidesPerView={1}
              spaceBetween={4}
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000 }}
             className="hero-swiper h-full w-full"
            >
              {bannersLoading ? (
                <>
                  <SwiperSlide className="h-full w-full">
                    <div className="placeholder-box w-16 h-8 bg-white/20 rounded-lg" />
                  </SwiperSlide>
                  <SwiperSlide className="h-full w-full">
                    <div className="placeholder-box w-16 h-8 bg-white/20 rounded-lg" />
                  </SwiperSlide>
                  <SwiperSlide className="h-full w-full">
                    <div className="placeholder-box w-16 h-8 bg-white/20 rounded-lg" />
                  </SwiperSlide>
                </>
              ) : banners.length === 0 ? (
                <SwiperSlide className="h-full w-full">
                  <div className="text-center text-white">
                    <p className="text-sm opacity-90">No hay banners activos</p>
                  </div>
                </SwiperSlide>
              ) : (
                banners.map((banner) => (
                  <SwiperSlide key={banner.id} className="h-full w-full">
                    {banner.link ? (
                      <Link
                        href={banner.link}
                        className="block w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {renderBannerImage(banner)}
                      </Link>
                    ) : (
                      renderBannerImage(banner)
                    )}
                  </SwiperSlide>
                ))
              )}
            </Swiper>
            <style jsx global>{`
  .hero-swiper .swiper-pagination {
    position: absolute;
    bottom: 16px !important;
    left: auto !important;
    right: 24px !important;
    width: auto !important;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
  }

  .hero-swiper .swiper-pagination-bullet {
    width: 8px;
    height: 8px;
    background: white;
    opacity: 0.5;
    margin: 0 !important;
  }

  .hero-swiper .swiper-pagination-bullet-active {
    opacity: 1;
    width: 22px;
    border-radius: 8px;
  }
`}</style>
          </section>

          {/* Sección Categorías principales (desde Payload CMS) */}
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
              categories.map((category) => renderCategoryCard(category))
            )}
          </div>
          </section>


          {/* Sección Novedades editoriales */}
          <section className="mb-6 lg:mb-8">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-3 lg:mb-4 gap-3">
              <Placeholder className="placeholder-text-lg w-40 lg:w-auto" />
              <Placeholder className="text-sm text-purple-600 font-medium w-20 lg:w-auto" label="Ver todos" />
            </div>
            <div className="skeleton-card overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {[ "AUTOR", "CATEGORÍA", "DESCRIPCIÓN", "ACCIÓN" ].map((h) => (
                        <th key={h} className="px-4 lg:px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                          <Placeholder className="placeholder-text-sm w-16 lg:w-20" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ============================
         SIDEBAR DERECHO
         Desktop: columna fija | Móvil/Tablet: apilado abajo
      ============================ */}
      <aside className="hidden lg:flex lg:w-80 flex-col border-l border-gray-200 bg-white z-10 shrink-0">
        <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-5 lg:space-y-6 lg:h-[100vh]">
          {/* Statistic */}
          <div className="skeleton-card p-5 shrink-0 bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
            
          </div>

          {/* Tu autor */}
          <div className="skeleton-card p-5 shrink-0">
            


          </div>
        </div>
      </aside>

      {/* Botón carrito en móvil (reemplaza la columna derecha en pantallas pequeñas) */}
      <button
        onClick={goToCart}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors"
        aria-label="Ir al carrito"
      >
        <IconCart className="w-5 h-5" />
      </button>
    </div>
  );
}
