import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { HmacAuthGuard } from "../products/sync/hmac-auth.guard";
import { CategoryService } from "./categories.service";
import type { SyncCategoryInput } from "./dto/sync-category.dto";

/**
 * Controlador de categorías.
 *
 * Endpoints bajo prefijo global api/v1 (configurado en main.ts):
 *   POST   /api/v1/sync/categories   - upsert de categoría (protegido por HMAC)
 *   GET    /api/v1/categories         - listar categorías
 *   GET    /api/v1/categories/:id     - consultar categoría por ID
 */
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Sincroniza (crea o actualiza) una categoría recibida desde Payload.
   * Idempotente: mismo payloadId no duplica registros.
   */
  @Post("sync/categories")
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

  /**
   * Lista todas las categorías.
   */
  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  /**
   * Consulta una categoría por su ID interno de PostgreSQL.
   */
  @Get("slug/:slug")
  async findBySlug(@Param("slug") slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  /**
   * Consulta una categoría por su ID interno de PostgreSQL.
   */
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) {
      throw new BadRequestException("El id debe ser un número válido");
    }

    return this.categoryService.findOne(idNum);
  }
}
