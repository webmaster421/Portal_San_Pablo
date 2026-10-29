"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  children: string;
  /** Etiqueta que se anuncia al lector de pantalla cuando hay subruta activa. */
  label?: string;
};

/**
 * Enlace de navegacion con indicador de pagina activa.
 * Client Component por `usePathname()`: es la pieza mas pequena con estado.
 */
export function NavLink({ href, children, label }: NavLinkProps) {
  const pathname = usePathname();
  const activo = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    

<Link
  href={href}
  aria-current={activo ? "page" : undefined}
  className={`relative rounded-sm px-1 py-2 text-sm font-medium text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#de1f27] focus-visible:ring-offset-4 ${
    activo
      ? "after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#de1f27]"
      : ""
  }`}
>
  {children}
  {activo && label ? <span className="sr-only">{label}</span> : null}
</Link>

  );
}