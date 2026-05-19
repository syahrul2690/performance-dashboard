import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StrategicService } from './strategic.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('strategic')
export class StrategicController {
  constructor(private svc: StrategicService) {}

  @Get()
  getData(@Query('periodId') periodId?: string) {
    return this.svc.getData(periodId);
  }
}
