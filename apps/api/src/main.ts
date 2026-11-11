import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Validar secretos obligatorios en producción antes de aceptar peticiones.
  // Si faltan, el servidor falla al arrancar de forma segura en lugar de
  // operar con credenciales predeterminadas o sin protección.
  const isProduction = process.env.NODE_ENV === "production";
  const requiredSecrets = ["ADMIN_API_KEY", "HMAC_SYNC_SECRET"];
  const missingSecrets = requiredSecrets.filter((s) => !process.env[s]);

  if (isProduction && missingSecrets.length > 0) {
    throw new Error(
      `Faltan variables de entorno obligatorias en producción: ${missingSecrets.join(", ")}. ` +
        "El servidor no iniciará sin estas credenciales configuradas.",
    );
  }

  // Capturar cuerpo crudo para verificación HMAC en el endpoint de sincronización.
  // express.raw() captura el body como Buffer ANTES del parser JSON de NestJS.
  // Luego parseamos manualmente a JSON y guardamos req.rawBody para HMAC.
  // Capturar cuerpo crudo para verificación HMAC en el endpoint de sincronización.
  // Leemos el stream de la petición manualmente para capturar el body crudo
  // en todos los casos (incluyendo bodies vacíos y PATCH). Luego parseamos a JSON.
  app.use((req: any, _res, next) => {
    let rawData = "";
    req.on("data", (chunk: any) => {
      rawData += chunk;
    });
    req.on("end", () => {
      req.rawBody = rawData;
      try {
        req.body = rawData ? JSON.parse(rawData) : {};
      } catch {
        req.body = {};
      }
      next();
    });
  });

  app.setGlobalPrefix("api/v1");

  // CORS: solo orígenes explícitos configurados mediante variable de entorno.
  // Nunca utilizar origin: '*' en producción.
  const defaultOrigins = ["http://localhost:3000", "http://localhost:3001"];
  const configuredOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
    : defaultOrigins;

  app.enableCors({
    origin: configuredOrigins,
    credentials: false,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

void bootstrap();
