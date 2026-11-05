import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import type { CreateProductDto } from "./dto/create-product.dto";
import type { UpdateProductDto } from "./dto/update-product.dto";

/**
 * Servicio de productos.
 * Reutiliza exclusivamente el PrismaService existente: no crea una segunda conexión a PostgreSQL.
 */
@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista todos los productos.
   * Nota: el filtrado por status="published" y visible=true se añadirá cuando
   * se definan formalmente los estados comerciales. Por ahora devuelve todos.
   */
  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Consulta un producto por su ID interno de PostgreSQL.
   * Lanza NotFoundException si no existe.
   */
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    return product;
  }

  /**
   * Consulta un producto por su slug.
   * Devuelve null si no existe (no lanza excepción: el llamante decide cómo manejarlo).
   */
  async findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
    });
  }

  /**
   * Crea un producto.
   * Maneja errores de unicidad (slug, isbn, payloadId) y los traduce a ConflictException.
   * No asigna campos internos (id, createdAt, updatedAt) de forma indiscriminada.
   * payloadId es obligatorio porque la columna en PostgreSQL es NOT NULL.
   */
  async create(data: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: this.buildCreateInput(data),
      });
    } catch (error) {
      return this.handlePrismaError(error, "crear");
    }
  }

  /**
   * Actualiza un producto existente por ID.
   * Valida existencia antes de actualizar.
   * Excluye id, payloadId, createdAt, updatedAt de la actualización.
   * Maneja errores de unicidad (slug, isbn).
   */
  async update(id: number, data: UpdateProductDto) {
    // Validar existencia
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data: this.buildUpdateInput(data),
      });
    } catch (error) {
      return this.handlePrismaError(error, "actualizar");
    }
  }

  /**
   * Eliminación segura de un producto.
   * Valida existencia antes de eliminar: no borra indiscriminadamente.
   * Devuelve un indicador booleano de eliminación exitosa.
   */
  async remove(id: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { deleted: true, id };
  }

  // ------------------------------------------------------------------
  // Constructores de objetos de entrada para Prisma.
  // Filtran valores undefined para evitar errores de validación de Prisma.
  // ------------------------------------------------------------------

  private buildCreateInput(data: CreateProductDto) {
    const input: Record<string, unknown> = {
      title: data.title,
      slug: data.slug,
      isbn: data.isbn,
      author: data.author,
      price: data.price,
      payloadId: data.payloadId,
      status: data.status ?? "draft",
      appliesTax: data.appliesTax ?? false,
      appliesShipping: data.appliesShipping ?? false,
      isNew: data.isNew ?? false,
      visible: data.visible ?? true,
      inventory: data.inventory ?? 0,
      keywords: data.keywords ?? [],
      tags: data.tags ?? [],
    };

    if (data.imageUrl !== undefined) input["imageUrl"] = data.imageUrl;
    if (data.categoryName !== undefined)
      input["categoryName"] = data.categoryName;
    if (data.weight !== undefined) input["weight"] = data.weight;
    if (data.width !== undefined) input["width"] = data.width;
    if (data.height !== undefined) input["height"] = data.height;
    if (data.description !== undefined)
      input["description"] = data.description === null
        ? Prisma.DbNull
        : data.description;
    if (data.taxValue !== undefined) input["taxValue"] = data.taxValue;
    if (data.pages !== undefined) input["pages"] = data.pages;

    return input as Prisma.ProductCreateInput;
  }

  private buildUpdateInput(data: UpdateProductDto) {
    const input: Record<string, unknown> = {};

    if (data.title !== undefined) input["title"] = data.title;
    if (data.slug !== undefined) input["slug"] = data.slug;
    if (data.isbn !== undefined) input["isbn"] = data.isbn;
    if (data.author !== undefined) input["author"] = data.author;
    if (data.price !== undefined) input["price"] = data.price;
    if (data.imageUrl !== undefined) input["imageUrl"] = data.imageUrl;
    if (data.categoryName !== undefined)
      input["categoryName"] = data.categoryName;
    if (data.weight !== undefined) input["weight"] = data.weight;
    if (data.width !== undefined) input["width"] = data.width;
    if (data.height !== undefined) input["height"] = data.height;
    if (data.description !== undefined)
      input["description"] = data.description === null
        ? Prisma.DbNull
        : data.description;
    if (data.status !== undefined) input["status"] = data.status;
    if (data.appliesTax !== undefined) input["appliesTax"] = data.appliesTax;
    if (data.taxValue !== undefined) input["taxValue"] = data.taxValue;
    if (data.appliesShipping !== undefined)
      input["appliesShipping"] = data.appliesShipping;
    if (data.pages !== undefined) input["pages"] = data.pages;
    if (data.keywords !== undefined) input["keywords"] = data.keywords;
    if (data.tags !== undefined) input["tags"] = data.tags;
    if (data.isNew !== undefined) input["isNew"] = data.isNew;
    if (data.visible !== undefined) input["visible"] = data.visible;
    if (data.inventory !== undefined) input["inventory"] = data.inventory;

    return input as Prisma.ProductUpdateInput;
  }

  /**
   * Traduce errores de Prisma a excepciones de NestJS con mensajes claros.
   * - P2002: restricción de unicidad violada (slug, isbn, payloadId duplicados).
   * - P2025: registro no encontrado.
   */
  private handlePrismaError(error: unknown, operation: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002": {
          const target = (error.meta?.target as string[]) ?? [];
          const campo = target.join(", ") || "campo";
          throw new ConflictException(
            `No se pudo ${operation} el producto: ya existe un registro con el mismo ${campo} (slug, isbn o payloadId duplicados).`,
          );
        }
        case "P2025":
          throw new NotFoundException(
            `No se pudo ${operation} el producto: el registro ya no existe.`,
          );
        default:
          this.logger.error(
            `Error de Prisma al ${operation}: ${error.message}`,
            error.stack,
          );
          throw new BadRequestException(
            `Error de base de datos al ${operation} el producto.`,
          );
      }
    }

    this.logger.error(`Error inesperado al ${operation}: ${String(error)}`);
    throw new BadRequestException(
      `Error inesperado al ${operation} el producto.`,
    );
  }
}
