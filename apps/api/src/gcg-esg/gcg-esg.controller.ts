import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GcgEsgService } from './gcg-esg.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('gcg-esg')
export class GcgEsgController {
  constructor(private svc: GcgEsgService) {}

  @Get()
  getData(@Query('periodId') periodId?: string) {
    return this.svc.getData(periodId);
  }
}
