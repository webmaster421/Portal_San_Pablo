"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

const IconArrowLeft = ({ className }: { className?: string }) => (
  <svg className={`w-5 h-5 text-gray-600 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
);

const Placeholder = ({
  className = "w-full h-24",
  label,
}: {
  className?: string;
  label?: string;
}) => (
  <div className={className}>
    {label && (
      <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">
        {label}
      </span>
    )}
  </div>
);

export default function CartPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header de la vista carrito */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 lg:py-5 shrink-0 z-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <IconArrowLeft />
          <span className="text-sm font-medium">Regresar</span>
        </button>
      </header>

      {/* Contenido del carrito */}
      <div className="p-4 lg:p-6 space-y-6">
        {/* Encabezado de sección */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-gray-900">Tu carrito</h1>
            <p className="text-sm text-gray-500 mt-1">Revisa tus productos antes de continuar</p>
          </div>
        </div>

        {/* Lista de productos (esqueleto) */}
        <div className="space-y-4">
          {/* <!-- Producto en carrito 1 --> */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col lg:flex-row gap-4">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-200 rounded-xl flex-shrink-0">
              {/* <!-- Imagen del producto --> */}
            </div>
            <div className="flex-1 min-w-0">
              <div className="placeholder-text-sm w-48 lg:w-64"></div>
              <div className="placeholder-text-xs w-32 mt-1 text-gray-500"></div>
            </div>
            <div className="flex items-end gap-2">
              <div className="text-sm font-medium text-gray-900">
                <Placeholder className="placeholder-text-sm w-16" label="$0.00" />
              </div>
              <button className="text-purple-600 text-sm font-medium hover:underline">
                {/* Botón eliminar */}
              </button>
            </div>
          </div>

          {/* Producto en carrito 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col lg:flex-row gap-4">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-200 rounded-xl flex-shrink-0">
              {/* Imagen del producto */}
            </div>
            <div className="flex-1 min-w-0">
              <div className="placeholder-text-sm w-48 lg:w-64"></div>
              <div className="placeholder-text-xs w-32 mt-1 text-gray-500"></div>
            </div>
            <div className="flex items-end gap-2">
              <div className="text-sm font-medium text-gray-900">
                <Placeholder className="placeholder-text-sm w-16" label="$0.00" />
              </div>
              <button className="text-purple-600 text-sm font-medium hover:underline">
                {/* Botón eliminar */}
              </button>
            </div>
          </div>
        </div>

        {/* Carrito vacío - estado alternativo (opcional, comentado) */}
        {/* <div className="text-center py-20">
          <Placeholder className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full" />
          <h2 className="text-lg font-semibold text-gray-900">Tu carrito está vacío</h2>
          <p className="text-gray-500 mt-1">Aún no hay productos agregados.</p>
          <Link href="/" className="mt-4 inline-block text-purple-600 font-medium hover:underline">
            Seguir comprando
          </Link>
        </div> */}

        {/* Resumen de compra */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-5 lg:p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0 mb-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Resumen</h2>
              <p className="text-sm text-gray-500">Impuestos y envío calculados al finalizar</p>
            </div>
            <div className="text-right lg:text-left">
              <div className="text-lg font-bold text-gray-900">
                <Placeholder className="placeholder-text-lg w-24" label="Total" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* <!-- Subtotal --> */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900 font-medium">
                <Placeholder className="placeholder-text-sm w-16" label="$0.00" />
              </span>
            </div>
            {/* <!-- Envío --> */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Envío</span>
              <span className="text-gray-900 font-medium">
                <Placeholder className="placeholder-text-sm w-16" label="$0.00" />
              </span>
            </div>
            {/* <!-- Total --> */}
            <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-3">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">
                <Placeholder className="placeholder-text-sm w-16" label="$0.00" />
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-6 space-y-3 lg:mt-0 lg:space-y-0 lg:flex lg:flex-col lg:w-64">
            <button className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-purple-600 text-white rounded-xl font-medium text-sm hover:bg-purple-700 transition-colors">
              {/* Icono continuar */}
              <span>Continuar compra</span>
            </button>
            <Link href="/" className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
