import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { KpiService } from './kpi.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('kpi')
export class KpiController {
  constructor(private svc: KpiService) {}

  @Get('deepdive')
  list() { return this.svc.listKpiIds(); }

  @Get('deepdive/:id')
  deepDive(@Param('id') id: string) { return this.svc.getDeepDive(id); }
}
