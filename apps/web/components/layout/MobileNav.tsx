"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { NAV_ITEMS } from "./nav-items";

/**
 * Menu desplegable para movil.
 *
 * - se cierra al navegar;
 * - se cierra con Escape y devuelve el foco al boton;
 * - el panel es un bloque normal del flujo (no superpuesto), por lo que no
 *   genera desplazamiento horizontal.
 */
export function MobileNav() {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();
  const botonRef = useRef<HTMLButtonElement>(null);

  // Cierra al cambiar de ruta (tambien con atras/adelante del navegador).
  // Se ajusta durante el render en lugar de llamar a setState en un efecto.
  const [rutaAnterior, setRutaAnterior] = useState(pathname);
  if (pathname !== rutaAnterior) {
    setRutaAnterior(pathname);
    setAbierto(false);
  }

  // Escape cierra y restaura el foco.
  useEffect(() => {
    if (!abierto) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAbierto(false);
        botonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [abierto]);

  return (
    <div className="md:hidden">
      <button
        ref={botonRef}
        type="button"
        onClick={() => {
          setAbierto((valor) => !valor);
        }}
        aria-expanded={abierto}
        aria-controls="menu-movil"
        aria-label={abierto ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sky-900 transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
      >
        <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
          {abierto ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          )}
        </svg>
      </button>

      {abierto ? (
        <nav
          id="menu-movil"
          aria-label="Navegación principal (móvil)"
          className="border-b border-sky-100 bg-sky-50"
        >
          <ul className="flex flex-col px-4 py-2">
            {NAV_ITEMS.map((item) =>
              item.href ? (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    onClick={() => {
                      setAbierto(false);
                    }}
                    className="block rounded-md px-2 py-2.5 text-sm font-medium text-sky-900 transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
                  >
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li key={item.label}>
                  <span
                    aria-disabled="true"
                    title="Sección no disponible todavía"
                    className="flex cursor-not-allowed items-center gap-2 rounded-md px-2 py-2.5 text-sm font-medium text-sky-800/45"
                  >
                    {item.label}
                    <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-normal uppercase tracking-wide text-sky-800/70">
                      Próximamente
                    </span>
                  </span>
                </li>
              ),
            )}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}