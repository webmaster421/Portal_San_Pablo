import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { HmacAuthGuard } from "./hmac-auth.guard";
import { SyncService } from "./sync.service";
import type { SyncProductInput } from "./sync.service";

/**
 * Controlador de sincronización interna Payload → NestJS.
 *
 * Endpoints protegidos por HMAC-SHA256 (HmacAuthGuard).
 * No son los endpoints públicos del catálogo; son exclusivamente para la
 * sincronización programática desde Payload CMS.
 *
 * Rutas bajo prefijo global api/v1 (configurado en main.ts):
 *   POST   /api/v1/sync/products          - upsert de producto
 *   PATCH  /api/v1/sync/products/:id/deactivate - desactivación lógica
 */
@Controller("sync")
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  /**
   * Sincroniza (crea o actualiza) un producto recibido desde Payload.
   * Idempotente: mismo payloadId no duplica registros.
   */
  @Post("products")
  @UseGuards(HmacAuthGuard)
  async syncProduct(@Body() data: SyncProductInput) {
    // Validación de campos obligatorios antes de tocar la BD
    if (!data.payloadId) {
      throw new BadRequestException("payloadId es obligatorio");
    }
    if (!data.title || !data.slug || !data.isbn || !data.author) {
      throw new BadRequestException(
        "title, slug, isbn y author son campos obligatorios",
      );
    }
    if (!Number.isFinite(data.price)) {
      throw new BadRequestException("price debe ser un número válido");
    }

    const result = await this.syncService.upsertProduct(data);

    return {
      synced: true,
      payloadId: data.payloadId,
      productId: result.id,
      action: "upserted",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Desactiva lógicamente un producto eliminado en Payload.
   * Pone visible=false y status='draft' en PostgreSQL.
   */
  @Patch("products/:payloadId/deactivate")
  @UseGuards(HmacAuthGuard)
  async deactivateProduct(@Param("payloadId") payloadId: string) {
    const idNum = Number(payloadId);
    if (!Number.isFinite(idNum)) {
      throw new BadRequestException("payloadId inválido");
    }

    await this.syncService.deactivateProduct(idNum);

    return {
      deactivated: true,
      payloadId: idNum,
      timestamp: new Date().toISOString(),
    };
  }
}
