"use client";

import { Placeholder, SkeletonAvatar, IconMenu } from "@/components/ui";
import { NavigationItem } from "@/types/navigation";
import type { Friend } from "@/data/mock";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navItems: NavigationItem[];
  friends: Friend[];
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  navItems,
  friends,
}: SidebarProps) {
  return (
    <aside
      className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      <div className="flex flex-col h-full lg:h-[100vh] lg:overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold text-gray-900 tracking-tight">San Pablo</span>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-xs font-semibold text-black-400 uppercase tracking-wider mb-4">Resumen</h2>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {}}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  item.active ? "bg-purple-50 text-purple-700 shadow-sm" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Clientes</h2>
          <div className="space-y-3">
            {friends.map((friend) => (
              <div key={friend.name} className="flex items-center gap-3">
                <SkeletonAvatar />
                <div className="flex-1 min-w-0">
                  <Placeholder className="placeholder-text-sm" label={friend.name} />
                  <Placeholder className="placeholder-text-sm" label={friend.subtitle} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 mt-auto border-t border-gray-100 pt-4 shrink-0">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Configuración</h2>
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm font-medium">
              <div className="placeholder-box w-4 h-4" />
              <span>Configuración</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm font-medium">
              <div className="placeholder-box w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </nav>
        </div>

        {/* Botón cerrar drawer (solo móvil) */}
        <div className="lg:hidden p-4 border-t border-gray-200">
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <IconMenu className="w-4 h-4" />
            Cerrar menú
          </button>
        </div>
      </div>
    </aside>
  );
}
