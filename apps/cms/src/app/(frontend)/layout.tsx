import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal San Pablo — CMS",
  description: "CMS de Portal San Pablo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
