"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

type HeaderSearchProps = {
  /** Valor inicial, por ejemplo cuando la pagina ya muestra resultados. */
  initialQuery?: string;
};

export function HeaderSearch({ initialQuery = "" }: HeaderSearchProps) {
  const router = useRouter();
  const parametros = useSearchParams();
  const [termino, setTerminio] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Si la URL cambia (por ejemplo al vaciar la busqueda), el campo se
  // sincroniza ajustando el estado durante el render, no dentro de un efecto.
  const consultaUrl = parametros.get("q") ?? "";
  const [consultaPrevia, setConsultaPrevia] = useState(consultaUrl);
  if (consultaUrl !== consultaPrevia) {
    setConsultaPrevia(consultaUrl);
    setTerminio(consultaUrl);
  }

  function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const limpio = termino.trim();
    router.push(limpio ? `/?q=${encodeURIComponent(limpio)}` : "/");
  }

  return (
    <form role="search" onSubmit={enviar} className="w-full min-w-0">
      <label htmlFor="busqueda-productos" className="sr-only">
        Buscar libros
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id="busqueda-productos"
          type="search"
          name="q"
          value={termino}
          onChange={(event) => {
            setTerminio(event.target.value);
          }}
          placeholder="Buscar libros..."
          autoComplete="off"
          aria-label="Buscar libros"
          className="w-full min-w-0 rounded-full border py-2 pr-10 pl-9 text-sm"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 "
        >
          <svg fill="none" height="15" viewBox="0 0 24 24" width="15">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M20 20l-3.5-3.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          </svg>
        </span>

        <button
          type="submit"
          aria-label="Ejecutar búsqueda"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-medium text-sky-800 opacity-0 transition hover:bg-sky-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}