import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coursue - E-learning Dashboard",
  description: "Panel de administración de plataforma de cursos en línea",
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
