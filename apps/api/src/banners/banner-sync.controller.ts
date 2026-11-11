import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { HmacAuthGuard } from "../products/sync/hmac-auth.guard";
import { BannersService } from "./banners.service";
import type { SyncBannerInput } from "./dto/sync-banner.dto";

/**
 * Controlador de sincronización de banners Payload → NestJS.
 *
 * Endpoints bajo prefijo global api/v1 (configurado en main.ts):
 *   POST   /api/v1/sync/banners          - upsert de banner (protegido por HMAC)
 *   PATCH  /api/v1/sync/banners/:id/deactivate - desactivación lógica (protegido por HMAC)
 */
@Controller("sync")
export class BannerSyncController {
  constructor(private readonly bannersService: BannersService) {}

  /**
   * Sincroniza (crea o actualiza) un banner recibido desde Payload.
   * Idempotente: mismo payloadId no duplica registros.
   */
  @Post("banners")
  @UseGuards(HmacAuthGuard)
  async syncBanner(@Body() data: SyncBannerInput) {
    if (!data.payloadId) {
      throw new BadRequestException("payloadId es obligatorio");
    }
    if (!data.title) {
      throw new BadRequestException("title es obligatorio");
    }

    const result = await this.bannersService.upsertBanner(data);

    return {
      synced: true,
      payloadId: data.payloadId,
      bannerId: result.id,
      action: "upserted",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Desactiva lógicamente un banner eliminado en Payload.
   * Pone active=false en PostgreSQL.
   */
  @Patch("banners/:payloadId/deactivate")
  @UseGuards(HmacAuthGuard)
  async deactivateBanner(@Param("payloadId") payloadId: string) {
    const idNum = Number(payloadId);
    if (!Number.isFinite(idNum)) {
      throw new BadRequestException("payloadId inválido");
    }

    await this.bannersService.deactivateBanner(idNum);

    return {
      deactivated: true,
      payloadId: idNum,
      timestamp: new Date().toISOString(),
    };
  }
}
