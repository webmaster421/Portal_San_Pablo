
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { HeaderSearch } from "./HeaderSearch";
import { MobileNav } from "./MobileNav";
import { NavLink } from "./NavLink";
import { NAV_ITEMS } from "./nav-items";

type HeaderProps = {
  itemCount?: number;
  initialQuery?: string;
};

export function Header({
  itemCount = 0,
  initialQuery = "",
}: HeaderProps) {
  const articulos =
    Number.isFinite(itemCount) && itemCount > 0
      ? Math.floor(itemCount)
      : 0;

  return (
    <div className="relative w-full">
      {/* Imagen institucional de fondo */}
      <div className="absolute inset-x-0 top-0 h-[220px] overflow-hidden sm:h-[260px] md:h-[320px] lg:h-[680px]">
        <Image
          src="/header 1.jpg"
          alt="Virgen María entre las nubes"
          fill
          sizes="100vw"
          priority
          quality={90}
          className="object-cover object-[right_top]"
        />
      </div>

      {/* Header transparente */}
      <header className="sticky top-0 z-50 w-full bg-transparent">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2 sm:px-5 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-5 md:px-6 md:py-3 lg:gap-8 lg:px-8">
          {/* Izquierda: menú móvil y logo */}
          <div className="flex min-w-0 items-center justify-start gap-2 md:gap-0">
            <div className="md:hidden">
              <MobileNav />
            </div>

            <Link
              href="/"
              aria-label="San Pablo, ir al inicio"
              className="flex shrink-0 items-center rounded-sm px-1 py-1 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#de1f27] focus-visible:ring-offset-2"
            >
              <span className="relative block h-7 w-[49px] overflow-hidden sm:h-8 sm:w-[56px] md:h-9 md:w-[63px]">
                <Image
                  src="/logosp-blanco.png"
                  alt="San Pablo"
                  width={500}
                  height={500}
                  priority
                  className="absolute left-[-9.2px] top-[-18px] h-[64px] w-[64px] max-w-none sm:left-[-10.3px] sm:top-[-20px] sm:h-[72px] sm:w-[72px] md:left-[-11.8px] md:top-[-23px] md:h-[82px] md:w-[82px]"
                />
              </span>
            </Link>
          </div>

          {/* Centro: navegación */}
          <nav
            aria-label="Navegación principal"
            className="hidden justify-self-center md:block"
          >
            <ul className="flex items-center justify-center gap-3 lg:gap-6 xl:gap-8">
              {NAV_ITEMS.map((item) =>
                item.href ? (
                  <li key={item.label} className="shrink-0">
                    <NavLink href={item.href}>
                      {item.label}
                    </NavLink>
                  </li>
                ) : (
                  <li key={item.label} className="shrink-0">
                    <span
                      aria-disabled="true"
                      title="Sección no disponible todavía"
                      className="inline-block cursor-not-allowed px-1 py-2 text-sm font-medium text-black"
                    >
                      {item.label}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </nav>

          {/* Derecha: buscador y carrito */}
          {/* El buscador ocupa el espacio libre de su columna (flex-1) y conserva
              a partir de sm los anchos por breakpoint. El carrito mantiene
              tamano fijo y shrink-0: nunca se encoge ni queda pisado por el
              campo de busqueda. */}
          <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
            <div className="min-w-0 flex-1 sm:flex-none sm:w-48 md:w-36 lg:w-48 xl:w-60">
              <Suspense
                fallback={
                  <div
                    aria-hidden="true"
                    className="h-9 w-full rounded-full border border-sky-200/60 bg-white/20"
                  />
                }
              >
                <HeaderSearch initialQuery={initialQuery} />
              </Suspense>
            </div>

            <span
              aria-disabled="true"
              title="El carrito todavía no está disponible"
              className="relative inline-flex h-8 w-8 shrink-0 cursor-not-allowed items-center justify-center rounded-full text-sky-950 transition-colors hover:bg-white/20 sm:h-9 sm:w-9"
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="20"
                viewBox="0 0 24 24"
                width="20"
              >
                <path
                  d="M3 4h2l2.4 10.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20.5 8H6.2"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
                <circle cx="10" cy="20" r="1.3" fill="currentColor" />
                <circle cx="17" cy="20" r="1.3" fill="currentColor" />
              </svg>

              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#de1f27] px-1 text-[10px] font-bold text-white">
                {articulos}
              </span>

              <span className="sr-only">
                Carrito de compras, {articulos}{" "}
                {articulos === 1 ? "producto" : "productos"}.
                No disponible todavía.
              </span>
            </span>
          </div>
        </div>
      </header>

      {/* Espacio reservado para la imagen institucional */}
      <div
        aria-hidden="true"
        className="h-[180px] sm:h-[220px] md:h-[280px] lg:h-[340px]"
      />
    </div>
  );
}
