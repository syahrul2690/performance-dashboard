import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OrganisasiService } from './organisasi.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('organisasi')
export class OrganisasiController {
  constructor(private svc: OrganisasiService) {}

  @Get()
  getData(@Query('periodId') periodId?: string) {
    return this.svc.getData(periodId);
  }
}
