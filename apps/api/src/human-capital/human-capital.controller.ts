import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { HumanCapitalService } from './human-capital.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('human-capital')
export class HumanCapitalController {
  constructor(private svc: HumanCapitalService) {}

  @Get()
  getData(@Query('periodId') periodId?: string) {
    return this.svc.getData(periodId);
  }
}
