import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import * as crypto from "crypto";

/**
 * Guard de autenticación provisional mediante API key administrativa.
 *
 * Valida el encabezado `X-Admin-API-Key` contra la variable de entorno
 * `ADMIN_API_KEY` utilizando comparación segura (timing-safe equal).
 *
 * Este guard protege exclusivamente las operaciones de escritura del catálogo
 * (POST, PATCH, DELETE). Las consultas públicas (GET) no requieren esta
 * autenticación.
 *
 * La clave nunca se expone al frontend: solo se lee desde variables de entorno
 * en el servidor NestJS.
 */
@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(AdminApiKeyGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers["x-admin-api-key"] as string | undefined;

    const expectedKey = process.env.ADMIN_API_KEY;

    if (!expectedKey) {
      this.logger.error(
        "ADMIN_API_KEY no está configurada en el entorno del servidor",
      );
      throw new UnauthorizedException(
        "Configuración de autenticación inválida",
      );
    }

    if (!apiKey) {
      throw new UnauthorizedException(
        "Falta el encabezado X-Admin-API-Key",
      );
    }

    const expectedBuf = Buffer.from(expectedKey, "utf8");
    const providedBuf = Buffer.from(apiKey, "utf8");
    const len = Math.max(expectedBuf.length, providedBuf.length);
    const expectedPadded = Buffer.alloc(len, 0);
    const providedPadded = Buffer.alloc(len, 0);
    expectedBuf.copy(expectedPadded);
    providedBuf.copy(providedPadded);

    if (!crypto.timingSafeEqual(expectedPadded, providedPadded)) {
      this.logger.warn("API key administrativa inválida recibida");
      throw new UnauthorizedException("API key administrativa inválida");
    }

    return true;
  }
}
