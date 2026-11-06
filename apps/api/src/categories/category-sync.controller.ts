import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { HmacAuthGuard } from "../products/sync/hmac-auth.guard";
import { CategoryService } from "./categories.service";
import type { SyncCategoryInput } from "./dto/sync-category.dto";

/**
 * Controlador de sincronización de categorías Payload → NestJS.
 *
 * Endpoints protegidos por HMAC-SHA256 (HmacAuthGuard).
 *
 * Rutas bajo prefijo global api/v1 (configurado en main.ts):
 *   POST   /api/v1/sync/categories   - upsert de categoría
 */
@Controller("sync")
export class CategorySyncController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Sincroniza (crea o actualiza) una categoría recibida desde Payload.
   * Idempotente: mismo payloadId no duplica registros.
   */
  @Post("categories")
  @UseGuards(HmacAuthGuard)
  async syncCategory(@Body() data: SyncCategoryInput) {
    if (!data.payloadId) {
      throw new BadRequestException("payloadId es obligatorio");
    }
    if (!data.name || !data.slug) {
      throw new BadRequestException("name y slug son campos obligatorios");
    }

    const result = await this.categoryService.upsertCategory(data);

    return {
      synced: true,
      payloadId: data.payloadId,
      categoryId: result.id,
      action: "upserted",
      timestamp: new Date().toISOString(),
    };
  }
}
