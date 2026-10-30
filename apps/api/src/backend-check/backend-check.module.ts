import { Module } from "@nestjs/common";
import { BackendCheckController } from "./backend-check.controller";
import { BackendCheckService } from "./backend-check.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [BackendCheckController],
  providers: [BackendCheckService],
  exports: [BackendCheckService],
})
export class BackendCheckModule {}
