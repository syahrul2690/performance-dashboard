import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { InputRealisasiService } from './input-realisasi.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { IsObject, IsString } from 'class-validator';

class SubmitDto {
  @IsString() unitCode: string;
  @IsObject() values: Record<string, unknown>;
}

@UseGuards(JwtAuthGuard)
@Controller('input-realisasi')
export class InputRealisasiController {
  constructor(private svc: InputRealisasiService) {}

  @Get('history')
  history(@Query('unitCode') unitCode?: string, @Query('periodId') periodId?: string) {
    return this.svc.getHistory(unitCode, periodId);
  }

  @Put('submit')
  submit(@CurrentUser() user: User, @Body() dto: SubmitDto) {
    return this.svc.submit(user, dto.unitCode, dto.values);
  }
}
