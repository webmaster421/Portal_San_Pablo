import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Librería San Pablo",
  description: "Tienda en línea de libros, biblias y artículos religiosos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="h-full bg-gray-50">{children}</body>
    </html>
  );
}
