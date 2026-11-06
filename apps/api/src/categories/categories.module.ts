import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CategoriesController } from "./categories.controller";
import { CategorySyncController } from "./category-sync.controller";
import { CategoryService } from "./categories.service";

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController, CategorySyncController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoriesModule {}
