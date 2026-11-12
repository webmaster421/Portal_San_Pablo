import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { SyncBannerInput } from "./dto/sync-banner.dto";

/**
 * Servicio de sincronización de banners Payload → NestJS.
 * Reutiliza PrismaService existente: no crea segunda conexión a PostgreSQL.
 * Operaciones idempotentes mediante upsert por payloadId.
 */
@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea o actualiza un banner sincronizado desde Payload.
   * Idempotente: mismo payloadId actualiza el registro existente.
   */
  async upsertBanner(data: SyncBannerInput) {
    try {
      const result = await this.prisma.banner.upsert({
        where: { payloadId: data.payloadId },
        update: {
          title: data.title,
          imageUrl: data.imageUrl ?? null,
          mobileImageUrl: data.mobileImageUrl ?? null,
          alt: data.alt ?? null,
          link: data.link ?? null,
          active: data.active ?? true,
          order: data.order ?? 0,
        },
        create: {
          payloadId: data.payloadId,
          title: data.title,
          imageUrl: data.imageUrl ?? null,
          mobileImageUrl: data.mobileImageUrl ?? null,
          alt: data.alt ?? null,
          link: data.link ?? null,
          active: data.active ?? true,
          order: data.order ?? 0,
        },
      });

      this.logger.log(
        `Banner sincronizado: payloadId=${data.payloadId}, id=${result.id}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error sincronizando banner payloadId=${data.payloadId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Desactivación lógica de un banner eliminado en Payload.
   * Nunca borra físicamente: pone active=false.
   */
  async deactivateBanner(payloadId: number) {
    const banner = await this.prisma.banner.findUnique({
      where: { payloadId },
    });
    if (!banner) {
      this.logger.warn(
        `Intento de desactivar banner inexistente: payloadId=${payloadId}`,
      );
      return;
    }

    return this.prisma.banner.update({
      where: { payloadId },
      data: { active: false },
    });
  }

  /**
   * Lista banners activos ordenados por el campo `order`.
   * Solo devuelve banners con active=true.
   */
  async findActiveBanners() {
    return this.prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
  }
}
