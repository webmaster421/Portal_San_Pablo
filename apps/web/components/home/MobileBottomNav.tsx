"use client";

import { useRouter } from "next/navigation";
import { IconCart, IconGroup, IconHeart, IconInbox } from "@/components/ui";

type NavItem = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
};

export default function MobileBottomNav() {
  const router = useRouter();

  const goToCart = () => {
    router.push("/cart");
  };

  const items: NavItem[] = [
    { key: "home", label: "Inicio", icon: IconInbox },
    { key: "categories", label: "Categorías", icon: IconGroup },
    { key: "favorites", label: "Favoritos", icon: IconHeart },
    { key: "cart", label: "Carrito", icon: IconCart, onClick: goToCart },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-1px_3px_rgba(0,0,0,0.06)]"
      aria-label="Navegación inferior"
    >
      <div className="grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const Icon = item.icon;
          const isInteractive = typeof item.onClick === "function";

          if (isInteractive) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                className="flex flex-col items-center justify-center gap-1 py-2 text-gray-700 hover:text-gray-900"
                aria-label={item.label}
              >
                <Icon className="w-5 h-5 text-current" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <div
              key={item.key}
              className="flex flex-col items-center justify-center gap-1 py-2 text-gray-500"
              aria-label={item.label}
            >
              <Icon className="w-5 h-5 text-current" />
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}