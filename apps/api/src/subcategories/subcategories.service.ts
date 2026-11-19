import { Injectable, BadRequestException, ConflictException, Logger, NotFoundException } from "@nestjs/common";
import { Prisma, Subcategory } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { SyncSubcategoryInput } from "./dto/sync-subcategory.dto";

@Injectable()
export class SubcategoriesService {
  private readonly logger = new Logger(SubcategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async upsertSubcategory(data: SyncSubcategoryInput): Promise<Subcategory> {
    let categoryId: number | null = null;

    if (data.categoryPayloadId !== undefined && data.categoryPayloadId !== null) {
      const category = await this.prisma.category.findUnique({
        where: { payloadId: data.categoryPayloadId },
        select: { id: true },
      });

      if (category) {
        categoryId = category.id;
      } else {
        this.logger.warn(
          `Categoría principal con payloadId=${data.categoryPayloadId} no encontrada en PostgreSQL. Subcategoría payloadId=${data.payloadId} no puede sincronizarse sin categoría principal.`,
        );
      }
    }

    if (categoryId === null) {
      throw new BadRequestException(
        `No se pudo resolver la categoría principal para la subcategoría payloadId=${data.payloadId}.`,
      );
    }

    try {
      const result = await this.prisma.subcategory.upsert({
        where: { payloadId: data.payloadId },
        update: {
          name: data.name,
          slug: data.slug,
          description: data.description ?? null,
          published: data.published ?? true,
          showOnHome: data.showOnHome ?? false,
          order: data.order ?? 0,
          categoryId,
        },
        create: {
          payloadId: data.payloadId,
          name: data.name,
          slug: data.slug,
          description: data.description ?? null,
          published: data.published ?? true,
          showOnHome: data.showOnHome ?? false,
          order: data.order ?? 0,
          categoryId,
        },
      });

      this.logger.log(
        `Subcategoría sincronizada: payloadId=${data.payloadId}, id=${result.id}`,
      );

      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const target = (error.meta?.target as string[]) ?? [];
        this.logger.warn(
          `Conflicto de unicidad sincronizando subcategoría payloadId=${data.payloadId}: ${target.join(", ")}`,
        );
        throw new ConflictException(
          `Conflicto de datos al sincronizar subcategoría payloadId ${data.payloadId}: campo único duplicado (${target.join(", ")}).`,
        );
      }
      this.logger.error(
        `Error sincronizando subcategoría payloadId=${data.payloadId}`,
        error as Error,
      );
      throw error;
    }
  }

  async deactivateSubcategory(payloadId: number): Promise<boolean> {
    try {
      const result = await this.prisma.subcategory.updateMany({
        where: { payloadId },
        data: { published: false },
      });

      if (result.count > 0) {
        this.logger.log(
          `Subcategoría desactivada: payloadId=${payloadId}, filas=${result.count}`,
        );
      }

      return result.count > 0;
    } catch (error) {
      this.logger.error(
        `Error desactivando subcategoría payloadId=${payloadId}`,
        error as Error,
      );
      throw error;
    }
  }

  async findPublished(params?: { categoryId?: number; showOnHome?: boolean }) {
    return this.prisma.subcategory.findMany({
      where: {
        published: true,
        ...(params?.categoryId ? { categoryId: params.categoryId } : {}),
        ...(params?.showOnHome !== undefined ? { showOnHome: params.showOnHome } : {}),
      },
      orderBy: { order: "asc" },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async findPublishedBySlug(slug: string) {
    const subcategory = await this.prisma.subcategory.findFirst({
      where: { slug, published: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!subcategory) {
      throw new NotFoundException(`Subcategoría con slug "${slug}" no encontrada`);
    }

    return subcategory;
  }

  async findBySlugIncludingUnpublished(slug: string) {
    return this.prisma.subcategory.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async findOnePublished(id: number) {
    const subcategory = await this.prisma.subcategory.findFirst({
      where: { id, published: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!subcategory) {
      throw new NotFoundException(`Subcategoría con id ${id} no encontrada`);
    }

    return subcategory;
  }
}
