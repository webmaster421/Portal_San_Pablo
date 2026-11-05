import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import * as crypto from "crypto";

/**
 * Guard de autenticación HMAC-SHA256 para el endpoint de sincronización Payload → NestJS.
 *
 * Formato de firma:
 *   Encabezado X-Timestamp: segundos época (Unix timestamp)
 *   Encabezado X-Hmac-Signature: sha256=<hex>
 *   Firma = HMAC-SHA256(SECRETO_COMPARTIDO, "${timestamp}.${cuerpoCrudo}")
 *
 * Validaciones:
 *   - Presencia de X-Timestamp y X-Hmac-Signature
 *   - Ventana de tiempo de ±5 minutos (evita ataques de repetición)
 *   - Comparación segura (timing-safe equal)
 *   - Secreto leído de variable de entorno HMAC_SYNC_SECRET (nunca se registra)
 */
@Injectable()
export class HmacAuthGuard implements CanActivate {
  private readonly logger = new Logger(HmacAuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<any>();
    const signature = request.headers["x-hmac-signature"] as string | undefined;
    const timestamp = request.headers["x-timestamp"] as string | undefined;
    let rawBody = request.rawBody as string | undefined;

    // rawBody puede estar vacío (string "") para solicitudes PATCH sin body.
    if (!signature || !timestamp) {
      throw new UnauthorizedException("Faltan encabezados de autenticación HMAC");
    }

    const secret = process.env.HMAC_SYNC_SECRET;
    if (!secret) {
      this.logger.error("HMAC_SYNC_SECRET no configurada en el entorno");
      throw new UnauthorizedException("Configuración de autenticación inválida");
    }

    const ts = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (isNaN(ts) || Math.abs(now - ts) > 300) {
      throw new UnauthorizedException("Timestamp inválido o vencido");
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    const provided = signature.replace(/^sha256=/, "");

    // Comparación segura: si las longitudes difieren, rellenar con ceros para
    // evitar que timingSafeEqual lance ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH.
    const expectedBuf = Buffer.from(expected, "hex");
    const providedBuf = Buffer.from(provided, "hex");
    const len = Math.max(expectedBuf.length, providedBuf.length);
    const expectedPadded = Buffer.alloc(len, 0);
    const providedPadded = Buffer.alloc(len, 0);
    expectedBuf.copy(expectedPadded);
    providedBuf.copy(providedPadded);

    if (!crypto.timingSafeEqual(expectedPadded, providedPadded)) {
      this.logger.warn("Firma HMAC inválida recibida");
      throw new UnauthorizedException("Firma HMAC inválida");
    }

    return true;
  }
}
