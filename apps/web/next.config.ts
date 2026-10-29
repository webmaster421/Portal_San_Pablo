import type { NextConfig } from "next";

// Next.js fija NODE_ENV antes de cargar esta configuracion:
//   next dev   -> "development"   (next/dist/bin/next L120)
//   next build -> "production"    (defaultEnv)
//   next start -> "production"
// La proteccion SSRF del optimizador solo se relaja en desarrollo local,
// donde el CMS se sirve desde localhost. En cualquier build o ejecucion de
// produccion queda activa la validacion de IPs privadas de Next.js.
const isLocalDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  agentRules: false,
  images: {
    // Next.js 16 solo permite las calidades declaradas aqui. 75 es el valor por
    // defecto del optimizador y se conserva para el resto de imagenes; 90 se
    // reserva para la imagen institucional del header, que se muestra a gran
    // tamano y no debe verse recomprimida en exceso.
    qualities: [75, 90],
    // Origen legitimo del CMS en desarrollo. No se amplia a ningun otro host.
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/api/media/**",
      },
    ],
    dangerouslyAllowLocalIP: isLocalDevelopment,
  },
};

export default nextConfig;
