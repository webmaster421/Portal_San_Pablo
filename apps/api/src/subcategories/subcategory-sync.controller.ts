import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { HmacAuthGuard } from "../products/sync/hmac-auth.guard";
import type { SyncSubcategoryInput } from "./dto/sync-subcategory.dto";
import { SubcategoriesService } from "./subcategories.service";

@Controller("sync")
export class SubcategorySyncController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Post("subcategories")
  @UseGuards(HmacAuthGuard)
  async syncSubcategory(@Body() data: SyncSubcategoryInput) {
    if (!data.payloadId) {
      throw new BadRequestException("payloadId es obligatorio");
    }
    if (!data.name || !data.slug) {
      throw new BadRequestException("name y slug son campos obligatorios");
    }

    const result = await this.subcategoriesService.upsertSubcategory(data);

    return {
      synced: true,
      payloadId: data.payloadId,
      subcategoryId: result.id,
      action: "upserted",
      timestamp: new Date().toISOString(),
    };
  }

  @Patch("subcategories/:payloadId/deactivate")
  @UseGuards(HmacAuthGuard)
  async deactivateSubcategory(@Param("payloadId") payloadId: string) {
    const payloadIdNum = Number(payloadId);
    if (!Number.isFinite(payloadIdNum)) {
      throw new BadRequestException("El payloadId debe ser un número válido");
    }

    const deactivated = await this.subcategoriesService.deactivateSubcategory(payloadIdNum);

    return {
      synced: true,
      payloadId: payloadIdNum,
      action: deactivated ? "deactivated" : "not_found",
      timestamp: new Date().toISOString(),
    };
  }
}
