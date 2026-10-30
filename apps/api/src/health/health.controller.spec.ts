import { Test } from "@nestjs/testing";
import { HealthController } from "./health.controller";
import { PrismaService } from "../prisma/prisma.service";

describe("HealthController", () => {
  let controller: HealthController;
  const prismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    controller = moduleRef.get<HealthController>(HealthController);
  });

  it("devuelve ok cuando la base de datos está disponible", async () => {
    prismaService.$queryRaw.mockResolvedValue([1]);

    await expect(controller.check()).resolves.toEqual({
      status: "ok",
      info: { database: { status: "up" } },
    });

    expect(prismaService.$queryRaw).toHaveBeenCalled();
  });

  it("lanza error cuando la base de datos no está disponible", async () => {
    prismaService.$queryRaw.mockRejectedValue(new Error("database down"));

    await expect(controller.check()).rejects.toThrow();
  });
});
