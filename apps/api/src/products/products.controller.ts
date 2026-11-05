import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { ProductService } from "./products.service";
import type { CreateProductDto } from "./dto/create-product.dto";
import type { UpdateProductDto } from "./dto/update-product.dto";

/**
 * Controlador de productos.
 * Rutas bajo el prefijo global api/v1 (configurado en main.ts).
 *
 * Seguridad: las operaciones de escritura (POST, PATCH, DELETE) deberían protegerse
 * con autenticación antes de exponerse en producción. Actualmente no existe un
 * sistema de autenticación en NestJS; se deja como pendiente de implementar.
 */
@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /// Listado de productos (GET /api/v1/products)
  @Get()
  async findAll() {
    return this.productService.findAll();
  }

  /// Consulta por slug (GET /api/v1/products/slug/:slug)
  /// Se define antes que :id para evitar que "/slug/..." coincida con el parámetro :id.
  @Get("slug/:slug")
  async findBySlug(@Param("slug") slug: string) {
    const product = await this.productService.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Producto con slug "${slug}" no encontrado`);
    }
    return product;
  }

  /// Consulta por ID (GET /api/v1/products/:id)
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) {
      throw new BadRequestException("El id debe ser un número válido");
    }
    return this.productService.findOne(idNum);
  }

  /// Creación de producto (POST /api/v1/products)
  @Post()
  async create(@Body() data: CreateProductDto) {
    // Validación básica de campos obligatorios
    if (!data.title || !data.slug || !data.isbn || !data.author) {
      throw new BadRequestException(
        "title, slug, isbn y author son campos obligatorios",
      );
    }
    if (!Number.isFinite(data.price)) {
      throw new BadRequestException("price debe ser un número válido");
    }

    try {
      return await this.productService.create(data);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  /// Actualización de producto (PATCH /api/v1/products/:id)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() data: UpdateProductDto) {
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) {
      throw new BadRequestException("El id debe ser un número válido");
    }

    // Validar que haya al menos un campo para actualizar
    const updateFields = Object.keys(data);
    if (updateFields.length === 0) {
      throw new BadRequestException(
        "Se debe proporcionar al menos un campo para actualizar",
      );
    }

    return this.productService.update(idNum, data);
  }

  /// Eliminación segura de producto (DELETE /api/v1/products/:id)
  @Delete(":id")
  async remove(@Param("id") id: string) {
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) {
      throw new BadRequestException("El id debe ser un número válido");
    }

    return this.productService.remove(idNum);
  }
}
