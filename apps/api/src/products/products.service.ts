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

export type CategoryProductSort =
  | "popular"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc";

export interface FindByCategoryQuery {
  page?: number;
  limit?: number;
  sort?: CategoryProductSort;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  features?: string[];
}

export interface CategoryProductsMeta {
  priceBounds: {
    min: number;
    max: number;
    hasValidPrices: boolean;
    allSame: boolean;
  };
  availableTags: string[];
}

export interface PaginatedCategoryProducts {
  products: Prisma.ProductGetPayload<object>[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  meta: CategoryProductsMeta;
}

/**
 * Servicio de productos.
 * Reutiliza exclusivamente el PrismaService existente: no crea una segunda conexión a PostgreSQL.
 */
@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista productos para el catálogo público.
   * Devuelve exclusivamente productos publicados y visibles.
   * Los borradores y productos ocultos no se exponen públicamente.
   */
  async findAll() {
    return this.prisma.product.findMany({
      where: { status: "published", visible: true },
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
   * Lista productos publicados y visibles de una categoría específica.
   * Devuelve productos ordenados por fecha de creación descendente.
   */
  /**
   * Lista productos publicados y visibles de una categor��a espec��fica con paginaci��n,
   * filtros y ordenamiento. Incluye metadatos globales de la categor��a para la UI de filtros.
   */
  async findByCategory(
    categoryId: number,
    query: FindByCategoryQuery = {},
  ): Promise<PaginatedCategoryProducts> {
    const page = Number.isFinite(query.page) && (query.page ?? 0) > 0 ? Math.floor(query.page!) : 1;
    const rawLimit = Number.isFinite(query.limit) && (query.limit ?? 0) > 0 ? Math.floor(query.limit!) : 12;
    const limit = Math.min(Math.max(rawLimit, 1), 100);

    const baseWhere: Prisma.ProductWhereInput = {
      categoryId,
      status: "published",
      visible: true,
      // Solo productos asignados directamente a la categoría principal.
      // Los productos asignados a subcategorías no deben mostrarse en la categoría padre.
      subcategories: {
        none: {},
      },
    };

    const andConditions: Prisma.ProductWhereInput[] = [];

    const search = query.search?.trim();
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { isbn: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const hasMin = typeof query.minPrice === "number" && Number.isFinite(query.minPrice);
    const hasMax = typeof query.maxPrice === "number" && Number.isFinite(query.maxPrice);
    if (hasMin || hasMax) {
      const priceFilter: Prisma.IntFilter = {};
      if (hasMin) priceFilter.gte = query.minPrice as number;
      if (hasMax) priceFilter.lte = query.maxPrice as number;
      andConditions.push({ price: priceFilter });
    }

    const tags = (query.tags ?? []).map((t) => t.trim()).filter(Boolean);
    if (tags.length > 0) {
      andConditions.push({
        OR: [{ tags: { hasSome: tags } }, { keywords: { hasSome: tags } }],
      });
    }

    const features = (query.features ?? []).map((f) => f.trim()).filter(Boolean);
    if (features.includes("new")) {
      andConditions.push({ isNew: true });
    }

    const where: Prisma.ProductWhereInput =
      andConditions.length > 0 ? { AND: [baseWhere, ...andConditions] } : baseWhere;

    const orderBy = this.resolveCategorySort(query.sort);

    const skip = (page - 1) * limit;

    const [total, products, meta] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.getCategoryFiltersMeta(baseWhere),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      products,
      total,
      totalPages,
      page,
      limit,
      meta,
    };
  }

  /**
   * Lista productos publicados y visibles asociados a una subcategoría publicada,
   * con paginación, filtros y ordenamiento compatibles con el catálogo por categoría.
   */
  async findBySubcategory(
    subcategoryId: number,
    query: FindByCategoryQuery = {},
  ): Promise<PaginatedCategoryProducts> {
    const subcategory = await this.prisma.subcategory.findFirst({
      where: { id: subcategoryId, published: true },
      select: { id: true },
    });

    if (!subcategory) {
      throw new NotFoundException(`Subcategoría con id ${subcategoryId} no encontrada`);
    }

    const page = Number.isFinite(query.page) && (query.page ?? 0) > 0 ? Math.floor(query.page!) : 1;
    const rawLimit = Number.isFinite(query.limit) && (query.limit ?? 0) > 0 ? Math.floor(query.limit!) : 12;
    const limit = Math.min(Math.max(rawLimit, 1), 100);

    const baseWhere: Prisma.ProductWhereInput = {
      status: "published",
      visible: true,
      subcategories: {
        some: {
          id: subcategoryId,
          published: true,
        },
      },
    };

    const andConditions: Prisma.ProductWhereInput[] = [];

    const search = query.search?.trim();
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { isbn: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const hasMin = typeof query.minPrice === "number" && Number.isFinite(query.minPrice);
    const hasMax = typeof query.maxPrice === "number" && Number.isFinite(query.maxPrice);
    if (hasMin || hasMax) {
      const priceFilter: Prisma.IntFilter = {};
      if (hasMin) priceFilter.gte = query.minPrice as number;
      if (hasMax) priceFilter.lte = query.maxPrice as number;
      andConditions.push({ price: priceFilter });
    }

    const tags = (query.tags ?? []).map((t) => t.trim()).filter(Boolean);
    if (tags.length > 0) {
      andConditions.push({
        OR: [{ tags: { hasSome: tags } }, { keywords: { hasSome: tags } }],
      });
    }

    const features = (query.features ?? []).map((f) => f.trim()).filter(Boolean);
    if (features.includes("new")) {
      andConditions.push({ isNew: true });
    }

    const where: Prisma.ProductWhereInput =
      andConditions.length > 0 ? { AND: [baseWhere, ...andConditions] } : baseWhere;

    const orderBy = this.resolveCategorySort(query.sort);
    const skip = (page - 1) * limit;

    const [total, products, meta] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.getCategoryFiltersMeta(baseWhere),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      products,
      total,
      totalPages,
      page,
      limit,
      meta,
    };
  }

  private resolveCategorySort(
    sort?: CategoryProductSort,
  ): Prisma.ProductOrderByWithRelationInput {
    switch (sort) {
      case "price-asc":
        return { price: "asc" };
      case "price-desc":
        return { price: "desc" };
      case "name-asc":
        return { title: "asc" };
      case "newest":
      case "popular":
      default:
        return { createdAt: "desc" };
    }
  }

  private async getCategoryFiltersMeta(
    baseWhere: Prisma.ProductWhereInput,
  ): Promise<CategoryProductsMeta> {
    const [priceAgg, tagRows] = await Promise.all([
      this.prisma.product.aggregate({
        where: baseWhere,
        _min: { price: true },
        _max: { price: true },
        _count: { _all: true },
      }),
      this.prisma.product.findMany({
        where: baseWhere,
        select: { tags: true, keywords: true },
      }),
    ]);

    const count = priceAgg._count._all ?? 0;
    const minPrice = priceAgg._min.price;
    const maxPrice = priceAgg._max.price;
    const hasValidPrices = count > 0 && minPrice !== null && maxPrice !== null;
    const boundsMin = 0;
    const boundsMax = hasValidPrices ? (maxPrice as number) : 0;

    const seen = new Set<string>();
    const availableTags: string[] = [];
    for (const row of tagRows) {
      const values = [...(row.tags ?? []), ...(row.keywords ?? [])];
      for (const value of values) {
        if (typeof value !== "string") continue;
        const trimmed = value.trim();
        if (!trimmed) continue;
        const key = trimmed.toLocaleLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        availableTags.push(trimmed);
      }
    }
    availableTags.sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

    return {
      priceBounds: {
        min: boundsMin,
        max: boundsMax,
        hasValidPrices,
        allSame: hasValidPrices ? boundsMax === 0 : false,
      },
      availableTags,
    };
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
   * Eliminación lógica de un producto (soft delete).
   * Valida existencia antes de desactivar: no borra físicamente.
   * Pone visible=false y status='draft', preservando el registro histórico.
   * Devuelve un indicador de desactivación exitosa.
   */
  async remove(id: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    await this.prisma.product.update({
      where: { id },
      data: { visible: false, status: "draft" },
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
      author: data.author ?? null,
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
