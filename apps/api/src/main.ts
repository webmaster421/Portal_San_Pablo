import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

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
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

void bootstrap();
