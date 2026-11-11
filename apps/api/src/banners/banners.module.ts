import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { BannersController } from "./banners.controller";
import { BannerSyncController } from "./banner-sync.controller";
import { BannersService } from "./banners.service";

@Module({
  imports: [PrismaModule],
  controllers: [BannersController, BannerSyncController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}
