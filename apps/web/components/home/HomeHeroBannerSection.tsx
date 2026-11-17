"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import type { Banner } from "@/types/banner";

interface HomeHeroBannerSectionProps {
  banners: Banner[];
  bannersLoading: boolean;
  cmsUrl: string;
}

export default function HomeHeroBannerSection({
  banners,
  bannersLoading,
  cmsUrl,
}: HomeHeroBannerSectionProps) {
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

  return (
    <section className="relative rounded-3xl mb-6 lg:mb-8 overflow-hidden h-[200px] lg:h-[320px] bg-transparent">
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
  );
}