import { Injectable, ConflictException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import type { SyncCategoryInput } from "./dto/sync-category.dto";

/**
 * Servicio de sincronización de categorías Payload → NestJS.
 * Reutiliza PrismaService existente: no crea segunda conexión a PostgreSQL.
 * Operaciones idempotentes mediante upsert por payloadId.
 */
@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea o actualiza una categoría sincronizada desde Payload.
   * Idempotente: mismo payloadId actualiza el registro existente.
   */
  async upsertCategory(data: SyncCategoryInput) {
    try {
      const result = await this.prisma.category.upsert({
        where: { payloadId: data.payloadId },
        update: {
          name: data.name,
          slug: data.slug,
          imageUrl: data.imageUrl ?? null,
          description: data.description ?? null,
          active: data.active ?? true,
          order: data.order ?? 0,
          featured: data.featured ?? false,
        },
        create: {
          payloadId: data.payloadId,
          name: data.name,
          slug: data.slug,
          imageUrl: data.imageUrl ?? null,
          description: data.description ?? null,
          active: data.active ?? true,
          order: data.order ?? 0,
          featured: data.featured ?? false,
        },
      });

      this.logger.log(
        `Categoría sincronizada: payloadId=${data.payloadId}, id=${result.id}`,
      );

      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = (error.meta?.target as string[]) ?? [];
          this.logger.warn(
            `Conflicto de unicidad sincronizando categoría payloadId=${data.payloadId}: ${target.join(", ")}`,
          );
          throw new ConflictException(
            `Conflicto de datos al sincronizar categoría payloadId ${data.payloadId}: campo único duplicado (${target.join(", ")}).`,
          );
        }
      }
      this.logger.error(
        `Error sincronizando categoría payloadId=${data.payloadId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Lista categorías activas y destacadas para el Home,
   * ordenadas por el campo `order` ascendente.
   */
  async findAll() {
    return this.prisma.category.findMany({
      where: {
        active: true,
        featured: true,
      },
      orderBy: { order: "asc" },
    });
  }

  /**
   * Consulta una categoría por su ID interno de PostgreSQL.
   */
  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error(`Categoría con id ${id} no encontrada`);
    }

    return category;
  }

  /**
   * Resuelve el ID interno de PostgreSQL de una categoría a partir de su payloadId.
   * Devuelve null si no existe.
   */
  async resolveCategoryIdByPayloadId(payloadId: number): Promise<number | null> {
    const category = await this.prisma.category.findUnique({
      where: { payloadId },
      select: { id: true },
    });
    return category ? category.id : null;
  }

  /**
   * Desactiva lógicamente una categoría en NestJS cuando se elimina de Payload.
   * Pone active=false para que no aparezca en Home ni en listados públicos.
   * Devuelve true si se actualizó algún registro, false si no existía.
   */
  async deactivateCategory(payloadId: number): Promise<boolean> {
    try {
      const result = await this.prisma.category.updateMany({
        where: { payloadId },
        data: { active: false },
      });

      if (result.count > 0) {
        this.logger.log(
          `Categoría desactivada: payloadId=${payloadId}, filas=${result.count}`,
        );
      }

      return result.count > 0;
    } catch (error) {
      this.logger.error(
        `Error desactivando categoría payloadId=${payloadId}`,
        error,
      );
      throw error;
    }
  }
}
