import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<{ status: string; info: { database: { status: string } } }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ok", info: { database: { status: "up" } } };
    } catch {
      throw new ServiceUnavailableException(
        "El servicio de base de datos no está disponible",
      );
    }
  }
}
