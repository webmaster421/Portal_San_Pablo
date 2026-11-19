import { BadRequestException, Controller, Get, Param, Query } from "@nestjs/common";
import { SubcategoriesService } from "./subcategories.service";

@Controller("subcategories")
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Get()
  async findAll(
    @Query("categoryId") categoryId?: string,
    @Query("showOnHome") showOnHome?: string,
  ) {
    const parsedCategoryId =
      categoryId !== undefined && categoryId !== "" ? Number(categoryId) : undefined;

    if (parsedCategoryId !== undefined && !Number.isFinite(parsedCategoryId)) {
      throw new BadRequestException("categoryId debe ser un número válido");
    }

    const parsedShowOnHome =
      showOnHome === undefined
        ? undefined
        : showOnHome === "true"
          ? true
          : showOnHome === "false"
            ? false
            : undefined;

    if (showOnHome !== undefined && parsedShowOnHome === undefined) {
      throw new BadRequestException("showOnHome debe ser true o false");
    }

    return this.subcategoriesService.findPublished({
      categoryId: parsedCategoryId,
      showOnHome: parsedShowOnHome,
    });
  }

  @Get("slug/:slug")
  async findBySlug(@Param("slug") slug: string) {
    return this.subcategoriesService.findPublishedBySlug(slug);
  }

  @Get("category/:categoryId")
  async findByCategory(@Param("categoryId") categoryId: string) {
    const idNum = Number(categoryId);
    if (!Number.isFinite(idNum)) {
      throw new BadRequestException("categoryId debe ser un número válido");
    }
    return this.subcategoriesService.findPublished({ categoryId: idNum });
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) {
      throw new BadRequestException("El id debe ser un número válido");
    }
    return this.subcategoriesService.findOnePublished(idNum);
  }
}
