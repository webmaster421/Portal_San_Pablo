import { Injectable, NotFoundException, ConflictException, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";

/**
 * Entrada de sincronización enviada desde Payload CMS.
 * Todos los campos son opcionales excepto payloadId, title, slug, isbn, author, price.
 */
export interface SyncProductInput {
  payloadId: number;
  title: string;
  slug: string;
  isbn: string;
  author: string;
  price: number;
  imageUrl?: string | null;
  categoryName?: string | null;
  categoryPayloadId?: number | null;
  weight?: number | null;
  width?: number | null;
  height?: number | null;
  description?: unknown;
  status?: "draft" | "published";
  appliesTax?: boolean;
  taxValue?: number | null;
  appliesShipping?: boolean;
  pages?: number | null;
  keywords?: string[];
  tags?: string[];
  isNew?: boolean;
  visible?: boolean;
  inventory?: number;
}

/**
 * Servicio de sincronización unidireccional Payload → NestJS.
 * Reutiliza PrismaService existente: no crea segunda conexión a PostgreSQL.
 * Operaciones idempotentes mediante upsert por payloadId.
 */
@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea o actualiza un producto sincronizado desde Payload.
   * Idempotente: mismo payloadId actualiza el registro existente.
   */
  async upsertProduct(data: SyncProductInput) {
    try {
      // Resolver categoryId a partir de categoryPayloadId si se proporciona.
      // Si la categoría no existe en PostgreSQL, se deja categoryId=null y se registra advertencia.
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
            `Categoría con payloadId=${data.categoryPayloadId} no encontrada en PostgreSQL. Producto payloadId=${data.payloadId} se sincronizará sin categoría (categoryId=null).`,
          );
        }
      }

      const result = await this.prisma.product.upsert({
        where: { payloadId: data.payloadId },
        update: {
          title: data.title,
          slug: data.slug,
          isbn: data.isbn,
          author: data.author,
          price: data.price,
          imageUrl: data.imageUrl ?? null,
          categoryName: data.categoryName ?? null,
          categoryId,
          weight: data.weight ?? null,
          width: data.width ?? null,
          height: data.height ?? null,
          description:
            data.description === null
              ? Prisma.DbNull
              : data.description ?? Prisma.DbNull,
          status: data.status ?? "draft",
          appliesTax: data.appliesTax ?? false,
          taxValue: data.taxValue ?? null,
          appliesShipping: data.appliesShipping ?? false,
          pages: data.pages ?? null,
          keywords: data.keywords ?? [],
          tags: data.tags ?? [],
          isNew: data.isNew ?? false,
          visible: data.visible ?? true,
          inventory: data.inventory ?? 0,
        },
        create: {
          payloadId: data.payloadId,
          title: data.title,
          slug: data.slug,
          isbn: data.isbn,
          author: data.author,
          price: data.price,
          imageUrl: data.imageUrl ?? null,
          categoryName: data.categoryName ?? null,
          categoryId,
          weight: data.weight ?? null,
          width: data.width ?? null,
          height: data.height ?? null,
          description:
            data.description === null
              ? Prisma.DbNull
              : data.description ?? Prisma.DbNull,
          status: data.status ?? "draft",
          appliesTax: data.appliesTax ?? false,
          taxValue: data.taxValue ?? null,
          appliesShipping: data.appliesShipping ?? false,
          pages: data.pages ?? null,
          keywords: data.keywords ?? [],
          tags: data.tags ?? [],
          isNew: data.isNew ?? false,
          visible: data.visible ?? true,
          inventory: data.inventory ?? 0,
        },
      });

      this.logger.log(
        `Producto sincronizado: payloadId=${data.payloadId}, id=${result.id}`,
      );

      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = (error.meta?.target as string[]) ?? [];
          this.logger.warn(
            `Conflicto de unicidad sincronizando payloadId=${data.payloadId}: ${target.join(", ")}`,
          );
          throw new ConflictException(
            `Conflicto de datos al sincronizar producto payloadId ${data.payloadId}: campo único duplicado (${target.join(", ")}).`,
          );
        }
      }
      this.logger.error(`Error sincronizando payloadId=${data.payloadId}`, error);
      throw error;
    }
  }

  /**
   * Desactivación lógica de un producto eliminado en Payload.
   * Nunca borra físicamente: pone visible=false y status='draft'.
   */
  async deactivateProduct(payloadId: number) {
    const product = await this.prisma.product.findUnique({
      where: { payloadId },
    });
    if (!product) {
      this.logger.warn(
        `Intento de desactivar producto inexistente: payloadId=${payloadId}`,
      );
      throw new NotFoundException(
        `Producto con payloadId ${payloadId} no encontrado`,
      );
    }

    return this.prisma.product.update({
      where: { payloadId },
      data: {
        visible: false,
        status: "draft",
      },
    });
  }
}
