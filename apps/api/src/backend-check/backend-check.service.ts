import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BackendCheckService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.backendCheck.findMany({
      orderBy: { id: "desc" },
    });
  }
}
