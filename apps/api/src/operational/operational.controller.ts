import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OperationalService } from './operational.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('operational')
export class OperationalController {
  constructor(private svc: OperationalService) {}

  @Get()
  getData(@Query('periodId') periodId?: string) {
    return this.svc.getData(periodId);
  }
}
