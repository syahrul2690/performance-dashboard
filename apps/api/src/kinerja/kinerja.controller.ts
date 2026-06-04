import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { KinerjaService } from './kinerja.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('kinerja')
export class KinerjaController {
  constructor(private svc: KinerjaService) {}

  @Get('rekap')
  rekap(@Query('periodId') periodId?: string) {
    return this.svc.getRekap(periodId);
  }

  // Periode terbaru yang memiliki realisasi DISETUJUI — untuk default tampilan dashboard.
  @Get('latest-period')
  latestPeriod() {
    return this.svc.getLatestPeriodWithData();
  }
}
