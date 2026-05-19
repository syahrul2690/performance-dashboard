import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ExecutiveService } from './executive.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('executive')
export class ExecutiveController {
  constructor(private svc: ExecutiveService) {}

  @Get('summary')
  summary(@Query('periodId') periodId?: string) {
    return this.svc.getSummary(periodId);
  }
}
