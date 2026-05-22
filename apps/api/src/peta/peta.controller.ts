import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PetaService } from './peta.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('peta')
export class PetaController {
  constructor(private svc: PetaService) {}

  @Get()
  getData(@Query('periodId') periodId?: string) {
    return this.svc.getData(periodId);
  }
}
