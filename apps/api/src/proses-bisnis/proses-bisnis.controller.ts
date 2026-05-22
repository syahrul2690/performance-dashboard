import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProsesBisnisService } from './proses-bisnis.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('proses-bisnis')
export class ProsesBisnisController {
  constructor(private svc: ProsesBisnisService) {}

  @Get()
  getData(@Query('periodId') periodId?: string) {
    return this.svc.getData(periodId);
  }
}
