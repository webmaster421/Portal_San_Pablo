"use client";

import { Placeholder, SkeletonAvatar, IconMenu } from "@/components/ui";

interface HeaderProps {
  onOpenSidebar: () => void;
}

export default function Header({ onOpenSidebar }: HeaderProps) {
  return (
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 shrink-0 z-20">
      <div className="flex items-center gap-3 w-full">
        {/* Botón hamburguesa móvil */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <IconMenu />
        </button>

        <div className="flex-1 min-w-0">
          <div className="relative w-full">
            <div className="placeholder-box w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar biblias, libros, autores..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Placeholder className="w-5 h-5" />
          <Placeholder className="w-5 h-5 relative" />
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="text-right hidden sm:block"></div>
            <SkeletonAvatar />
          </div>
        </div>
      </div>
    </header>
  );
}
