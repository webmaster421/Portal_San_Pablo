import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log("Conexión a PostgreSQL establecida.");
    } catch (error) {
      // La API debe arrancar aunque la BD esté no disponible: el health
      // endpoint reportará el estado del servicio de base de datos.
      this.logger.error(
        "No se pudo establecer la conexión a PostgreSQL.",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
