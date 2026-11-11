import {
  Controller,
  Get,
} from "@nestjs/common";
import { BannersService } from "./banners.service";

/**
 * Controlador público de banners.
 *
 * Endpoints bajo prefijo global api/v1 (configurado en main.ts):
 *   GET   /api/v1/banners   - listar banners activos (público)
 */
@Controller("banners")
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  /**
   * Lista banners activos ordenados por el campo `order`.
   * Endpoint público para el frontend.
   */
  @Get()
  async findActive() {
    return this.bannersService.findActiveBanners();
  }
}
