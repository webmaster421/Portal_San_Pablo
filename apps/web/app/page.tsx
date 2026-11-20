"use client";

import { useEffect, useState } from "react";
import { NavigationItem } from "@/types/navigation";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import {
  IconInbox,
  IconLesson,
  IconTask,
  IconGroup,
} from "@/components/ui";
import HomeRightSidebar from "@/components/home/HomeRightSidebar";
import MobileBottomNav from "@/components/home/MobileBottomNav";
import MobileSidebarOverlay from "@/components/home/MobileSidebarOverlay";
import HomeCategoriesSection from "@/components/home/HomeCategoriesSection";
import HomeHeroBannerSection from "@/components/home/HomeHeroBannerSection";
import RecommendedProductsCarousel from "@/components/catalog/RecommendedProductsCarousel";
import { getBanners } from "@/services/banner.service";
import { getCategories } from "@/services/category.service";
import { getProducts } from "@/services/product.service";
import { getSubcategories } from "@/services/subcategory.service";
import type { Banner } from "@/types/banner";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import type { Subcategory } from "@/types/subcategory";

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

  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [, setFeaturedSubcategories] = useState<Subcategory[]>([]);
  const [novedades, setNovedades] = useState<Product[]>([]);

  useEffect(() => {
    getBanners({ cache: "no-store" })
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

  useEffect(() => {
    getSubcategories()
      .then((data: Subcategory[]) => {
        setSubcategories(data);
      })
      .catch(() => {
        setSubcategories([]);
      });

    // Stage 8: datos preparados para subcategorías destacadas en Home (sin rediseño ni sección visual nueva).
    getSubcategories({ showOnHome: true })
      .then((data: Subcategory[]) => {
        setFeaturedSubcategories(data);
      })
      .catch(() => {
        setFeaturedSubcategories([]);
      });
  }, []);

  useEffect(() => {
    getProducts()
      .then((data: Product[]) => {
        setNovedades(data.filter((product) => product.isNew === true));
      })
      .catch(() => {
        setNovedades([]);
      });
  }, []);

  const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL ?? "";

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden lg:overflow-y-hidden">
      {/* Overlay móvil para el drawer lateral */}
      <MobileSidebarOverlay
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navItems={navItems}
        subcategories={subcategories}
      />

      <main className="flex-1 flex flex-col min-w-0 lg:ml-0 lg:h-[100vh] lg:overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Contenido scrollable central */}
        <div className="flex-1 overflow-y-auto p-4 pb-24 lg:p-6 lg:pb-6 space-y-6 lg:space-y-8">
          {/* Banner Hero - Carrusel Swiper (banners dinámicos desde la API) */}
          <HomeHeroBannerSection
            banners={banners}
            bannersLoading={bannersLoading}
            cmsUrl={cmsUrl}
          />

          {/* Sección Categorías principales (desde Payload CMS) */}
          <HomeCategoriesSection
            categories={categories}
            categoriesLoading={categoriesLoading}
            cmsUrl={cmsUrl}
          />

          <RecommendedProductsCarousel
            products={novedades}
            cmsBaseUrl={cmsUrl}
            title="Novedades"
            headerLayout="title-start-line"
          />
        </div>
      </main>
      <HomeRightSidebar />
      <MobileBottomNav />
    </div>
  );
}
