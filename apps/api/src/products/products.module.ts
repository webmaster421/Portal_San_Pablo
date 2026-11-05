import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ProductController } from "./products.controller";
import { ProductService } from "./products.service";
import { SyncController } from "./sync/sync.controller";
import { SyncService } from "./sync/sync.service";

@Module({
  imports: [PrismaModule], // Reutiliza PrismaService: no crea una segunda conexión a PostgreSQL
  controllers: [ProductController, SyncController],
  providers: [ProductService, SyncService],
  exports: [ProductService, SyncService],
})
export class ProductModule {}
