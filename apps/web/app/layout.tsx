import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal San Pablo",
  description: "Nuevo E-commerce Portal San Pablo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
