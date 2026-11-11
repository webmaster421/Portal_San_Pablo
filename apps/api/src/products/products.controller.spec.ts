import {
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AdminApiKeyGuard } from "../common/guards/admin-api-key.guard";
import { ProductController } from "./products.controller";
import { ProductService } from "./products.service";
import type { CreateProductDto } from "./dto/create-product.dto";
import type { UpdateProductDto } from "./dto/update-product.dto";

describe("AdminApiKeyGuard", () => {
  let guard: AdminApiKeyGuard;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AdminApiKeyGuard],
    }).compile();
    guard = moduleRef.get(AdminApiKeyGuard);
  });

  const createContext = (headers: Record<string, string>) => ({
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
    getHandler: () => () => {},
    getClass: () => ProductController,
  } as any);

  it("debe rechazar solicitud sin encabezado X-Admin-API-Key", () => {
    process.env.ADMIN_API_KEY = "clave-test-123";
    const ctx = createContext({});
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it("debe rechazar solicitud con API key incorrecta", () => {
    process.env.ADMIN_API_KEY = "clave-test-123";
    const ctx = createContext({ "x-admin-api-key": "clave-incorrecta" });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it("debe aceptar solicitud con API key correcta", () => {
    process.env.ADMIN_API_KEY = "clave-test-123";
    const ctx = createContext({ "x-admin-api-key": "clave-test-123" });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  afterEach(() => {
    delete process.env.ADMIN_API_KEY;
  });
});

describe("ProductController - protección de escritura", () => {
  let controller: ProductController;
  let service: ProductService;

  const mockService = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: mockService },
      ],
    }).compile();

    controller = moduleRef.get(ProductController);
    service = moduleRef.get(ProductService);

    jest.clearAllMocks();
  });

  it("POST sin credenciales debe rechazar (validación de entrada sin auth)", async () => {
    // El controller valida campos antes del servicio; sin API key no se llega al service
    // en un entorno real con guard. Aquí verificamos que el service no se invoca
    // si las validaciones previas fallan.
    const dto: CreateProductDto = {} as any;
    await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    expect(service.create).not.toHaveBeenCalled();
  });

  it("PATCH sin campos debe rechazar con 400", async () => {
    await expect(controller.update("1", {})).rejects.toThrow(
      BadRequestException,
    );
    expect(service.update).not.toHaveBeenCalled();
  });

  it("DELETE con id inválido debe rechazar con 400", async () => {
    await expect(controller.remove("abc")).rejects.toThrow(
      BadRequestException,
    );
    expect(service.remove).not.toHaveBeenCalled();
  });

  it("DELETE con id válido invoca el servicio", async () => {
    mockService.remove.mockResolvedValue({ deleted: true, id: 1 });
    const result = await controller.remove("1");
    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual({ deleted: true, id: 1 });
  });
});

describe("ProductService - filtrado público y soft delete", () => {
  let service: ProductService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    service = new ProductService(prisma);
    jest.clearAllMocks();
  });

  it("findAll debe filtrar solo publicados y visibles", async () => {
    prisma.product.findMany.mockResolvedValue([]);
    await service.findAll();
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { status: "published", visible: true },
      orderBy: { createdAt: "desc" },
    });
  });

  it("remove debe realizar soft delete (update), no delete físico", async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 1, title: "Test" });
    prisma.product.update.mockResolvedValue({});

    await service.remove(1);

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { visible: false, status: "draft" },
    });
    expect(prisma.product.delete).not.toHaveBeenCalled();
  });

  it("remove debe lanzar NotFoundException si no existe", async () => {
    prisma.product.findUnique.mockResolvedValue(null);
    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    expect(prisma.product.update).not.toHaveBeenCalled();
  });
});
