import { Controller, Get, UseGuards } from '@nestjs/common';
import { MetaService } from './meta.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('meta')
export class MetaController {
  constructor(private meta: MetaService) {}

  @Get('period')
  activePeriod() { return this.meta.getActivePeriod(); }

  @Get('periods')
  periods() { return this.meta.getPeriods(); }

  @Get('role-variants')
  roleVariants() { return this.meta.getRoleVariants(); }
}
