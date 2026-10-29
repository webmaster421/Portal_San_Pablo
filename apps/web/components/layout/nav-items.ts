/**
 * Navegacion principal del header.
 *
 * El proyecto solo tiene estas rutas definidas:
 *   - `/`                 (app/page.tsx)
 *   - `/productos/[slug]` (app/productos/[slug]/page.tsx)
 *
 * `Libros`, `Biblias` y `Autores` estan preparadas pero sin `href`: cuando se
 * creen esas paginas basta con anadir la ruta aqui y el enlace queda activo.
 */
export type NavItem = {
  label: string;
  /** Destino real. `null` = la seccion todavia no tiene pagina. */
  href: string | null;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Libros", href: null },
  { label: "Biblias", href: null },
  { label: "Autores", href: null },
] as const;