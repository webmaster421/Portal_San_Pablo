import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SubcategoriesController } from "./subcategories.controller";
import { SubcategorySyncController } from "./subcategory-sync.controller";
import { SubcategoriesService } from "./subcategories.service";

@Module({
  imports: [PrismaModule],
  controllers: [SubcategoriesController, SubcategorySyncController],
  providers: [SubcategoriesService],
  exports: [SubcategoriesService],
})
export class SubcategoriesModule {}
