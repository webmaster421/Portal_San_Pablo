import { Controller, Get } from "@nestjs/common";
import { BackendCheckService } from "./backend-check.service";

@Controller("backend-check")
export class BackendCheckController {
  constructor(private readonly backendCheckService: BackendCheckService) {}

  @Get()
  async findAll() {
    return this.backendCheckService.findAll();
  }
}
