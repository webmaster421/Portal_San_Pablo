import { Module } from "@nestjs/common";
import { BackendCheckModule } from "./backend-check/backend-check.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [HealthModule, BackendCheckModule, PrismaModule],
})
export class AppModule {}
