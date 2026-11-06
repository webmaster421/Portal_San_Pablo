"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NavigationItem } from "@/types/navigation";
import { friends, products } from "@/data/mock";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import {
  Placeholder,
  IconInbox,
  IconLesson,
  IconTask,
  IconGroup,
  IconHeart,
  IconChevronLeft,
  IconChevronRight,
  IconCart,
} from "@/components/ui";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

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
          {/* Banner Hero - Carrusel Swiper */}
          <section className="relative rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white mb-6 lg:mb-8 overflow-hidden h-[200px] lg:h-[320px]">
            <Swiper
              modules={[Pagination]}
              slidesPerView={1}
              spaceBetween={4}
              pagination={{ clickable: true }}
              className="h-full w-full"
            >
              {/* Slide 1 */}
              <SwiperSlide className="flex flex-col justify-between p-6 lg:p-8">
                
                <div className="placeholder-box w-16 h-8 bg-white/20 rounded-lg" />
              </SwiperSlide>

              {/* Slide 2 */}
              <SwiperSlide className="flex flex-col justify-between p-6 lg:p-8">
               
                <div className="placeholder-box w-16 h-8 bg-white/20 rounded-lg" />
              </SwiperSlide>

              {/* Slide 3 */}
              <SwiperSlide className="flex flex-col justify-between p-6 lg:p-8">
                
                <div className="placeholder-box w-16 h-8 bg-white/20 rounded-lg" />
              </SwiperSlide>
            </Swiper>
          </section>

          {/* Sección Seguir explorando */}
          <section className="mb-6 lg:mb-8">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-3 lg:mb-4 gap-3">
              <Placeholder className="placeholder-text-lg w-48 lg:w-auto" />
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <IconChevronLeft className="w-3 h-3" />
                <IconChevronRight className="w-3 h-3" />
              </div>
            </div>
            <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {products.map((course) => (
                <div key={course.title} className="flex-shrink-0 w-[200px] lg:w-64 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="relative aspect-video bg-gray-200">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    <button className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full">{course.fav ? <IconHeart filled={true} /> : <IconHeart />}</button>
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md w-20">{course.label}</span>
                  </div>
                  <div className="p-3">
                    <Placeholder className="placeholder-text-sm" label={course.title} />
                    <Placeholder className="placeholder-text-sm" label={course.mentor} />
                  </div>
                </div>
              ))}
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
