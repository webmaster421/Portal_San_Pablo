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
          description: data.description ?? null,
        },
        create: {
          payloadId: data.payloadId,
          name: data.name,
          slug: data.slug,
          description: data.description ?? null,
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
   * Lista todas las categorías.
   */
  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { createdAt: "desc" },
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
}
