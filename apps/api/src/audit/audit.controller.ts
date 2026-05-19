import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.GM, Role.SRMANAJER)
@Controller('audit')
export class AuditController {
  constructor(private svc: AuditService) {}

  @Get()
  getLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.svc.getLogs(Number(page), Number(limit));
  }
}
